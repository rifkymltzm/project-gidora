import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from apps.catalog.models import (
    Category,
    Color,
    Product,
    ProductColor,
    ProductImage,
    ProductVariant,
    Size,
    SizeType,
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
    return Product.objects.create(
        product_code="GDR-SH-001",
        name="Basic Shirt",
        slug="basic-shirt",
        category=category,
        gender=Product.Gender.MEN,
        size_type=category.default_size_type,
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
def test_size_name_is_unique_case_insensitive(apparel_size_type):
    Size.objects.create(
        size_type=apparel_size_type,
        name="M",
    )

    with pytest.raises(IntegrityError):
        Size.objects.create(
            size_type=apparel_size_type,
            name="m",
        )


@pytest.mark.django_db
def test_category_name_is_unique_case_insensitive(apparel_size_type):
    Category.objects.create(
        name="Shirts",
        code="SH",
        default_size_type=apparel_size_type,
    )

    with pytest.raises(IntegrityError):
        Category.objects.create(
            name="shirts",
            code="TS",
            default_size_type=apparel_size_type,
        )


@pytest.mark.django_db
def test_color_name_is_unique_case_insensitive():
    Color.objects.create(
        name="Black",
        code="BLK",
        slug="black",
        hex_code="#000000",
    )

    with pytest.raises(IntegrityError):
        Color.objects.create(
            name="black",
            code="BLACK",
            slug="black-2",
            hex_code="#111111",
        )


@pytest.mark.django_db
def test_product_variant_accepts_matching_size_type(
    product_color,
    apparel_size,
):
    variant = ProductVariant(
        product_color=product_color,
        size=apparel_size,
        sku="GDR-SH-001-BLK-M",
        price=150000,
    )

    variant.full_clean()


@pytest.mark.django_db
def test_product_variant_rejects_wrong_size_type(
    product_color,
    footwear_size,
):
    variant = ProductVariant(
        product_color=product_color,
        size=footwear_size,
        sku="GDR-SH-001-BLK-42",
        price=150000,
    )

    with pytest.raises(ValidationError):
        variant.full_clean()


@pytest.mark.django_db
def test_product_variant_rejects_negative_price(
    product_color,
    apparel_size,
):
    variant = ProductVariant(
        product_color=product_color,
        size=apparel_size,
        sku="GDR-SH-001-BLK-M",
        price=-1,
    )

    with pytest.raises(ValidationError):
        variant.full_clean()


@pytest.mark.django_db
def test_product_image_rejects_product_color_from_another_product(
    product,
    category,
    color,
):
    another_product = Product.objects.create(
        product_code="GDR-SH-002",
        name="Another Shirt",
        slug="another-shirt",
        category=category,
        gender=Product.Gender.MEN,
        size_type=category.default_size_type,
    )

    product_color = ProductColor.objects.create(
        product=another_product,
        color=color,
    )

    image = ProductImage(
        product=product,
        product_color=product_color,
        image_type=ProductImage.ImageType.PRIMARY,
        sort_order=0,
    )

    with pytest.raises(ValidationError):
        image.full_clean()


@pytest.mark.django_db
def test_product_color_can_have_only_one_primary_image(
    product,
    product_color,
    tmp_path,
):
    image_1 = ProductImage.objects.create(
        product=product,
        product_color=product_color,
        image="products/one.jpg",
        image_type=ProductImage.ImageType.PRIMARY,
        sort_order=0,
    )

    assert image_1.pk is not None

    with pytest.raises(IntegrityError):
        ProductImage.objects.create(
            product=product,
            product_color=product_color,
            image="products/two.jpg",
            image_type=ProductImage.ImageType.PRIMARY,
            sort_order=1,
        )
