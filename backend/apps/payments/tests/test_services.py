from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.accounts.models import Address
from apps.cart.models import Cart, CartItem
from apps.catalog.models import (
    Category,
    Color,
    Product,
    ProductColor,
    ProductVariant,
    Size,
    SizeType,
)
from apps.inventory.models import Inventory, InventoryReservation
from apps.orders.models import Order, OrderAddress, OrderItem
from apps.payments.models import Payment
from apps.payments.notification_services import (
    process_payment_notification,
    process_payment_status,
)
from apps.payments.services import (
    _build_customer_details,
    _build_item_details,
    _get_action_url,
    _parse_midtrans_datetime,
    _update_payment_from_charge_response,
    create_payment,
)
from apps.shipping.models import Shipment, ShippingMethod

# ============================================================
# Fixtures
# ============================================================


@pytest.fixture
def payment_user(db, django_user_model):
    return django_user_model.objects.create_user(
        email="payment@test.com",
        password="password123",
        first_name="Payment",
        last_name="Tester",
        phone_number="08123456789",
    )


@pytest.fixture
def address(payment_user):
    return Address.objects.create(
        user=payment_user,
        recipient_name="Payment Tester",
        phone_number="08123456789",
        address_line="Jl. Payment No. 1",
        sub_district="Jatirasa",
        district="Jatiasih",
        city="Bekasi",
        province="Jawa Barat",
        postal_code="17424",
        country="Indonesia",
    )


@pytest.fixture
def size_type(db):
    return SizeType.objects.create(
        name="Apparel",
        code=SizeType.Code.APPAREL,
    )


@pytest.fixture
def size(size_type):
    return Size.objects.create(
        size_type=size_type,
        name="M",
        sort_order=3,
    )


@pytest.fixture
def category(size_type):
    return Category.objects.create(
        name="Outerwear",
        code="OW",
        default_size_type=size_type,
    )


@pytest.fixture
def color(db):
    return Color.objects.create(
        name="Black",
        code="BLK",
        slug="black",
        hex_code="#000000",
    )


@pytest.fixture
def variant(category, size_type, size, color):
    product = Product.objects.create(
        product_code="GDR-OW-001",
        name="GIDORA Jacket",
        slug="gidora-jacket",
        category=category,
        gender=Product.Gender.UNISEX,
        size_type=size_type,
    )

    product_color = ProductColor.objects.create(
        product=product,
        color=color,
    )

    return ProductVariant.objects.create(
        product_color=product_color,
        size=size,
        sku="GDR-OW-001-BLK-M",
        price=Decimal("2490000"),
    )


@pytest.fixture
def cart(payment_user, variant):
    cart = Cart.objects.create(
        user=payment_user,
        status=Cart.Status.ACTIVE,
    )

    CartItem.objects.create(
        cart=cart,
        variant=variant,
        quantity=2,
    )

    return cart


@pytest.fixture
def shipping_method():
    return ShippingMethod.objects.create(
        code="JNE_YES",
        courier="JNE",
        service="YES",
        price=Decimal("25000"),
        is_active=True,
    )


@pytest.fixture
def order(payment_user, address, cart, shipping_method, variant):
    order = Order.objects.create(
        user=payment_user,
        status=Order.Status.PENDING,
        subtotal=Decimal("4980000"),
        discount_amount=Decimal("0"),
        shipping_amount=Decimal("25000"),
        shipping_method_code=shipping_method.code,
        shipping_courier=shipping_method.courier,
        shipping_service=shipping_method.service,
        tax_amount=Decimal("0"),
        total_amount=Decimal("5005000"),
        currency="IDR",
    )

    OrderAddress.objects.create(
        order=order,
        address_type=OrderAddress.AddressType.SHIPPING,
        recipient_name=address.recipient_name,
        phone_number=address.phone_number,
        address_line=address.address_line,
        sub_district=address.sub_district,
        district=address.district,
        city=address.city,
        province=address.province,
        postal_code=address.postal_code,
        country=address.country,
    )

    OrderItem.objects.create(
        order=order,
        product_variant=variant,
        product_name_snapshot=variant.product_color.product.name,
        sku_snapshot=variant.sku,
        variant_snapshot="Black / M",
        unit_price=variant.price,
        quantity=2,
        subtotal=Decimal("4980000"),
    )

    return order


