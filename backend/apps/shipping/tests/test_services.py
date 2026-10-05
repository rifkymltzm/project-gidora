from decimal import Decimal

import pytest

from django.core.exceptions import ValidationError

from apps.catalog.models import (
    Category,
    Color,
    Product,
    ProductColor,
    ProductVariant,
    Size,
    SizeType,
)
from apps.orders.models import Order, OrderItem

from apps.shipping.models import (
    ShippingMethod,
    Shipment,
    ShipmentItem,
)
from apps.shipping.services import (
    cancel_shipment,
    create_shipment,
    get_shipping_methods,
    mark_delivered,
    ship_order,
    start_processing,
)


@pytest.fixture
def user(django_user_model):
    return django_user_model.objects.create_user(
        email="customer@gidora.com",
        password="password123",
        first_name="Customer",
        last_name="GIDORA",
    )


@pytest.fixture
def size_type():
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
        name="Shirts",
        code="SH",
        default_size_type=size_type,
    )


@pytest.fixture
def color():
    return Color.objects.create(
        name="Black",
        code="BLK",
        slug="black",
        hex_code="#000000",
    )


@pytest.fixture
def product(category, size_type):
    return Product.objects.create(
        product_code="GDR-SH-001",
        name="Basic T-Shirt",
        slug="basic-t-shirt",
        description="Basic T-Shirt",
        material="Cotton",
        category=category,
        gender=Product.Gender.UNISEX,
        size_type=size_type,
    )


@pytest.fixture
def product_color(product, color):
    return ProductColor.objects.create(
        product=product,
        color=color,
    )


@pytest.fixture
def variant(product_color, size):
    return ProductVariant.objects.create(
        product_color=product_color,
        size=size,
        sku="GDR-SH-001-BLK-M",
        price=Decimal("249000"),
    )


@pytest.fixture
def order(user, variant):
    order = Order.objects.create(
        user=user,
        status=Order.Status.CONFIRMED,
        subtotal=Decimal("249000"),
        discount_amount=Decimal("0"),
        shipping_amount=Decimal("15000"),
        shipping_method_code="JNE_REG",
        shipping_courier="JNE",
        shipping_service="REG",
        tax_amount=Decimal("0"),
        total_amount=Decimal("264000"),
        currency="IDR",
    )

    OrderItem.objects.create(
        order=order,
        product_variant=variant,
        product_name_snapshot="Basic T-Shirt",
        sku_snapshot="GDR-SH-001-BLK-M",
        variant_snapshot="Black / M",
        unit_price=Decimal("249000"),
        quantity=2,
        subtotal=Decimal("498000"),
    )

    return order


@pytest.fixture
def shipment(order):
    return create_shipment(order=order)


@pytest.fixture
def processing_shipment(shipment):
    return start_processing(shipment=shipment)


@pytest.fixture
def shipped_shipment(processing_shipment):
    return ship_order(
        shipment=processing_shipment,
        tracking_number="JNE123456789",
    )


@pytest.mark.django_db
def test_get_shipping_methods_returns_active_methods_only():
    ShippingMethod.objects.create(
        code="JNE_REG",
        courier="JNE",
        service="REG",
        price=15000,
        is_active=True,
    )

    ShippingMethod.objects.create(
        code="JNE_YES",
        courier="JNE",
        service="YES",
        price=25000,
        is_active=False,
    )

    methods = list(get_shipping_methods())

    assert len(methods) == 1
    assert methods[0].code == "JNE_REG"


@pytest.mark.django_db
def test_create_shipment_for_confirmed_order(order):
    shipment = create_shipment(order=order)

    assert shipment.order == order
    assert shipment.status == Shipment.Status.PENDING


@pytest.mark.django_db
def test_create_shipment_creates_snapshot_items(order):
    shipment = create_shipment(order=order)

    shipment_item = shipment.items.get()

    assert shipment_item.order_item_id == order.items.first().id
    assert shipment_item.product_name_snapshot == "Basic T-Shirt"
    assert shipment_item.sku_snapshot == "GDR-SH-001-BLK-M"
    assert shipment_item.quantity == 2


