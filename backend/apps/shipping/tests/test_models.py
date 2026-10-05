import pytest

from django.core.exceptions import ValidationError
from django.db import IntegrityError

from apps.orders.models import Order

from apps.shipping.models import (
    ShippingMethod,
    Shipment,
    ShipmentItem,
)


@pytest.mark.django_db
def test_shipping_method_string_representation():
    shipping_method = ShippingMethod.objects.create(
        code="JNE_REG",
        courier="JNE",
        service="REG",
        price=15000,
    )

    assert str(shipping_method) == "JNE REG"


@pytest.mark.django_db
def test_shipping_method_defaults_to_active():
    shipping_method = ShippingMethod.objects.create(
        code="JNE_REG",
        courier="JNE",
        service="REG",
        price=15000,
    )

    assert shipping_method.is_active is True


@pytest.mark.django_db
def test_shipping_method_rejects_negative_price():
    shipping_method = ShippingMethod(
        code="JNE_REG",
        courier="JNE",
        service="REG",
        price=-1,
    )

    with pytest.raises(ValidationError):
        shipping_method.full_clean()


@pytest.mark.django_db
def test_shipment_defaults_to_pending(django_user_model):
    user = django_user_model.objects.create_user(
        email="customer@gidora.com",
        password="password123",
    )

    order = Order.objects.create(
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

    shipment = Shipment.objects.create(
        order=order,
    )

    assert shipment.status == Shipment.Status.PENDING


@pytest.mark.django_db
def test_shipment_string_representation(django_user_model):
    user = django_user_model.objects.create_user(
        email="customer@gidora.com",
        password="password123",
    )

    order = Order.objects.create(
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

    shipment = Shipment.objects.create(
        order=order,
        status=Shipment.Status.PROCESSING,
    )

    assert str(shipment) == (f"{order.order_number} - {Shipment.Status.PROCESSING}")


@pytest.mark.django_db
def test_one_order_can_only_have_one_shipment(django_user_model):
    user = django_user_model.objects.create_user(
        email="customer@gidora.com",
        password="password123",
    )

    order = Order.objects.create(
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

    Shipment.objects.create(order=order)

    with pytest.raises(IntegrityError):
        Shipment.objects.create(order=order)


@pytest.mark.django_db
def test_shipment_item_rejects_zero_quantity(django_user_model):
    user = django_user_model.objects.create_user(
        email="customer@gidora.com",
        password="password123",
    )

    order = Order.objects.create(
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

    shipment = Shipment.objects.create(order=order)

    shipment_item = ShipmentItem(
        shipment=shipment,
        product_name_snapshot="Basic T-Shirt",
        sku_snapshot="GDR-SH-001-BLK-M",
        quantity=0,
    )

    with pytest.raises(ValidationError):
        shipment_item.full_clean()
