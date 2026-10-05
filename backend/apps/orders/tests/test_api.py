from decimal import Decimal
from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

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
from apps.inventory.models import Inventory
from apps.orders.models import Order, OrderAddress
from apps.shipping.models import ShippingMethod


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="customer@gidora.com",
        password="password123",
        first_name="Budi",
        last_name="Customer",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="other@gidora.com",
        password="password123",
        first_name="Other",
        last_name="Customer",
    )


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        email="staff@gidora.com",
        password="password123",
        first_name="GIDORA",
        last_name="Staff",
        is_staff=True,
    )


@pytest.fixture
def address(user):
    return Address.objects.create(
        user=user,
        recipient_name="Budi",
        phone_number="08123456789",
        address_line="Jl. Contoh No. 10",
        sub_district="Menteng",
        district="Menteng",
        city="Jakarta Pusat",
        province="DKI Jakarta",
        postal_code="10310",
        country="Indonesia",
    )


@pytest.fixture
def other_address(other_user):
    return Address.objects.create(
        user=other_user,
        recipient_name="Other User",
        phone_number="08987654321",
        address_line="Jl. User Lain No. 20",
        sub_district="Kebayoran Baru",
        district="Kebayoran Baru",
        city="Jakarta Selatan",
        province="DKI Jakarta",
        postal_code="12110",
        country="Indonesia",
    )


@pytest.fixture
def shipping_method(db):
    return ShippingMethod.objects.create(
        code="JNE_REG",
        courier="JNE",
        service="REG",
        price=Decimal("15000"),
        is_active=True,
    )


