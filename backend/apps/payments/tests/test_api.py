from decimal import Decimal
from unittest.mock import patch

import pytest
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.orders.models import Order
from apps.payments.models import Payment

# ============================================================
# Fixtures
# ============================================================


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="customer@gidora.com",
        password="password123",
        first_name="Gidora",
        last_name="Customer",
        phone_number="08123456789",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="other@gidora.com",
        password="password123",
        first_name="Other",
        last_name="Customer",
        phone_number="08123456788",
    )


@pytest.fixture
def order(user):
    return Order.objects.create(
        user=user,
        status=Order.Status.PENDING,
        subtotal=Decimal("500000"),
        discount_amount=Decimal("0"),
        shipping_amount=Decimal("15000"),
        shipping_method_code="JNE_REG",
        shipping_courier="JNE",
        shipping_service="REG",
        tax_amount=Decimal("0"),
        total_amount=Decimal("515000"),
        currency="IDR",
    )


@pytest.fixture
def payment(order):
    return Payment.objects.create(
        order=order,
        provider=Payment.Provider.MIDTRANS,
        payment_method=Payment.PaymentMethod.BCA_VA,
        status=Payment.Status.PENDING,
        transaction_id="midtrans-transaction-001",
        amount=order.total_amount,
        currency="IDR",
        bank="bca",
        va_number="1234567890",
    )


# ============================================================
# Payment Create API
# ============================================================


@pytest.mark.django_db
@patch("apps.payments.views.create_payment")
def test_create_payment_success(
    mock_create_payment,
    api_client,
    user,
    order,
    payment,
):
    api_client.force_authenticate(user=user)

    mock_create_payment.return_value = payment

    response = api_client.post(
        "/api/v1/payments/",
        {
            "order_number": order.order_number,
            "payment_method": Payment.PaymentMethod.BCA_VA,
        },
        format="json",
    )

    assert response.status_code == 201

    assert response.data["order_number"] == order.order_number
    assert response.data["payment_method"] == "BCA_VA"
    assert response.data["status"] == "PENDING"
    assert response.data["transaction_id"] == ("midtrans-transaction-001")
    assert response.data["bank"] == "bca"
    assert response.data["va_number"] == "1234567890"

    mock_create_payment.assert_called_once_with(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
    )


@pytest.mark.django_db
def test_create_payment_requires_authentication(
    api_client,
    order,
):
    response = api_client.post(
        "/api/v1/payments/",
        {
            "order_number": order.order_number,
            "payment_method": Payment.PaymentMethod.BCA_VA,
        },
        format="json",
    )

    assert response.status_code == 401


@pytest.mark.django_db
@patch("apps.payments.views.create_payment")
def test_create_payment_rejects_other_users_order(
    mock_create_payment,
    api_client,
    user,
    other_user,
    order,
):
    api_client.force_authenticate(user=other_user)

    response = api_client.post(
        "/api/v1/payments/",
        {
            "order_number": order.order_number,
            "payment_method": Payment.PaymentMethod.BCA_VA,
        },
        format="json",
    )

    assert response.status_code == 404
    assert response.data == {
        "detail": "Order not found.",
    }

    mock_create_payment.assert_not_called()


@pytest.mark.django_db
@patch("apps.payments.views.create_payment")
def test_create_payment_rejects_unknown_order(
    mock_create_payment,
    api_client,
    user,
):
    api_client.force_authenticate(user=user)

    response = api_client.post(
        "/api/v1/payments/",
        {
            "order_number": "GDR-20990101-9999",
            "payment_method": Payment.PaymentMethod.BCA_VA,
        },
        format="json",
    )

    assert response.status_code == 404
    assert response.data == {
        "detail": "Order not found.",
    }

    mock_create_payment.assert_not_called()


@pytest.mark.django_db
def test_create_payment_requires_order_number(
    api_client,
    user,
):
    api_client.force_authenticate(user=user)

    response = api_client.post(
        "/api/v1/payments/",
        {
            "payment_method": Payment.PaymentMethod.BCA_VA,
        },
        format="json",
    )

    assert response.status_code == 400
    assert "order_number" in response.data


