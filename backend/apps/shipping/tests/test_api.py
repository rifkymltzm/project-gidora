import pytest

from rest_framework.test import APIClient

from apps.orders.models import Order
from apps.shipping.models import Shipment, ShippingMethod


@pytest.fixture
def user(django_user_model):
    return django_user_model.objects.create_user(
        email="customer@gidora.com",
        password="password123",
        first_name="Customer",
        last_name="GIDORA",
    )


@pytest.fixture
def order(user):
    return Order.objects.create(
        user=user,
        status=Order.Status.CONFIRMED,
        subtotal=100000,
        discount_amount=0,
        shipping_amount=15000,
        shipping_method_code="JNE_REG",
        shipping_courier="JNE",
        shipping_service="REG",
        tax_amount=0,
        total_amount=115000,
        currency="IDR",
    )


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def staff_user(db):
    from apps.accounts.models import User

    return User.objects.create_user(
        email="shipping-staff@example.com",
        password="testpassword123",
        is_staff=True,
    )


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def staff_client(api_client, staff_user):
    api_client.force_authenticate(user=staff_user)
    return api_client


@pytest.fixture
def shipping_methods(db):
    active_method = ShippingMethod.objects.create(
        code="JNE_REG",
        courier="JNE",
        service="REG",
        price=15000,
        is_active=True,
    )

    inactive_method = ShippingMethod.objects.create(
        code="JNE_YES",
        courier="JNE",
        service="YES",
        price=25000,
        is_active=False,
    )

    return active_method, inactive_method


@pytest.fixture
def shipment(order):
    order.status = Order.Status.CONFIRMED
    order.save(update_fields=["status"])

    return Shipment.objects.create(
        order=order,
        status=Shipment.Status.PENDING,
    )


# ============================================================
# CUSTOMER — SHIPPING METHODS
# ============================================================


@pytest.mark.django_db
def test_shipping_method_list_returns_active_methods_only(
    authenticated_client,
    shipping_methods,
):
    active_method, inactive_method = shipping_methods

    response = authenticated_client.get(
        "/api/v1/shipping/methods/",
    )

    assert response.status_code == 200
    assert len(response.data) == 1

    assert response.data[0]["id"] == active_method.id
    assert response.data[0]["code"] == "JNE_REG"
    assert response.data[0]["courier"] == "JNE"
    assert response.data[0]["service"] == "REG"
    assert response.data[0]["price"] == "15000"

    assert response.data[0]["id"] != inactive_method.id


@pytest.mark.django_db
def test_shipping_method_list_requires_authentication(
    api_client,
    shipping_methods,
):
    response = api_client.get(
        "/api/v1/shipping/methods/",
    )

    assert response.status_code == 401


# ============================================================
# CUSTOMER — SHIPMENT DETAIL
# ============================================================


@pytest.mark.django_db
def test_customer_can_view_own_shipment(
    authenticated_client,
    shipment,
):
    response = authenticated_client.get(
        f"/api/v1/shipping/{shipment.order.order_number}/",
    )

    assert response.status_code == 200

    assert response.data["id"] == shipment.id
    assert response.data["order_number"] == shipment.order.order_number
    assert response.data["order_status"] == Order.Status.CONFIRMED
    assert response.data["status"] == Shipment.Status.PENDING

    assert "items" in response.data


@pytest.mark.django_db
def test_customer_cannot_view_other_users_shipment(
    api_client,
    shipment,
):
    from apps.accounts.models import User

    other_user = User.objects.create_user(
        email="other-customer@example.com",
        password="testpassword123",
    )

    api_client.force_authenticate(user=other_user)

    response = api_client.get(
        f"/api/v1/shipping/{shipment.order.order_number}/",
    )

    assert response.status_code == 404


@pytest.mark.django_db
def test_customer_get_shipment_returns_404_when_not_found(
    authenticated_client,
):
    response = authenticated_client.get(
        "/api/v1/shipping/GDR-99999999-9999/",
    )

    assert response.status_code == 404
    assert response.data["detail"] == "Shipment not found."


# ============================================================
# ADMIN — START PROCESSING
# ============================================================


@pytest.mark.django_db
def test_staff_can_start_shipment_processing(
    staff_client,
    shipment,
):
    response = staff_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/processing/",
    )

    assert response.status_code == 200

    shipment.refresh_from_db()
    shipment.order.refresh_from_db()

    assert shipment.status == Shipment.Status.PROCESSING
    assert shipment.order.status == Order.Status.PROCESSING

    assert response.data["status"] == Shipment.Status.PROCESSING
    assert response.data["order_status"] == Order.Status.PROCESSING


