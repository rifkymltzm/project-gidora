from io import BytesIO

from PIL import Image

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
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
from apps.inventory.models import Inventory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="customer@gidora.com",
        password="password123",
    )


@pytest.fixture
def staff(db):
    user = User.objects.create_user(
        email="staff@gidora.com",
        password="password123",
    )
    user.is_staff = True
    user.save(update_fields=["is_staff"])
    return user


@pytest.fixture
def superuser(db):
    return User.objects.create_superuser(
        email="admin@gidora.com",
        password="password123",
    )


@pytest.fixture
def size_type(db):
    return SizeType.objects.create(
        name="Apparel",
        code=SizeType.Code.APPAREL,
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
def second_color():
    return Color.objects.create(
        name="White",
        code="WHT",
        slug="white",
        hex_code="#FFFFFF",
    )


@pytest.fixture
def size(size_type):
    return Size.objects.create(
        size_type=size_type,
        name="M",
        sort_order=3,
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
def another_product(category):
    return Product.objects.create(
        product_code="GDR-SH-002",
        name="Oversized Shirt",
        slug="oversized-shirt",
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
def second_product_color(product, second_color):
    return ProductColor.objects.create(
        product=product,
        color=second_color,
    )


@pytest.fixture
def another_product_color(another_product, second_color):
    return ProductColor.objects.create(
        product=another_product,
        color=second_color,
    )


@pytest.fixture
def variant(product_color, size):
    return ProductVariant.objects.create(
        product_color=product_color,
        size=size,
        sku="GDR-SH-001-BLK-M",
        price=150000,
    )


def make_image(name="shirt.jpg"):
    image = Image.new(
        "RGB",
        (100, 100),
        color="white",
    )

    buffer = BytesIO()

    image.save(
        buffer,
        format="JPEG",
    )

    buffer.seek(0)

    return SimpleUploadedFile(
        name=name,
        content=buffer.read(),
        content_type="image/jpeg",
    )


@pytest.mark.django_db
class TestPublicCatalogAPI:

    def test_product_list_is_public(
        self,
        api_client,
        product,
    ):
        response = api_client.get(reverse("product-list"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_product_detail_is_public(
        self,
        api_client,
        product,
    ):
        response = api_client.get(
            reverse(
                "product-detail",
                kwargs={"pk": product.pk},
            )
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["product_code"] == product.product_code

    def test_product_filter_by_category_code(
        self,
        api_client,
        product,
    ):
        response = api_client.get(
            reverse("product-list"),
            {"category": "SH"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_product_filter_by_gender(
        self,
        api_client,
        product,
    ):
        response = api_client.get(
            reverse("product-list"),
            {"gender": "men"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_product_filter_by_color_code(
        self,
        api_client,
        product,
        product_color,
    ):
        response = api_client.get(
            reverse("product-list"),
            {"color": "BLK"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_product_filter_by_size(
        self,
        api_client,
        product,
        variant,
    ):
        response = api_client.get(
            reverse("product-list"),
            {"size": "M"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_product_search_by_name(
        self,
        api_client,
        product,
    ):
        response = api_client.get(
            reverse("product-list"),
            {"search": "Basic Shirt"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_product_ordering_by_name(
        self,
        api_client,
        category,
    ):
        Product.objects.create(
            product_code="GDR-SH-001",
            name="Basic Shirt",
            slug="basic-shirt",
            category=category,
            gender=Product.Gender.MEN,
            size_type=category.default_size_type,
        )

        Product.objects.create(
            product_code="GDR-SH-002",
            name="Zipper Shirt",
            slug="zipper-shirt",
            category=category,
            gender=Product.Gender.MEN,
            size_type=category.default_size_type,
        )

        response = api_client.get(
            reverse("product-list"),
            {"ordering": "name"},
        )

        assert response.status_code == status.HTTP_200_OK

        names = [item["name"] for item in response.data["results"]]

        assert names == [
            "Basic Shirt",
            "Zipper Shirt",
        ]

    def test_inactive_product_is_not_public(
        self,
        api_client,
        product,
    ):
        product.is_active = False
        product.save(update_fields=["is_active"])

        response = api_client.get(reverse("product-list"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0

    def test_product_variant_returns_available_stock(
        self,
        api_client,
        product,
        product_color,
        variant,
    ):
        Inventory.objects.create(
            variant=variant,
            stock_on_hand=10,
            reserved=3,
        )

        response = api_client.get(
            reverse(
                "product-detail",
                kwargs={"pk": product.pk},
            )
        )

        assert response.status_code == status.HTTP_200_OK

        variants = response.data["product_colors"][0]["variants"]

        assert variants[0]["available"] == 7


@pytest.mark.django_db
class TestAdminCatalogAPI:

    def test_product_admin_requires_staff(
        self,
        api_client,
    ):
        response = api_client.get(reverse("admin-product-list"))

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_product_admin_allows_staff(
        self,
        api_client,
        staff,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(reverse("admin-product-list"))

        assert response.status_code == status.HTTP_200_OK

    def test_product_admin_rejects_normal_user(
        self,
        api_client,
        user,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.get(reverse("admin-product-list"))

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_master_category_requires_superuser(
        self,
        api_client,
        staff,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(reverse("admin-category-list"))

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_master_category_allows_superuser(
        self,
        api_client,
        superuser,
    ):
        api_client.force_authenticate(user=superuser)

        response = api_client.get(reverse("admin-category-list"))

        assert response.status_code == status.HTTP_200_OK

    def test_staff_can_create_product(
        self,
        api_client,
        staff,
        category,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-product-list"),
            {
                "name": "New Shirt",
                "category": category.pk,
                "gender": "men",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        product = Product.objects.get(name="New Shirt")

        assert product.product_code == "GDR-SH-001"
        assert product.slug == "new-shirt"

    def test_staff_can_create_product_color(
        self,
        api_client,
        staff,
        product,
        color,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-product-color-list"),
            {
                "product": product.pk,
                "color": color.pk,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        assert ProductColor.objects.filter(
            product=product,
            color=color,
        ).exists()

    def test_staff_can_create_product_variant(
        self,
        api_client,
        staff,
        product_color,
        size,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-product-variant-list"),
            {
                "product_color": product_color.pk,
                "size": size.pk,
                "price": "150000",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        variant = ProductVariant.objects.get(
            product_color=product_color,
            size=size,
        )

        assert variant.sku == "GDR-SH-001-BLK-M"

    def test_staff_cannot_create_duplicate_product_variant(
        self,
        api_client,
        staff,
        variant,
        product_color,
        size,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-product-variant-list"),
            {
                "product_color": product_color.pk,
                "size": size.pk,
                "price": "175000",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_staff_can_create_product_image(
        self,
        api_client,
        staff,
        product,
        product_color,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-product-image-list"),
            {
                "product": product.pk,
                "product_color": product_color.pk,
                "image": make_image(),
                "image_type": "primary",
                "sort_order": 0,
            },
            format="multipart",
        )

        assert response.status_code == status.HTTP_201_CREATED

        assert ProductImage.objects.filter(
            product=product,
            product_color=product_color,
            image_type=ProductImage.ImageType.PRIMARY,
        ).exists()

    def test_product_image_rejects_product_color_from_another_product(
        self,
        api_client,
        staff,
        product,
        another_product_color,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-product-image-list"),
            {
                "product": product.pk,
                "product_color": another_product_color.pk,
                "image": make_image(),
                "image_type": "detail",
                "sort_order": 0,
            },
            format="multipart",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "product_color" in response.data

    def test_product_image_rejects_second_primary_image(
        self,
        api_client,
        staff,
        product,
        product_color,
    ):
        ProductImage.objects.create(
            product=product,
            product_color=product_color,
            image=make_image("existing.jpg"),
            image_type=ProductImage.ImageType.PRIMARY,
            sort_order=0,
        )

        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-product-image-list"),
            {
                "product": product.pk,
                "product_color": product_color.pk,
                "image": make_image("second.jpg"),
                "image_type": "primary",
                "sort_order": 1,
            },
            format="multipart",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "image_type" in response.data

    def test_staff_cannot_create_category(
        self,
        api_client,
        staff,
        size_type,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-category-list"),
            {
                "name": "Pants",
                "code": "PT",
                "default_size_type": size_type.pk,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_superuser_can_create_category(
        self,
        api_client,
        superuser,
        size_type,
    ):
        api_client.force_authenticate(user=superuser)

        response = api_client.post(
            reverse("admin-category-list"),
            {
                "name": "Pants",
                "code": "PT",
                "default_size_type": size_type.pk,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        assert Category.objects.filter(code="PT").exists()