@pytest.mark.django_db
def test_create_shipment_requires_confirmed_order(order):
    order.status = Order.Status.PENDING
    order.save(update_fields=["status"])

    with pytest.raises(ValidationError) as exc:
        create_shipment(order=order)

    assert "order" in exc.value.message_dict


@pytest.mark.django_db
def test_create_shipment_requires_order_items(user):
    order = Order.objects.create(
        user=user,
        status=Order.Status.CONFIRMED,
        subtotal=Decimal("0"),
        discount_amount=Decimal("0"),
        shipping_amount=Decimal("15000"),
        shipping_method_code="JNE_REG",
        shipping_courier="JNE",
        shipping_service="REG",
        tax_amount=Decimal("0"),
        total_amount=Decimal("15000"),
        currency="IDR",
    )

    with pytest.raises(ValidationError) as exc:
        create_shipment(order=order)

    assert "order" in exc.value.message_dict


@pytest.mark.django_db
def test_create_shipment_cannot_create_duplicate(order):
    create_shipment(order=order)

    with pytest.raises(ValidationError) as exc:
        create_shipment(order=order)

    assert "shipment" in exc.value.message_dict


@pytest.mark.django_db
def test_start_processing_changes_shipment_and_order_status(shipment):
    start_processing(shipment=shipment)

    shipment.refresh_from_db()
    shipment.order.refresh_from_db()

    assert shipment.status == Shipment.Status.PROCESSING
    assert shipment.order.status == Order.Status.PROCESSING


@pytest.mark.django_db
def test_start_processing_requires_pending_shipment(processing_shipment):
    with pytest.raises(ValidationError) as exc:
        start_processing(shipment=processing_shipment)

    assert "shipment" in exc.value.message_dict


@pytest.mark.django_db
def test_ship_order_sets_shipping_snapshot_and_tracking_number(
    processing_shipment,
):
    shipment = ship_order(
        shipment=processing_shipment,
        tracking_number="JNE123456789",
    )

    shipment.refresh_from_db()
    shipment.order.refresh_from_db()

    assert shipment.status == Shipment.Status.SHIPPED
    assert shipment.courier == "JNE"
    assert shipment.service == "REG"
    assert shipment.tracking_number == "JNE123456789"
    assert shipment.shipped_at is not None
    assert shipment.order.status == Order.Status.SHIPPED


@pytest.mark.django_db
def test_ship_order_requires_processing_shipment(shipment):
    with pytest.raises(ValidationError) as exc:
        ship_order(
            shipment=shipment,
            tracking_number="JNE123456789",
        )

    assert "shipment" in exc.value.message_dict


@pytest.mark.django_db
def test_ship_order_requires_tracking_number(processing_shipment):
    with pytest.raises(ValidationError) as exc:
        ship_order(
            shipment=processing_shipment,
            tracking_number="",
        )

    assert "tracking_number" in exc.value.message_dict


@pytest.mark.django_db
def test_mark_delivered_changes_shipment_and_order_status(
    shipped_shipment,
):
    shipment = mark_delivered(
        shipment=shipped_shipment,
    )

    shipment.refresh_from_db()
    shipment.order.refresh_from_db()

    assert shipment.status == Shipment.Status.DELIVERED
    assert shipment.delivered_at is not None
    assert shipment.order.status == Order.Status.DELIVERED


@pytest.mark.django_db
def test_mark_delivered_requires_shipped_shipment(processing_shipment):
    with pytest.raises(ValidationError) as exc:
        mark_delivered(
            shipment=processing_shipment,
        )

    assert "shipment" in exc.value.message_dict


@pytest.mark.django_db
def test_cancel_pending_shipment(shipment):
    shipment = cancel_shipment(
        shipment=shipment,
    )

    shipment.refresh_from_db()

    assert shipment.status == Shipment.Status.CANCELLED


@pytest.mark.django_db
def test_cancel_processing_shipment(processing_shipment):
    shipment = cancel_shipment(
        shipment=processing_shipment,
    )

    shipment.refresh_from_db()

    assert shipment.status == Shipment.Status.CANCELLED


@pytest.mark.django_db
def test_cancel_shipment_rejects_shipped_shipment(shipped_shipment):
    with pytest.raises(ValidationError) as exc:
        cancel_shipment(
            shipment=shipped_shipment,
        )

    assert "shipment" in exc.value.message_dict