@pytest.fixture
def inventory(variant):
    return Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
        reserved=2,
    )


@pytest.fixture
def reservation(order, inventory):
    return InventoryReservation.objects.create(
        order=order,
        inventory=inventory,
        quantity=2,
        status=InventoryReservation.Status.ACTIVE,
        expires_at=timezone.now() + timedelta(minutes=30),
    )


@pytest.fixture
def future_midtrans_expiry():
    expiry = timezone.now() + timedelta(days=1)
    return expiry.strftime("%Y-%m-%d %H:%M:%S")


@pytest.fixture
def midtrans_response(future_midtrans_expiry):
    return {
        "status_code": "201",
        "status_message": "Success, transaction is found",
        "transaction_id": "midtrans-transaction-001",
        "payment_type": "bank_transfer",
        "transaction_status": "pending",
        "gross_amount": "5005000.00",
        "currency": "IDR",
        "expiry_time": future_midtrans_expiry,
        "va_numbers": [
            {
                "bank": "bca",
                "va_number": "1234567890",
            }
        ],
    }


# ============================================================
# Helper functions
# ============================================================


@pytest.mark.django_db
def test_build_customer_details(order):
    shipping_address = order.addresses.get(
        address_type=OrderAddress.AddressType.SHIPPING,
    )

    result = _build_customer_details(
        order=order,
        shipping_address=shipping_address,
    )

    assert result["first_name"] == "Payment Tester"
    assert result["last_name"] == "Tester"
    assert result["email"] == order.user.email
    assert result["phone"] == "08123456789"
    assert result["shipping_address"]["city"] == "Bekasi"
    assert result["shipping_address"]["country_code"] == "IDN"


@pytest.mark.django_db
def test_build_item_details(order):
    result = _build_item_details(order=order)

    assert result[0] == {
        "id": "GDR-OW-001-BLK-M",
        "price": 2490000,
        "quantity": 2,
        "name": "GIDORA Jacket",
    }

    assert result[1] == {
        "id": "SHIPPING",
        "price": 25000,
        "quantity": 1,
        "name": "JNE YES",
    }


def test_get_action_url_prefers_qr_or_deeplink_action():
    actions = [
        {
            "name": "other",
            "url": "https://example.com/other",
        },
        {
            "name": "generate-qr-code",
            "url": "https://example.com/qr",
        },
    ]

    assert _get_action_url(actions) == "https://example.com/qr"


def test_get_action_url_returns_empty_for_missing_actions():
    assert _get_action_url(None) == ""
    assert _get_action_url([]) == ""


def test_parse_midtrans_datetime():
    result = _parse_midtrans_datetime("2026-09-30 13:00:00")

    assert result.tzinfo is not None
    assert result.year == 2026
    assert result.month == 9
    assert result.day == 30


def test_parse_midtrans_datetime_rejects_invalid_value():
    with pytest.raises(ValidationError):
        _parse_midtrans_datetime("invalid-date")


# ============================================================
# Charge response mapping
# ============================================================


