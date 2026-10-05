import pytest
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

from apps.catalog.models import (
    Category,
    Color,
    Product,
    ProductColor,
    ProductVariant,
    Size,
    SizeType,
)
from apps.catalog.services import (
    create_color,
    create_product,
    create_product_variant,
    generate_color_slug,
    generate_product_slug,
)


@pytest.fixture
def apparel_size_type():
    return SizeType.objects.create(
        name="Apparel",
        code=SizeType.Code.APPAREL,
    )


@pytest.fixture
def footwear_size_type():
    return SizeType.objects.create(
        name="Footwear",
        code=SizeType.Code.FOOTWEAR,
    )


@pytest.fixture
def category(apparel_size_type):
    return Category.objects.create(
        name="Shirts",
        code="SH",
        default_size_type=apparel_size_type,
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
def product(category):
    return create_product(
        category=category,
        name="Basic Shirt",
        gender=Product.Gender.MEN,
    )


@pytest.fixture
def product_color(product, color):
    return ProductColor.objects.create(
        product=product,
        color=color,
    )


@pytest.fixture
def apparel_size(apparel_size_type):
    return Size.objects.create(
        size_type=apparel_size_type,
        name="M",
        sort_order=3,
    )


@pytest.fixture
def footwear_size(footwear_size_type):
    return Size.objects.create(
        size_type=footwear_size_type,
        name="42",
        sort_order=4,
    )


@pytest.mark.django_db
def test_generate_product_slug():
    assert generate_product_slug("Basic Shirt") == "basic-shirt"


@pytest.mark.django_db
def test_generate_product_slug_handles_duplicate():
    Product.objects.create(
        product_code="GDR-SH-001",
        name="Basic Shirt",
        slug="basic-shirt",
        category=Category.objects.create(
            name="Shirts",
            code="SH",
            default_size_type=SizeType.objects.create(
                name="Apparel",
                code=SizeType.Code.APPAREL,
            ),
        ),
        gender=Product.Gender.MEN,
        size_type=SizeType.objects.get(code=SizeType.Code.APPAREL),
    )

    assert generate_product_slug("Basic Shirt") == "basic-shirt-2"


@pytest.mark.django_db
def test_generate_color_slug():
    assert generate_color_slug("Dark Navy") == "dark-navy"


@pytest.mark.django_db
def test_generate_color_slug_handles_duplicate():
    Color.objects.create(
        name="Dark Navy",
        code="NVY",
        slug="dark-navy",
        hex_code="#000080",
    )

    assert generate_color_slug("Dark Navy") == "dark-navy-2"


@pytest.mark.django_db
def test_create_product_generates_product_code_and_slug(category):
    product = create_product(
        category=category,
        name="Basic Shirt",
        gender=Product.Gender.MEN,
    )

    assert product.product_code == "GDR-SH-001"
    assert product.slug == "basic-shirt"
    assert product.size_type == category.default_size_type


@pytest.mark.django_db
def test_create_product_increments_category_sequence(category):
    first = create_product(
        category=category,
        name="Basic Shirt",
        gender=Product.Gender.MEN,
    )

    second = create_product(
        category=category,
        name="Oversized Shirt",
        gender=Product.Gender.MEN,
    )

    assert first.product_code == "GDR-SH-001"
    assert second.product_code == "GDR-SH-002"

    category.refresh_from_db()

    assert category.next_product_sequence == 3


@pytest.mark.django_db
def test_create_product_uses_explicit_size_type(
    category,
    footwear_size_type,
):
    product = create_product(
        category=category,
        name="Sneaker",
        gender=Product.Gender.UNISEX,
        size_type=footwear_size_type,
    )

    assert product.size_type == footwear_size_type


@pytest.mark.django_db
def test_create_color_generates_slug():
    color = create_color(
        name="Dark Navy",
        code="NVY",
        hex_code="#000080",
    )

    assert color.slug == "dark-navy"


@pytest.mark.django_db
def test_create_product_variant_generates_sku(
    product_color,
    apparel_size,
):
    variant = create_product_variant(
        product_color=product_color,
        size=apparel_size,
        price=150000,
    )

    assert variant.sku == "GDR-SH-001-BLK-M"
    assert variant.price == 150000


@pytest.mark.django_db
def test_create_product_variant_rejects_wrong_size_type(
    product_color,
    footwear_size,
):
    with pytest.raises(DjangoValidationError):
        create_product_variant(
            product_color=product_color,
            size=footwear_size,
            price=150000,
        )


@pytest.mark.django_db
def test_create_product_variant_rejects_negative_price(
    product_color,
    apparel_size,
):
    with pytest.raises(DRFValidationError):
        create_product_variant(
            product_color=product_color,
            size=apparel_size,
            price=-1,
        )
