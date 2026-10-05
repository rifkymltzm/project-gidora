from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.accounts.models import User
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
from apps.inventory.services import (
    add_stock,
    confirm_reservation,
    release_reservation,
    reserve_stock,
    set_reservation_expiry,
)
from apps.orders.models import Order


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
        email="inventory-service@gidora.com",
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


@pytest.fixture
def inventory(variant):
    return Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
        reserved=0,
    )


@pytest.fixture
def reservation(inventory, order):
    return InventoryReservation.objects.create(
        order=order,
        inventory=inventory,
        quantity=2,
        expires_at=timezone.now() + timedelta(minutes=30),
    )


@pytest.mark.django_db
def test_add_stock_creates_inventory_when_missing(variant):
    inventory = add_stock(
        variant=variant,
        quantity=10,
    )

    assert inventory.stock_on_hand == 10
    assert inventory.reserved == 0
    assert inventory.available == 10


@pytest.mark.django_db
def test_add_stock_increases_existing_inventory(inventory, variant):
    result = add_stock(
        variant=variant,
        quantity=5,
    )

    assert result.pk == inventory.pk
    assert result.stock_on_hand == 15
    assert result.reserved == 0
    assert result.available == 15


@pytest.mark.django_db
def test_add_stock_rejects_zero_quantity(variant):
    with pytest.raises(ValidationError) as exc_info:
        add_stock(
            variant=variant,
            quantity=0,
        )

    assert exc_info.value.message_dict["quantity"]


@pytest.mark.django_db
def test_add_stock_rejects_negative_quantity(variant):
    with pytest.raises(ValidationError):
        add_stock(
            variant=variant,
            quantity=-1,
        )


@pytest.mark.django_db
def test_reserve_stock_creates_active_reservation(
    inventory,
    order,
    variant,
):
    expires_at = timezone.now() + timedelta(minutes=30)

    reservation = reserve_stock(
        order=order,
        variant=variant,
        quantity=3,
        expires_at=expires_at,
    )

    inventory.refresh_from_db()

    assert reservation.order == order
    assert reservation.inventory == inventory
    assert reservation.quantity == 3
    assert reservation.status == InventoryReservation.Status.ACTIVE
    assert inventory.stock_on_hand == 10
    assert inventory.reserved == 3
    assert inventory.available == 7


@pytest.mark.django_db
def test_reserve_stock_rejects_insufficient_stock(
    inventory,
    order,
    variant,
):
    with pytest.raises(ValidationError) as exc_info:
        reserve_stock(
            order=order,
            variant=variant,
            quantity=11,
            expires_at=timezone.now() + timedelta(minutes=30),
        )

    assert "quantity" in exc_info.value.message_dict

    inventory.refresh_from_db()

    assert inventory.reserved == 0


@pytest.mark.django_db
def test_reserve_stock_rejects_missing_inventory(
    variant,
    order,
):
    with pytest.raises(ValidationError) as exc_info:
        reserve_stock(
            order=order,
            variant=variant,
            quantity=1,
            expires_at=timezone.now() + timedelta(minutes=30),
        )

    assert "inventory" in exc_info.value.message_dict


@pytest.mark.django_db
def test_reserve_stock_rejects_invalid_quantity(
    inventory,
    order,
    variant,
):
    with pytest.raises(ValidationError):
        reserve_stock(
            order=order,
            variant=variant,
            quantity=0,
            expires_at=timezone.now() + timedelta(minutes=30),
        )


@pytest.mark.django_db
def test_reserve_stock_rejects_expired_reservation(
    inventory,
    order,
    variant,
):
    with pytest.raises(ValidationError) as exc_info:
        reserve_stock(
            order=order,
            variant=variant,
            quantity=1,
            expires_at=timezone.now() - timedelta(minutes=1),
        )

    assert "expires_at" in exc_info.value.message_dict