@pytest.mark.django_db
def test_non_staff_cannot_start_shipment_processing(
    authenticated_client,
    shipment,
):
    response = authenticated_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/processing/",
    )

    assert response.status_code == 403


# ============================================================
# ADMIN — SHIP
# ============================================================


@pytest.mark.django_db
def test_staff_can_ship_order_with_tracking_number(
    staff_client,
    shipment,
):
    shipment.status = Shipment.Status.PROCESSING
    shipment.save(update_fields=["status"])

    shipment.order.status = Order.Status.PROCESSING
    shipment.order.shipping_courier = "JNE"
    shipment.order.shipping_service = "YES"
    shipment.order.save(
        update_fields=[
            "status",
            "shipping_courier",
            "shipping_service",
        ]
    )

    response = staff_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/ship/",
        {
            "tracking_number": "JNE123456789",
        },
        format="json",
    )

    assert response.status_code == 200

    shipment.refresh_from_db()
    shipment.order.refresh_from_db()

    assert shipment.status == Shipment.Status.SHIPPED
    assert shipment.order.status == Order.Status.SHIPPED

    assert shipment.courier == "JNE"
    assert shipment.service == "YES"
    assert shipment.tracking_number == "JNE123456789"
    assert shipment.shipped_at is not None

    assert response.data["status"] == Shipment.Status.SHIPPED
    assert response.data["tracking_number"] == "JNE123456789"


@pytest.mark.django_db
def test_ship_requires_tracking_number(
    staff_client,
    shipment,
):
    shipment.status = Shipment.Status.PROCESSING
    shipment.save(update_fields=["status"])

    shipment.order.status = Order.Status.PROCESSING
    shipment.order.save(update_fields=["status"])

    response = staff_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/ship/",
        {},
        format="json",
    )

    assert response.status_code == 400
    assert "tracking_number" in response.data


@pytest.mark.django_db
def test_non_staff_cannot_ship_order(
    authenticated_client,
    shipment,
):
    shipment.status = Shipment.Status.PROCESSING
    shipment.save(update_fields=["status"])

    response = authenticated_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/ship/",
        {
            "tracking_number": "JNE123456789",
        },
        format="json",
    )

    assert response.status_code == 403


# ============================================================
# ADMIN — DELIVER
# ============================================================


@pytest.mark.django_db
def test_staff_can_mark_shipment_as_delivered(
    staff_client,
    shipment,
):
    shipment.status = Shipment.Status.SHIPPED
    shipment.tracking_number = "JNE123456789"
    shipment.shipped_at = shipment.created_at
    shipment.save(
        update_fields=[
            "status",
            "tracking_number",
            "shipped_at",
        ]
    )

    shipment.order.status = Order.Status.SHIPPED
    shipment.order.save(update_fields=["status"])

    response = staff_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/deliver/",
    )

    assert response.status_code == 200

    shipment.refresh_from_db()
    shipment.order.refresh_from_db()

    assert shipment.status == Shipment.Status.DELIVERED
    assert shipment.order.status == Order.Status.DELIVERED
    assert shipment.delivered_at is not None

    assert response.data["status"] == Shipment.Status.DELIVERED
    assert response.data["order_status"] == Order.Status.DELIVERED


# ============================================================
# ADMIN — CANCEL
# ============================================================


@pytest.mark.django_db
def test_staff_can_cancel_pending_shipment(
    staff_client,
    shipment,
):
    response = staff_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/cancel/",
    )

    assert response.status_code == 200

    shipment.refresh_from_db()

    assert shipment.status == Shipment.Status.CANCELLED
    assert response.data["status"] == Shipment.Status.CANCELLED


@pytest.mark.django_db
def test_staff_can_cancel_processing_shipment(
    staff_client,
    shipment,
):
    shipment.status = Shipment.Status.PROCESSING
    shipment.save(update_fields=["status"])

    shipment.order.status = Order.Status.PROCESSING
    shipment.order.save(update_fields=["status"])

    response = staff_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/cancel/",
    )

    assert response.status_code == 200

    shipment.refresh_from_db()

    assert shipment.status == Shipment.Status.CANCELLED


@pytest.mark.django_db
def test_shipped_shipment_cannot_be_cancelled(
    staff_client,
    shipment,
):
    shipment.status = Shipment.Status.SHIPPED
    shipment.save(update_fields=["status"])

    response = staff_client.post(
        f"/api/v1/admin/shipping/" f"{shipment.order.order_number}/cancel/",
    )

    assert response.status_code == 400

    shipment.refresh_from_db()

    assert shipment.status == Shipment.Status.SHIPPED
