from decimal import Decimal

from datetime import timedelta
from django.utils import timezone

import pytest
from django.core.exceptions import ValidationError

from apps.accounts.models import Address, User
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
from apps.orders.models import Order, OrderAddress
from apps.orders.services import cancel_order, create_order
from apps.shipping.models import ShippingMethod


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="orders-service@gidora.com",
        password="test12345",
        first_name="Gidora",
        last_name="Test",
    )


@pytest.fixture
def address(user):
    return Address.objects.create(
        user=user,
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


@pytest.fixture
def shipping_method(db):
    return ShippingMethod.objects.create(
        code="JNE_REG",
        courier="JNE",
        service="REG",
        price=15000,
        is_active=True,
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
def cart(user, variant):
    cart = Cart.objects.create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    CartItem.objects.create(
        cart=cart,
        variant=variant,
        quantity=2,
    )

    return cart


@pytest.fixture
def inventory(variant):
    return Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
        reserved=0,
    )


@pytest.fixture
def shipping_address_data(address):
    return {
        "recipient_name": address.recipient_name,
        "phone_number": address.phone_number,
        "address_line": address.address_line,
        "sub_district": address.sub_district,
        "district": address.district,
        "city": address.city,
        "province": address.province,
        "postal_code": address.postal_code,
        "country": address.country,
    }


@pytest.fixture
def new_shipping_address():
    return {
        "recipient_name": "Checkout Customer",
        "phone_number": "081298765432",
        "address_line": "Jl. Checkout No. 99",
        "sub_district": "Kayuringin",
        "district": "Bekasi Selatan",
        "city": "Bekasi",
        "province": "Jawa Barat",
        "postal_code": "17148",
        "country": "Indonesia",
    }


@pytest.mark.django_db
def test_create_order_creates_order(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    assert order.pk is not None
    assert order.status == Order.Status.PENDING
    assert order.user == user


@pytest.mark.django_db
def test_create_order_calculates_amounts(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    assert order.subtotal == Decimal("500000")
    assert order.discount_amount == Decimal("0")
    assert order.shipping_amount == Decimal("15000")
    assert order.tax_amount == Decimal("0")
    assert order.total_amount == Decimal("515000")
    assert order.currency == "IDR"


@pytest.mark.django_db
def test_create_order_copies_shipping_method_data(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    assert order.shipping_method_code == "JNE_REG"
    assert order.shipping_courier == "JNE"
    assert order.shipping_service == "REG"


@pytest.mark.django_db
def test_create_order_creates_address_snapshot(
    user,
    address,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    order_address = order.addresses.get(
        address_type=OrderAddress.AddressType.SHIPPING,
    )

    assert order_address.recipient_name == address.recipient_name
    assert order_address.phone_number == address.phone_number
    assert order_address.address_line == address.address_line
    assert order_address.city == address.city
    assert order_address.province == address.province
    assert order_address.postal_code == address.postal_code


@pytest.mark.django_db
def test_create_order_accepts_new_shipping_address(
    user,
    new_shipping_address,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=new_shipping_address,
        shipping_method=shipping_method,
    )

    order_address = order.addresses.get(
        address_type=OrderAddress.AddressType.SHIPPING,
    )

    assert order_address.recipient_name == "Checkout Customer"
    assert order_address.phone_number == "081298765432"
    assert order_address.address_line == "Jl. Checkout No. 99"
    assert order_address.city == "Bekasi"
    assert order_address.postal_code == "17148"


@pytest.mark.django_db
def test_create_order_creates_item_snapshot(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    item = order.items.get()

    assert item.product_variant == cart.items.get().variant
    assert item.product_name_snapshot == "Test Shirt"
    assert item.sku_snapshot == "GDR-SH-001-BLK-M"
    assert item.variant_snapshot == "Black / M"
    assert item.unit_price == Decimal("250000")
    assert item.quantity == 2
    assert item.subtotal == Decimal("500000")


@pytest.mark.django_db
def test_create_order_reserves_inventory(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    inventory.refresh_from_db()

    reservation = order.inventory_reservations.get()

    assert reservation.status == InventoryReservation.Status.ACTIVE
    assert reservation.quantity == 2
    assert inventory.stock_on_hand == 10
    assert inventory.reserved == 2
    assert inventory.available == 8


@pytest.mark.django_db
def test_create_order_converts_cart(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    cart.refresh_from_db()

    assert cart.status == Cart.Status.CONVERTED


@pytest.mark.django_db
def test_create_order_rejects_inactive_shipping_method(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    shipping_method.is_active = False
    shipping_method.save(update_fields=["is_active"])

    with pytest.raises(ValidationError) as exc_info:
        create_order(
            user=user,
            shipping_address=shipping_address_data,
            shipping_method=shipping_method,
        )

    assert "shipping_method" in exc_info.value.message_dict
    assert not Order.objects.filter(
        user=user,
    ).exists()


@pytest.mark.django_db
def test_create_order_rejects_empty_cart(
    user,
    shipping_address_data,
    shipping_method,
    inventory,
):
    Cart.objects.create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    with pytest.raises(ValidationError) as exc_info:
        create_order(
            user=user,
            shipping_address=shipping_address_data,
            shipping_method=shipping_method,
        )

    assert "cart" in exc_info.value.message_dict


@pytest.mark.django_db
def test_create_order_rejects_missing_active_cart(
    user,
    shipping_address_data,
    shipping_method,
    inventory,
):
    with pytest.raises(ValidationError) as exc_info:
        create_order(
            user=user,
            shipping_address=shipping_address_data,
            shipping_method=shipping_method,
        )

    assert "cart" in exc_info.value.message_dict


@pytest.mark.django_db
def test_create_order_rejects_inactive_variant(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    variant = cart.items.get().variant

    variant.is_active = False
    variant.save(update_fields=["is_active"])

    with pytest.raises(ValidationError) as exc_info:
        create_order(
            user=user,
            shipping_address=shipping_address_data,
            shipping_method=shipping_method,
        )

    assert "cart" in exc_info.value.message_dict
    assert not Order.objects.filter(
        user=user,
    ).exists()


@pytest.mark.django_db
def test_create_order_rolls_back_when_stock_is_insufficient(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    inventory.stock_on_hand = 1
    inventory.save(update_fields=["stock_on_hand"])

    with pytest.raises(ValidationError):
        create_order(
            user=user,
            shipping_address=shipping_address_data,
            shipping_method=shipping_method,
        )

    inventory.refresh_from_db()
    cart.refresh_from_db()

    assert not Order.objects.filter(
        user=user,
    ).exists()

    assert inventory.reserved == 0
    assert inventory.stock_on_hand == 1
    assert cart.status == Cart.Status.ACTIVE


@pytest.mark.django_db
def test_cancel_order_releases_inventory(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    inventory.refresh_from_db()

    assert inventory.reserved == 2

    cancel_order(order=order)

    inventory.refresh_from_db()
    order.refresh_from_db()

    reservation = order.inventory_reservations.get()

    assert order.status == Order.Status.CANCELLED
    assert reservation.status == InventoryReservation.Status.RELEASED
    assert inventory.reserved == 0
    assert inventory.available == 10


@pytest.mark.django_db
def test_cancel_order_rejects_non_pending_order(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    order.status = Order.Status.CONFIRMED
    order.save(update_fields=["status"])

    with pytest.raises(ValidationError) as exc_info:
        cancel_order(order=order)

    assert "order" in exc_info.value.message_dict

    order.refresh_from_db()

    assert order.status == Order.Status.CONFIRMED


@pytest.mark.django_db
def test_cancel_order_is_rejected_after_payment_exists(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    from apps.payments.models import Payment

    Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=order.total_amount,
        currency=order.currency,
    )

    with pytest.raises(ValidationError) as exc_info:
        cancel_order(order=order)

    assert "order" in exc_info.value.message_dict

    order.refresh_from_db()

    assert order.status == Order.Status.PENDING


@pytest.mark.django_db
def test_cancel_order_does_not_change_already_released_reservation(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    reservation = order.inventory_reservations.get()

    from apps.inventory.services import release_reservation

    release_reservation(
        reservation=reservation,
    )

    cancel_order(order=order)

    order.refresh_from_db()
    reservation.refresh_from_db()
    inventory.refresh_from_db()

    assert order.status == Order.Status.CANCELLED
    assert reservation.status == InventoryReservation.Status.RELEASED
    assert inventory.reserved == 0


@pytest.mark.django_db
def test_order_address_is_snapshot(
    user,
    address,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    address.address_line = "Jl. Address Baru No. 99"
    address.city = "Jakarta Selatan"
    address.save(
        update_fields=[
            "address_line",
            "city",
        ]
    )

    order_address = order.addresses.get(
        address_type=OrderAddress.AddressType.SHIPPING,
    )

    assert order_address.address_line == "Jl. Test No. 1"
    assert order_address.city == "Bekasi"


@pytest.mark.django_db
def test_create_order_sets_reservation_expiry(
    user,
    shipping_address_data,
    shipping_method,
    cart,
    inventory,
):
    before = timezone.now()

    order = create_order(
        user=user,
        shipping_address=shipping_address_data,
        shipping_method=shipping_method,
    )

    reservation = order.inventory_reservations.get()

    after = timezone.now()

    expected_min = before + timedelta(minutes=30)
    expected_max = after + timedelta(minutes=30)

    assert reservation.expires_at >= expected_min
    assert reservation.expires_at <= expected_max