@pytest.mark.django_db
def test_update_payment_from_bca_va_response(
    order,
    midtrans_response,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    _update_payment_from_charge_response(
        payment=payment,
        response=midtrans_response,
    )

    assert payment.bank == "bca"
    assert payment.va_number == "1234567890"
    assert payment.expires_at is not None


@pytest.mark.django_db
def test_update_payment_from_mandiri_response(
    order,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.MANDIRI,
        amount=order.total_amount,
    )

    _update_payment_from_charge_response(
        payment=payment,
        response={
            "bill_key": "123456789",
            "biller_code": "70012",
            "expiry_time": "2026-09-30 13:00:00",
        },
    )

    assert payment.bill_key == "123456789"
    assert payment.biller_code == "70012"
    assert payment.expires_at is not None


@pytest.mark.django_db
def test_update_payment_from_qris_response(
    order,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.QRIS,
        amount=order.total_amount,
    )

    _update_payment_from_charge_response(
        payment=payment,
        response={
            "qr_string": "000201010212",
            "actions": [
                {
                    "name": "generate-qr-code",
                    "url": "https://example.com/qr",
                }
            ],
            "expiry_time": "2026-09-30 13:00:00",
        },
    )

    assert payment.qr_string == "000201010212"
    assert payment.payment_url == "https://example.com/qr"
    assert payment.expires_at is not None


# ============================================================
# create_payment()
# ============================================================


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_success(
    mock_client_class,
    order,
    reservation,
    midtrans_response,
):
    client = mock_client_class.return_value

    client.create_transaction.return_value = midtrans_response

    payment = create_payment(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
    )

    payment.refresh_from_db()
    reservation.refresh_from_db()

    assert payment.status == Payment.Status.PENDING
    assert payment.transaction_id == "midtrans-transaction-001"
    assert payment.bank == "bca"
    assert payment.va_number == "1234567890"
    assert payment.expires_at is not None

    assert reservation.expires_at == payment.expires_at

    client.create_transaction.assert_called_once()
    client.get_transaction_status.assert_not_called()


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_fetches_expiry_when_charge_has_none(
    mock_client_class,
    order,
    reservation,
    future_midtrans_expiry,
):
    client = mock_client_class.return_value

    client.create_transaction.return_value = {
        "transaction_id": "midtrans-transaction-002",
        "transaction_status": "pending",
    }

    client.get_transaction_status.return_value = {
        "transaction_id": "midtrans-transaction-002",
        "transaction_status": "pending",
        "expiry_time": future_midtrans_expiry,
    }

    payment = create_payment(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
    )

    payment.refresh_from_db()
    reservation.refresh_from_db()

    assert payment.transaction_id == "midtrans-transaction-002"
    assert payment.expires_at is not None
    assert payment.expires_at > timezone.now()
    assert reservation.expires_at == payment.expires_at

    client.get_transaction_status.assert_called_once_with(
        order.order_number,
    )


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_rejects_non_pending_order(
    mock_client_class,
    order,
    reservation,
):
    order.status = Order.Status.CONFIRMED
    order.save(update_fields=["status"])

    with pytest.raises(ValidationError):
        create_payment(
            order=order,
            payment_method=Payment.PaymentMethod.BCA_VA,
        )

    mock_client_class.assert_not_called()


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_rejects_existing_payment(
    mock_client_class,
    order,
    reservation,
):
    Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    with pytest.raises(ValidationError):
        create_payment(
            order=order,
            payment_method=Payment.PaymentMethod.BCA_VA,
        )

    mock_client_class.assert_not_called()


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_rejects_missing_reservation(
    mock_client_class,
    order,
):
    with pytest.raises(ValidationError):
        create_payment(
            order=order,
            payment_method=Payment.PaymentMethod.BCA_VA,
        )

    mock_client_class.assert_not_called()

    assert not Payment.objects.filter(
        order=order,
    ).exists()


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_rejects_expired_reservation(
    mock_client_class,
    order,
    reservation,
):
    reservation.expires_at = timezone.now() - timedelta(minutes=1)
    reservation.save(
        update_fields=["expires_at"],
    )

    with pytest.raises(ValidationError):
        create_payment(
            order=order,
            payment_method=Payment.PaymentMethod.BCA_VA,
        )

    mock_client_class.assert_not_called()

    assert not Payment.objects.filter(
        order=order,
    ).exists()


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_rejects_missing_shipping_address(
    mock_client_class,
    order,
    reservation,
):
    OrderAddress.objects.filter(
        order=order,
    ).delete()

    with pytest.raises(ValidationError):
        create_payment(
            order=order,
            payment_method=Payment.PaymentMethod.BCA_VA,
        )

    mock_client_class.assert_not_called()

    assert not Payment.objects.filter(
        order=order,
    ).exists()


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_rolls_back_when_midtrans_has_no_transaction_id(
    mock_client_class,
    order,
    reservation,
):
    client = mock_client_class.return_value

    client.create_transaction.return_value = {
        "status_code": "400",
        "status_message": "Invalid transaction",
    }

    with pytest.raises(ValidationError):
        create_payment(
            order=order,
            payment_method=Payment.PaymentMethod.BCA_VA,
        )

    assert not Payment.objects.filter(
        order=order,
    ).exists()


@pytest.mark.django_db
@patch("apps.payments.services.MidtransClient")
def test_create_payment_rolls_back_when_expiry_cannot_be_determined(
    mock_client_class,
    order,
    reservation,
):
    client = mock_client_class.return_value

    client.create_transaction.return_value = {
        "transaction_id": "midtrans-transaction-003",
    }

    client.get_transaction_status.return_value = {
        "transaction_id": "midtrans-transaction-003",
        "transaction_status": "pending",
    }

    with pytest.raises(ValidationError):
        create_payment(
            order=order,
            payment_method=Payment.PaymentMethod.BCA_VA,
        )

    assert not Payment.objects.filter(
        order=order,
    ).exists()


# ============================================================
# process_payment_status()
# ============================================================


@pytest.mark.django_db
def test_process_payment_status_marks_payment_paid(
    order,
    reservation,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
        transaction_id="midtrans-paid-001",
    )

    payload = {
        "order_id": order.order_number,
        "transaction_id": "midtrans-paid-001",
        "transaction_status": "settlement",
        "gross_amount": str(order.total_amount),
        "currency": "IDR",
        "fraud_status": "accept",
        "expiry_time": "2026-09-30 13:00:00",
    }

    result = process_payment_status(
        payload=payload,
    )

    payment.refresh_from_db()
    order.refresh_from_db()
    reservation.refresh_from_db()

    assert result.pk == payment.pk
    assert payment.status == Payment.Status.PAID
    assert payment.paid_at is not None

    assert order.status == Order.Status.CONFIRMED
    assert reservation.status == InventoryReservation.Status.CONFIRMED

    assert Shipment.objects.filter(
        order=order,
    ).exists()


@pytest.mark.django_db
def test_process_payment_status_is_idempotent_for_paid_payment(
    order,
    reservation,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
        status=Payment.Status.PAID,
        transaction_id="midtrans-paid-002",
        paid_at=timezone.now(),
    )

    reservation.status = InventoryReservation.Status.CONFIRMED
    reservation.save(
        update_fields=["status"],
    )

    order.status = Order.Status.CONFIRMED
    order.save(
        update_fields=["status"],
    )

    payload = {
        "order_id": order.order_number,
        "transaction_id": "midtrans-paid-002",
        "transaction_status": "settlement",
        "gross_amount": str(order.total_amount),
        "currency": "IDR",
    }

    process_payment_status(
        payload=payload,
    )

    payment.refresh_from_db()

    assert payment.status == Payment.Status.PAID

    assert (
        Shipment.objects.filter(
            order=order,
        ).count()
        == 0
    )


@pytest.mark.django_db
def test_process_payment_status_expire_releases_reservation(
    order,
    reservation,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
        transaction_id="midtrans-expired-001",
    )

    payload = {
        "order_id": order.order_number,
        "transaction_id": "midtrans-expired-001",
        "transaction_status": "expire",
        "gross_amount": str(order.total_amount),
        "currency": "IDR",
    }

    process_payment_status(
        payload=payload,
    )

    payment.refresh_from_db()
    order.refresh_from_db()
    reservation.refresh_from_db()

    assert payment.status == Payment.Status.EXPIRED
    assert order.status == Order.Status.CANCELLED
    assert reservation.status == InventoryReservation.Status.RELEASED


@pytest.mark.django_db
def test_process_payment_status_cancel_releases_reservation(
    order,
    reservation,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    payload = {
        "order_id": order.order_number,
        "transaction_id": "midtrans-cancel-001",
        "transaction_status": "cancel",
        "gross_amount": str(order.total_amount),
        "currency": "IDR",
    }

    process_payment_status(
        payload=payload,
    )

    payment.refresh_from_db()
    order.refresh_from_db()
    reservation.refresh_from_db()

    assert payment.status == Payment.Status.CANCELLED
    assert order.status == Order.Status.CANCELLED
    assert reservation.status == InventoryReservation.Status.RELEASED


@pytest.mark.django_db
def test_process_payment_status_failure_releases_reservation(
    order,
    reservation,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    payload = {
        "order_id": order.order_number,
        "transaction_id": "midtrans-failure-001",
        "transaction_status": "failure",
        "gross_amount": str(order.total_amount),
        "currency": "IDR",
    }

    process_payment_status(
        payload=payload,
    )

    payment.refresh_from_db()
    order.refresh_from_db()
    reservation.refresh_from_db()

    assert payment.status == Payment.Status.FAILED
    assert order.status == Order.Status.CANCELLED
    assert reservation.status == InventoryReservation.Status.RELEASED


@pytest.mark.django_db
def test_process_payment_status_rejects_wrong_amount(
    order,
    reservation,
):
    Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    payload = {
        "order_id": order.order_number,
        "transaction_id": "midtrans-invalid-001",
        "transaction_status": "settlement",
        "gross_amount": "1.00",
        "currency": "IDR",
    }

    with pytest.raises(ValidationError):
        process_payment_status(
            payload=payload,
        )

    payment = Payment.objects.get(
        order=order,
    )

    assert payment.status == Payment.Status.PENDING
    assert reservation.status == InventoryReservation.Status.ACTIVE


@pytest.mark.django_db
def test_process_payment_status_rejects_wrong_currency(
    order,
    reservation,
):
    Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    payload = {
        "order_id": order.order_number,
        "transaction_id": "midtrans-invalid-002",
        "transaction_status": "settlement",
        "gross_amount": str(order.total_amount),
        "currency": "USD",
    }

    with pytest.raises(ValidationError):
        process_payment_status(
            payload=payload,
        )

    payment = Payment.objects.get(
        order=order,
    )

    assert payment.status == Payment.Status.PENDING
    assert reservation.status == InventoryReservation.Status.ACTIVE


@pytest.mark.django_db
def test_process_payment_status_rejects_missing_order_id():
    with pytest.raises(ValidationError):
        process_payment_status(
            payload={
                "transaction_status": "settlement",
                "gross_amount": "100000",
            }
        )


@pytest.mark.django_db
def test_process_payment_status_rejects_missing_gross_amount(
    order,
    reservation,
):
    Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    with pytest.raises(ValidationError):
        process_payment_status(
            payload={
                "order_id": order.order_number,
                "transaction_status": "settlement",
            }
        )


@pytest.mark.django_db
def test_process_payment_notification_delegates_to_status_processor(
    order,
    reservation,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    payload = {
        "order_id": order.order_number,
        "transaction_status": "expire",
        "gross_amount": str(order.total_amount),
        "currency": "IDR",
    }

    result = process_payment_notification(
        payload=payload,
    )

    payment.refresh_from_db()

    assert result.pk == payment.pk
    assert payment.status == Payment.Status.EXPIRED


@pytest.mark.django_db
def test_pending_midtrans_status_does_not_change_payment(
    order,
    reservation,
):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
    )

    payload = {
        "order_id": order.order_number,
        "transaction_id": "midtrans-pending-001",
        "transaction_status": "pending",
        "gross_amount": str(order.total_amount),
        "currency": "IDR",
    }

    process_payment_status(
        payload=payload,
    )

    payment.refresh_from_db()
    order.refresh_from_db()
    reservation.refresh_from_db()

    assert payment.status == Payment.Status.PENDING
    assert payment.transaction_id == "midtrans-pending-001"
    assert order.status == Order.Status.PENDING
    assert reservation.status == InventoryReservation.Status.ACTIVE