@pytest.fixture
def inactive_shipping_method(db):
    return ShippingMethod.objects.create(
        code="JNE_INACTIVE",
        courier="JNE",
        service="REG",
        price=Decimal("15000"),
        is_active=False,
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

    color = Color.objects.create(
        name="Black",
        code="BLK",
        slug="black",
        hex_code="#000000",
    )

    product = Product.objects.create(
        product_code="GDR-SH-001",
        name="Basic Shirt",
        slug="basic-shirt",
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
        sku="GDR-SH-001-BLK-M",
        price=Decimal("250000"),
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

    Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
        reserved=0,
    )

    return cart


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def staff_client(api_client, staff_user):
    api_client.force_authenticate(user=staff_user)
    return api_client


@pytest.fixture
def order(user, address, shipping_method):
    return Order.objects.create(
        user=user,
        status=Order.Status.PENDING,
        subtotal=Decimal("500000"),
        discount_amount=Decimal("0"),
        shipping_amount=shipping_method.price,
        shipping_method_code=shipping_method.code,
        shipping_courier=shipping_method.courier,
        shipping_service=shipping_method.service,
        tax_amount=Decimal("0"),
        total_amount=Decimal("515000"),
        currency="IDR",
    )


@pytest.fixture
def order_with_address(order, address):
    return OrderAddress.objects.create(
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


def order_list_url():
    return reverse("order-list-create")


def order_detail_url(order_number):
    return reverse(
        "order-detail",
        kwargs={"order_number": order_number},
    )


def order_cancel_url(order_number):
    return reverse(
        "order-cancel",
        kwargs={"order_number": order_number},
    )


def admin_order_list_url():
    return reverse("admin-order-list")


def admin_order_detail_url(order_number):
    return reverse(
        "admin-order-detail",
        kwargs={"order_number": order_number},
    )


@pytest.mark.django_db
def test_list_orders_returns_only_authenticated_user_orders(
    authenticated_client,
    user,
    other_user,
    order,
    shipping_method,
):
    Order.objects.create(
        user=other_user,
        status=Order.Status.PENDING,
        subtotal=Decimal("100000"),
        discount_amount=Decimal("0"),
        shipping_amount=shipping_method.price,
        shipping_method_code=shipping_method.code,
        shipping_courier=shipping_method.courier,
        shipping_service=shipping_method.service,
        tax_amount=Decimal("0"),
        total_amount=Decimal("115000"),
        currency="IDR",
    )

    response = authenticated_client.get(order_list_url())

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["order_number"] == order.order_number


@pytest.mark.django_db
def test_retrieve_own_order(
    authenticated_client,
    order,
    order_with_address,
):
    response = authenticated_client.get(
        order_detail_url(order.order_number),
    )

    assert response.status_code == 200
    assert response.data["order_number"] == order.order_number
    assert response.data["status"] == Order.Status.PENDING
    assert len(response.data["addresses"]) == 1


@pytest.mark.django_db
def test_customer_cannot_retrieve_other_users_order(
    authenticated_client,
    other_user,
    shipping_method,
):
    other_order = Order.objects.create(
        user=other_user,
        status=Order.Status.PENDING,
        subtotal=Decimal("100000"),
        discount_amount=Decimal("0"),
        shipping_amount=shipping_method.price,
        shipping_method_code=shipping_method.code,
        shipping_courier=shipping_method.courier,
        shipping_service=shipping_method.service,
        tax_amount=Decimal("0"),
        total_amount=Decimal("115000"),
        currency="IDR",
    )

    response = authenticated_client.get(
        order_detail_url(other_order.order_number),
    )

    assert response.status_code == 404


@pytest.mark.django_db
def test_create_order_with_saved_address(
    authenticated_client,
    address,
    shipping_method,
    cart,
):
    response = authenticated_client.post(
        order_list_url(),
        {
            "shipping_address_id": address.id,
            "shipping_method_id": shipping_method.id,
        },
        format="json",
    )

    assert response.status_code == 201

    order = Order.objects.get(
        order_number=response.data["order_number"],
    )

    order_address = order.addresses.get(
        address_type=OrderAddress.AddressType.SHIPPING,
    )

    assert order_address.recipient_name == address.recipient_name
    assert order_address.phone_number == address.phone_number
    assert order_address.address_line == address.address_line
    assert order_address.city == address.city


@pytest.mark.django_db
def test_create_order_with_new_shipping_address(
    authenticated_client,
    shipping_method,
    cart,
):
    payload = {
        "shipping_address": {
            "recipient_name": "Budi New",
            "phone_number": "08111111111",
            "address_line": "Jl. Address Baru No. 99",
            "sub_district": "Gambir",
            "district": "Gambir",
            "city": "Jakarta Pusat",
            "province": "DKI Jakarta",
            "postal_code": "10110",
            "country": "Indonesia",
        },
        "shipping_method_id": shipping_method.id,
    }

    response = authenticated_client.post(
        order_list_url(),
        payload,
        format="json",
    )

    assert response.status_code == 201

    order = Order.objects.get(
        order_number=response.data["order_number"],
    )

    order_address = order.addresses.get(
        address_type=OrderAddress.AddressType.SHIPPING,
    )

    assert order_address.recipient_name == "Budi New"
    assert order_address.phone_number == "08111111111"
    assert order_address.address_line == "Jl. Address Baru No. 99"

    assert not Address.objects.filter(
        user=order.user,
        recipient_name="Budi New",
    ).exists()


@pytest.mark.django_db
def test_create_order_requires_shipping_address(
    authenticated_client,
    shipping_method,
    cart,
):
    response = authenticated_client.post(
        order_list_url(),
        {
            "shipping_method_id": shipping_method.id,
        },
        format="json",
    )

    assert response.status_code == 400
    assert "shipping_address" in response.data


@pytest.mark.django_db
def test_create_order_rejects_both_shipping_address_sources(
    authenticated_client,
    address,
    shipping_method,
    cart,
):
    payload = {
        "shipping_address_id": address.id,
        "shipping_address": {
            "recipient_name": "Budi New",
            "phone_number": "08111111111",
            "address_line": "Jl. Address Baru No. 99",
            "sub_district": "Gambir",
            "district": "Gambir",
            "city": "Jakarta Pusat",
            "province": "DKI Jakarta",
            "postal_code": "10110",
            "country": "Indonesia",
        },
        "shipping_method_id": shipping_method.id,
    }

    response = authenticated_client.post(
        order_list_url(),
        payload,
        format="json",
    )

    assert response.status_code == 400
    assert "shipping_address" in response.data


@pytest.mark.django_db
def test_create_order_rejects_other_users_saved_address(
    authenticated_client,
    other_address,
    shipping_method,
    cart,
):
    response = authenticated_client.post(
        order_list_url(),
        {
            "shipping_address_id": other_address.id,
            "shipping_method_id": shipping_method.id,
        },
        format="json",
    )

    assert response.status_code == 400
    assert response.data["shipping_address_id"] == ["Address not found."]


@pytest.mark.django_db
def test_create_order_rejects_inactive_shipping_method(
    authenticated_client,
    address,
    inactive_shipping_method,
    cart,
):
    response = authenticated_client.post(
        order_list_url(),
        {
            "shipping_address_id": address.id,
            "shipping_method_id": inactive_shipping_method.id,
        },
        format="json",
    )

    assert response.status_code == 400
    assert "shipping_method_id" in response.data


@pytest.mark.django_db
def test_create_order_response_contains_order_data(
    authenticated_client,
    address,
    shipping_method,
    cart,
):
    response = authenticated_client.post(
        order_list_url(),
        {
            "shipping_address_id": address.id,
            "shipping_method_id": shipping_method.id,
        },
        format="json",
    )

    assert response.status_code == 201

    assert response.data["status"] == Order.Status.PENDING
    assert response.data["currency"] == "IDR"
    assert response.data["subtotal"] == "500000"
    assert response.data["shipping_amount"] == "15000"
    assert response.data["total_amount"] == "515000"

    assert len(response.data["items"]) == 1
    assert response.data["items"][0]["quantity"] == 2

    assert len(response.data["addresses"]) == 1
    assert response.data["addresses"][0]["address_type"] == OrderAddress.AddressType.SHIPPING


@pytest.mark.django_db
def test_cancel_pending_order(
    authenticated_client,
    order,
    order_with_address,
):
    response = authenticated_client.post(
        order_cancel_url(order.order_number),
    )

    assert response.status_code == 200

    order.refresh_from_db()

    assert order.status == Order.Status.CANCELLED
    assert response.data["status"] == Order.Status.CANCELLED


@pytest.mark.django_db
def test_staff_can_list_all_orders(
    staff_client,
    order,
    other_user,
    shipping_method,
):
    Order.objects.create(
        user=other_user,
        status=Order.Status.PENDING,
        subtotal=Decimal("100000"),
        discount_amount=Decimal("0"),
        shipping_amount=shipping_method.price,
        shipping_method_code=shipping_method.code,
        shipping_courier=shipping_method.courier,
        shipping_service=shipping_method.service,
        tax_amount=Decimal("0"),
        total_amount=Decimal("115000"),
        currency="IDR",
    )

    response = staff_client.get(admin_order_list_url())

    assert response.status_code == 200
    assert len(response.data) == 2


@pytest.mark.django_db
def test_staff_can_retrieve_any_order(
    staff_client,
    order,
    order_with_address,
):
    response = staff_client.get(
        admin_order_detail_url(order.order_number),
    )

    assert response.status_code == 200
    assert response.data["order_number"] == order.order_number


@pytest.mark.django_db
def test_normal_user_cannot_access_admin_order_list(
    authenticated_client,
):
    response = authenticated_client.get(
        admin_order_list_url(),
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_normal_user_cannot_access_admin_order_detail(
    authenticated_client,
    order,
):
    response = authenticated_client.get(
        admin_order_detail_url(order.order_number),
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_customer_cannot_cancel_other_users_order(
    authenticated_client,
    other_user,
    shipping_method,
):
    other_order = Order.objects.create(
        user=other_user,
        status=Order.Status.PENDING,
        subtotal=Decimal("100000"),
        discount_amount=Decimal("0"),
        shipping_amount=shipping_method.price,
        shipping_method_code=shipping_method.code,
        shipping_courier=shipping_method.courier,
        shipping_service=shipping_method.service,
        tax_amount=Decimal("0"),
        total_amount=Decimal("115000"),
        currency="IDR",
    )

    response = authenticated_client.post(
        order_cancel_url(other_order.order_number),
    )

    assert response.status_code == 404

    other_order.refresh_from_db()

    assert other_order.status == Order.Status.PENDING
