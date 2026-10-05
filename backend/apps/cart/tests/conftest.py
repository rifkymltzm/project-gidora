import pytest
from rest_framework.test import APIClient

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
from apps.inventory.models import Inventory


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="customer@gidora.com",
        password="testpassword123",
        first_name="Budi",
        last_name="Customer",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="other@gidora.com",
        password="testpassword123",
        first_name="Other",
        last_name="Customer",
    )


@pytest.fixture
def size_type(db):
    return SizeType.objects.create(
        name="Apparel",
        code=SizeType.Code.APPAREL,
    )


@pytest.fixture
def size(db, size_type):
    return Size.objects.create(
        size_type=size_type,
        name="M",
        sort_order=3,
    )


@pytest.fixture
def category(db, size_type):
    return Category.objects.create(
        name="Shirts",
        code="SH",
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
def product(db, category, size_type):
    return Product.objects.create(
        product_code="GDR-SH-001",
        name="Basic Shirt",
        slug="basic-shirt",
        description="Test product",
        category=category,
        gender=Product.Gender.UNISEX,
        size_type=size_type,
    )


@pytest.fixture
def product_color(db, product, color):
    return ProductColor.objects.create(
        product=product,
        color=color,
    )


@pytest.fixture
def variant(db, product_color, size):
    return ProductVariant.objects.create(
        product_color=product_color,
        size=size,
        sku="GDR-SH-001-BLK-M",
        price=250000,
    )


@pytest.fixture
def inventory(db, variant):
    return Inventory.objects.create(
        variant=variant,
        stock_on_hand=10,
        reserved=0,
    )


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client