@pytest.mark.django_db
def test_create_payment_requires_payment_method(
    api_client,
    user,
    order,
):
    api_client.force_authenticate(user=user)

    response = api_client.post(
        "/api/v1/payments/",
        {
            "order_number": order.order_number,
        },
        format="json",
    )

    assert response.status_code == 400
    assert "payment_method" in response.data


@pytest.mark.django_db
def test_create_payment_rejects_invalid_payment_method(
    api_client,
    user,
    order,
):
    api_client.force_authenticate(user=user)

    response = api_client.post(
        "/api/v1/payments/",
        {
            "order_number": order.order_number,
            "payment_method": "INVALID",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "payment_method" in response.data


@pytest.mark.django_db
@patch("apps.payments.views.create_payment")
def test_create_payment_handles_service_validation_error(
    mock_create_payment,
    api_client,
    user,
    order,
):
    api_client.force_authenticate(user=user)

    mock_create_payment.side_effect = ValidationError(
        {
            "payment": "Payment could not be created.",
        }
    )

    response = api_client.post(
        "/api/v1/payments/",
        {
            "order_number": order.order_number,
            "payment_method": Payment.PaymentMethod.BCA_VA,
        },
        format="json",
    )

    assert response.status_code == 400
    assert response.data == {
        "payment": [
            "Payment could not be created.",
        ],
    }


# ============================================================
# Midtrans Notification API
# ============================================================


@pytest.mark.django_db
@patch("apps.payments.views.process_payment_notification")
@patch("apps.payments.views.MidtransClient")
def test_midtrans_notification_success(
    mock_midtrans_client,
    mock_process_notification,
    api_client,
):
    mock_client = mock_midtrans_client.return_value

    mock_client.verify_notification_signature.return_value = True

    payload = {
        "order_id": "GDR-20261001-0001",
        "transaction_id": "midtrans-transaction-001",
        "transaction_status": "settlement",
        "status_code": "200",
        "gross_amount": "515000.00",
        "currency": "IDR",
        "payment_type": "bank_transfer",
        "fraud_status": "accept",
        "signature_key": "valid-signature",
    }

    response = api_client.post(
        "/api/v1/payments/notification/",
        payload,
        format="json",
    )

    assert response.status_code == 200
    assert response.data == {
        "status": "OK",
    }

    mock_client.verify_notification_signature.assert_called_once()

    mock_process_notification.assert_called_once_with(
        payload=payload,
    )


@pytest.mark.django_db
@patch("apps.payments.views.process_payment_notification")
@patch("apps.payments.views.MidtransClient")
def test_midtrans_notification_rejects_invalid_signature(
    mock_midtrans_client,
    mock_process_notification,
    api_client,
):
    mock_client = mock_midtrans_client.return_value

    mock_client.verify_notification_signature.return_value = False

    payload = {
        "order_id": "GDR-20261001-0001",
        "status_code": "200",
        "gross_amount": "515000.00",
        "signature_key": "invalid-signature",
    }

    response = api_client.post(
        "/api/v1/payments/notification/",
        payload,
        format="json",
    )

    assert response.status_code == 403
    assert response.data == {
        "detail": "Invalid signature.",
    }

    mock_process_notification.assert_not_called()


@pytest.mark.django_db
@patch("apps.payments.views.MidtransClient")
def test_midtrans_notification_requires_signature_fields(
    mock_midtrans_client,
    api_client,
):
    payload = {
        "order_id": "GDR-20261001-0001",
        "status_code": "200",
        "gross_amount": "515000.00",
    }

    response = api_client.post(
        "/api/v1/payments/notification/",
        payload,
        format="json",
    )

    assert response.status_code == 400
    assert "signature_key" in response.data

    mock_midtrans_client.assert_not_called()


@pytest.mark.django_db
@patch("apps.payments.views.process_payment_notification")
@patch("apps.payments.views.MidtransClient")
def test_midtrans_notification_handles_payment_not_found(
    mock_midtrans_client,
    mock_process_notification,
    api_client,
):
    mock_client = mock_midtrans_client.return_value

    mock_client.verify_notification_signature.return_value = True

    mock_process_notification.side_effect = Payment.DoesNotExist

    payload = {
        "order_id": "GDR-20261001-0001",
        "transaction_status": "settlement",
        "status_code": "200",
        "gross_amount": "515000.00",
        "signature_key": "valid-signature",
    }

    response = api_client.post(
        "/api/v1/payments/notification/",
        payload,
        format="json",
    )

    assert response.status_code == 404
    assert response.data == {
        "detail": "Payment not found.",
    }


@pytest.mark.django_db
@patch("apps.payments.views.process_payment_notification")
@patch("apps.payments.views.MidtransClient")
def test_midtrans_notification_handles_validation_error(
    mock_midtrans_client,
    mock_process_notification,
    api_client,
):
    mock_client = mock_midtrans_client.return_value

    mock_client.verify_notification_signature.return_value = True

    mock_process_notification.side_effect = ValidationError(
        {
            "gross_amount": ("Midtrans gross_amount does not match " "the payment amount."),
        }
    )

    payload = {
        "order_id": "GDR-20261001-0001",
        "transaction_status": "settlement",
        "status_code": "200",
        "gross_amount": "515000.00",
        "signature_key": "valid-signature",
    }

    response = api_client.post(
        "/api/v1/payments/notification/",
        payload,
        format="json",
    )

    assert response.status_code == 400
    assert "gross_amount" in response.data


# ============================================================
# Payment Status Sync API
# ============================================================


@pytest.mark.django_db
@patch("apps.payments.views.process_payment_status")
@patch("apps.payments.views.MidtransClient")
def test_payment_status_sync_success(
    mock_midtrans_client,
    mock_process_payment_status,
    api_client,
    user,
    order,
    payment,
):
    api_client.force_authenticate(user=user)

    mock_client = mock_midtrans_client.return_value

    midtrans_status = {
        "order_id": order.order_number,
        "transaction_id": payment.transaction_id,
        "transaction_status": "pending",
        "status_code": "201",
        "gross_amount": "515000.00",
        "currency": "IDR",
    }

    mock_client.get_transaction_status.return_value = midtrans_status

    mock_process_payment_status.return_value = payment

    response = api_client.post(
        f"/api/v1/payments/orders/" f"{order.order_number}/sync/",
    )

    assert response.status_code == 200

    assert response.data["order_number"] == (order.order_number)
    assert response.data["status"] == "PENDING"

    mock_client.get_transaction_status.assert_called_once_with(
        order.order_number,
    )

    mock_process_payment_status.assert_called_once_with(
        payload=midtrans_status,
    )


@pytest.mark.django_db
def test_payment_status_sync_requires_authentication(
    api_client,
    order,
):
    response = api_client.post(
        f"/api/v1/payments/orders/" f"{order.order_number}/sync/",
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_payment_status_sync_rejects_other_users_order(
    api_client,
    other_user,
    order,
):
    api_client.force_authenticate(user=other_user)

    response = api_client.post(
        f"/api/v1/payments/orders/" f"{order.order_number}/sync/",
    )

    assert response.status_code == 404
    assert response.data == {
        "detail": "Order or payment not found.",
    }


@pytest.mark.django_db
def test_payment_status_sync_rejects_missing_payment(
    api_client,
    user,
    order,
):
    api_client.force_authenticate(user=user)

    response = api_client.post(
        f"/api/v1/payments/orders/" f"{order.order_number}/sync/",
    )

    assert response.status_code == 404
    assert response.data == {
        "detail": "Payment not found.",
    }


@pytest.mark.django_db
@patch("apps.payments.views.MidtransClient")
def test_payment_status_sync_handles_midtrans_error(
    mock_midtrans_client,
    api_client,
    user,
    order,
    payment,
):
    api_client.force_authenticate(user=user)

    from apps.payments.midtrans import MidtransAPIError

    mock_client = mock_midtrans_client.return_value

    mock_client.get_transaction_status.side_effect = MidtransAPIError(
        "Midtrans API error 500: unavailable",
    )

    response = api_client.post(
        f"/api/v1/payments/orders/" f"{order.order_number}/sync/",
    )

    assert response.status_code == 502
    assert "Midtrans API error" in response.data["detail"]
