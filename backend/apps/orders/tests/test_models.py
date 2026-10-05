from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

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
from apps.orders.models import Order, OrderAddress, OrderItem


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="orders-model@gidora.com",
        password="test12345",
        first_name="Gidora",
        last_name="Test",
    )


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
def order(user):
    return Order.objects.create(
        user=user,
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


@pytest.mark.django_db
def test_order_number_is_generated_automatically(user):
    order = Order.objects.create(
        user=user,
        subtotal=Decimal("100000"),
        total_amount=Decimal("100000"),
    )

    expected_suffix = f"{order.pk:04d}"

    assert order.order_number.startswith("GDR-")
    assert order.order_number.endswith(expected_suffix)
    assert order.order_number == (f"GDR-{order.created_at:%Y%m%d}-{order.pk:04d}")


@pytest.mark.django_db
def test_order_defaults_to_pending(user):
    order = Order.objects.create(
        user=user,
        subtotal=Decimal("100000"),
        total_amount=Decimal("100000"),
    )

    assert order.status == Order.Status.PENDING


@pytest.mark.django_db
def test_order_string_representation(order):
    assert str(order) == order.order_number


@pytest.mark.django_db
def test_order_item_string_representation(order, variant):
    item = OrderItem.objects.create(
        order=order,
        product_variant=variant,
        product_name_snapshot="Test Shirt",
        sku_snapshot="GDR-SH-001-BLK-M",
        variant_snapshot="Black / M",
        unit_price=Decimal("250000"),
        quantity=2,
        subtotal=Decimal("500000"),
    )

    assert str(item) == (f"{order.order_number} - GDR-SH-001-BLK-M")


@pytest.mark.django_db
def test_order_address_string_representation(order):
    address = OrderAddress.objects.create(
        order=order,
        address_type=OrderAddress.AddressType.SHIPPING,
        recipient_name="Gidora Test",
        phone_number="08123456789",
        address_line="Jl. Test No. 1",
        sub_district="Jatirasa",
        district="Jatiasih",
        city="Bekasi",
        province="Jawa Barat",
        postal_code="17424",
        country="Indonesia",
    )

    assert str(address) == (f"{order.order_number} - SHIPPING")


@pytest.mark.django_db
def test_order_address_type_must_be_unique_per_order(order):
    OrderAddress.objects.create(
        order=order,
        address_type=OrderAddress.AddressType.SHIPPING,
        recipient_name="Gidora Test",
        phone_number="08123456789",
        address_line="Jl. Test No. 1",
        sub_district="Jatirasa",
        district="Jatiasih",
        city="Bekasi",
        province="Jawa Barat",
        postal_code="17424",
        country="Indonesia",
    )

    with pytest.raises(IntegrityError):
        OrderAddress.objects.create(
            order=order,
            address_type=OrderAddress.AddressType.SHIPPING,
            recipient_name="Another Test",
            phone_number="08111111111",
            address_line="Jl. Another No. 2",
            sub_district="Jatirasa",
            district="Jatiasih",
            city="Bekasi",
            province="Jawa Barat",
            postal_code="17424",
            country="Indonesia",
        )


@pytest.mark.django_db
def test_order_item_rejects_zero_quantity(order, variant):
    item = OrderItem(
        order=order,
        product_variant=variant,
        product_name_snapshot="Test Shirt",
        sku_snapshot="GDR-SH-001-BLK-M",
        variant_snapshot="Black / M",
        unit_price=Decimal("250000"),
        quantity=0,
        subtotal=Decimal("0"),
    )

    with pytest.raises(ValidationError) as exc_info:
        item.full_clean()

    assert "quantity" in exc_info.value.message_dict
