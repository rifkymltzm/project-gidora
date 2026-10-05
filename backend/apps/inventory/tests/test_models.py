from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone

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
from apps.orders.models import Order
from apps.accounts.models import User


@pytest.fixture
def variant(db):
    size_type = SizeType.objects.create(
        name="Apparel",
        code=SizeType.Code.APPAREL,
    )

    size = Size.objects.create(
        size_type=size_type,
        name="M",
        sort_order=3,
    )

    category = Category.objects.create(
        name="Shirts",
        code="SH",
        default_size_type=size_type,
    )

    product = Product.objects.create(
        product_code="GDR-SH-001",
        name="Test Shirt",
        slug="test-shirt",
        category=category,
        gender=Product.Gender.UNISEX,
        size_type=size_type,
    )

    color = Color.objects.create(
        name="Black",
        code="BLK",
        slug="black",
        hex_code="#000000",
    )

    product_color = ProductColor.objects.create(
        product=product,
        color=color,
    )

    return ProductVariant.objects.create(
        product_color=product_color,
        size=size,
        sku="GDR-SH-001-BLK-M",
        price=250000,
    )


@pytest.fixture
def order(db):
    user = User.objects.create_user(
        email="inventory-test@gidora.com",
        password="test12345",
    )

    return Order.objects.create(
        user=user,
        subtotal=250000,
        discount_amount=0,
        shipping_amount=15000,
        tax_amount=0,
        total_amount=265000,
        currency="IDR",
    )


@pytest.mark.django_db
def test_inventory_available_is_stock_minus_reserved(variant):
    inventory = Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
        reserved=3,
    )

    assert inventory.available == 7


@pytest.mark.django_db
def test_inventory_clean_rejects_reserved_greater_than_stock(variant):
    inventory = Inventory(
        variant=variant,
        stock_on_hand=5,
        reserved=6,
    )

    with pytest.raises(ValidationError) as exc_info:
        inventory.full_clean()

    assert "reserved" in exc_info.value.message_dict


@pytest.mark.django_db
def test_inventory_reservation_defaults_to_active(variant, order):
    inventory = Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
    )

    reservation = InventoryReservation.objects.create(
        order=order,
        inventory=inventory,
        quantity=2,
        expires_at=timezone.now() + timedelta(minutes=30),
    )

    assert reservation.status == InventoryReservation.Status.ACTIVE


@pytest.mark.django_db
def test_inventory_reservation_clean_rejects_expired_date(
    variant,
    order,
):
    inventory = Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
    )

    reservation = InventoryReservation(
        order=order,
        inventory=inventory,
        quantity=2,
        expires_at=timezone.now() - timedelta(minutes=1),
    )

    with pytest.raises(ValidationError) as exc_info:
        reservation.full_clean()

    assert "expires_at" in exc_info.value.message_dict


@pytest.mark.django_db
def test_inventory_reservation_quantity_must_be_positive(
    variant,
    order,
):
    inventory = Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
    )

    with pytest.raises(IntegrityError):
        InventoryReservation.objects.create(
            order=order,
            inventory=inventory,
            quantity=0,
            expires_at=timezone.now() + timedelta(minutes=30),
        )