@pytest.mark.django_db
def test_set_reservation_expiry_updates_expiry(reservation):
    new_expiry = timezone.now() + timedelta(hours=2)

    result = set_reservation_expiry(
        reservation=reservation,
        expires_at=new_expiry,
    )

    reservation.refresh_from_db()

    assert result.pk == reservation.pk
    assert reservation.expires_at == new_expiry


@pytest.mark.django_db
def test_set_reservation_expiry_rejects_expired_reservation(
    reservation,
):
    reservation.expires_at = timezone.now() - timedelta(minutes=1)
    reservation.save(update_fields=["expires_at"])

    with pytest.raises(ValidationError) as exc_info:
        set_reservation_expiry(
            reservation=reservation,
            expires_at=timezone.now() + timedelta(hours=1),
        )

    assert "reservation" in exc_info.value.message_dict


@pytest.mark.django_db
def test_set_reservation_expiry_rejects_non_active_reservation(
    reservation,
):
    reservation.status = InventoryReservation.Status.RELEASED
    reservation.save(update_fields=["status"])

    with pytest.raises(ValidationError) as exc_info:
        set_reservation_expiry(
            reservation=reservation,
            expires_at=timezone.now() + timedelta(hours=1),
        )

    assert "reservation" in exc_info.value.message_dict


@pytest.mark.django_db
def test_release_reservation_returns_stock(
    reservation,
):
    inventory = reservation.inventory

    inventory.reserved = reservation.quantity
    inventory.save(update_fields=["reserved"])

    result = release_reservation(
        reservation=reservation,
    )

    inventory.refresh_from_db()
    reservation.refresh_from_db()

    assert result.status == InventoryReservation.Status.RELEASED
    assert inventory.reserved == 0
    assert inventory.stock_on_hand == 10
    assert inventory.available == 10


@pytest.mark.django_db
def test_release_reservation_is_idempotent(
    reservation,
):
    inventory = reservation.inventory

    inventory.reserved = reservation.quantity
    inventory.save(update_fields=["reserved"])

    release_reservation(
        reservation=reservation,
    )

    result = release_reservation(
        reservation=reservation,
    )

    inventory.refresh_from_db()
    result.refresh_from_db()

    assert result.status == InventoryReservation.Status.RELEASED
    assert inventory.reserved == 0


@pytest.mark.django_db
def test_confirm_reservation_decreases_stock(
    reservation,
):
    inventory = reservation.inventory

    inventory.reserved = reservation.quantity
    inventory.save(update_fields=["reserved"])

    result = confirm_reservation(
        reservation=reservation,
    )

    inventory.refresh_from_db()
    result.refresh_from_db()

    assert result.status == InventoryReservation.Status.CONFIRMED
    assert inventory.stock_on_hand == 8
    assert inventory.reserved == 0
    assert inventory.available == 8


@pytest.mark.django_db
def test_confirm_reservation_marks_expired(
    reservation,
):
    inventory = reservation.inventory

    inventory.reserved = reservation.quantity
    inventory.save(update_fields=["reserved"])

    reservation.expires_at = timezone.now() - timedelta(minutes=1)
    reservation.save(update_fields=["expires_at"])

    result = confirm_reservation(
        reservation=reservation,
    )

    inventory.refresh_from_db()
    result.refresh_from_db()

    assert result.status == InventoryReservation.Status.EXPIRED
    assert inventory.stock_on_hand == 10
    assert inventory.reserved == 0
    assert inventory.available == 10


@pytest.mark.django_db
def test_confirm_reservation_is_idempotent(
    reservation,
):
    inventory = reservation.inventory

    inventory.reserved = reservation.quantity
    inventory.save(update_fields=["reserved"])

    confirm_reservation(
        reservation=reservation,
    )

    result = confirm_reservation(
        reservation=reservation,
    )

    inventory.refresh_from_db()
    result.refresh_from_db()

    assert result.status == InventoryReservation.Status.CONFIRMED
    assert inventory.stock_on_hand == 8
    assert inventory.reserved == 0
