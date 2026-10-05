from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower

CODE_VALIDATOR = RegexValidator(
    regex=r"^[A-Z0-9]+(?:-[A-Z0-9]+)*$",
    message=("Code must contain only uppercase letters, " "numbers, and hyphens."),
)

HEX_COLOR_VALIDATOR = RegexValidator(
    regex=r"^#[0-9A-Fa-f]{6}$",
    message="Hex color must use format #RRGGBB.",
)


class SizeType(models.Model):
    class Code(models.TextChoices):
        APPAREL = "APPAREL", "Apparel"
        FOOTWEAR = "FOOTWEAR", "Footwear"
        ONE_SIZE = "ONE_SIZE", "One Size"

    name = models.CharField(
        max_length=50,
        unique=True,
    )

    code = models.CharField(
        max_length=20,
        choices=Code.choices,
        unique=True,
        editable=False,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Size(models.Model):
    size_type = models.ForeignKey(
        SizeType,
        on_delete=models.PROTECT,
        related_name="sizes",
    )

    name = models.CharField(
        max_length=30,
    )

    sort_order = models.PositiveIntegerField(
        default=0,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = [
            "size_type",
            "sort_order",
            "name",
        ]
        constraints = [
            models.UniqueConstraint(
                Lower("name"),
                "size_type",
                name="uq_size_name_per_type_ci",
            ),
        ]

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(
        max_length=100,
    )

    code = models.CharField(
        max_length=10,
        unique=True,
        validators=[CODE_VALIDATOR],
    )

    default_size_type = models.ForeignKey(
        SizeType,
        on_delete=models.PROTECT,
        related_name="default_categories",
    )

    next_product_sequence = models.PositiveIntegerField(
        default=1,
        editable=False,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                Lower("name"),
                name="uq_category_name_ci",
            ),
            models.CheckConstraint(
                condition=Q(next_product_sequence__gte=1),
                name="ck_category_sequence_positive",
            ),
        ]

    def __str__(self):
        return self.name


class Color(models.Model):
    name = models.CharField(
        max_length=50,
    )

    code = models.CharField(
        max_length=10,
        unique=True,
        validators=[CODE_VALIDATOR],
    )

    slug = models.SlugField(
        max_length=60,
        unique=True,
        editable=False,
    )

    hex_code = models.CharField(
        max_length=7,
        validators=[HEX_COLOR_VALIDATOR],
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                Lower("name"),
                name="uq_color_name_ci",
            ),
        ]

    def __str__(self):
        return self.name


class Product(models.Model):
    class Gender(models.TextChoices):
        MEN = "men", "Men"
        WOMEN = "women", "Women"
        UNISEX = "unisex", "Unisex"

    product_code = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
    )

    name = models.CharField(
        max_length=200,
    )

    slug = models.SlugField(
        max_length=240,
        unique=True,
        editable=False,
    )

    description = models.TextField(
        blank=True,
    )

    material = models.CharField(
        max_length=200,
        blank=True,
    )

    badge = models.CharField(
        max_length=50,
        blank=True,
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
    )

    size_type = models.ForeignKey(
        SizeType,
        on_delete=models.PROTECT,
        related_name="products",
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product_code} - {self.name}"


class ProductColor(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="product_colors",
    )

    color = models.ForeignKey(
        Color,
        on_delete=models.PROTECT,
        related_name="product_colors",
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "color"],
                name="uq_product_color",
            ),
        ]

    def __str__(self):
        return f"{self.product.product_code} - " f"{self.color.name}"


class ProductVariant(models.Model):
    product_color = models.ForeignKey(
        ProductColor,
        on_delete=models.CASCADE,
        related_name="variants",
    )

    size = models.ForeignKey(
        Size,
        on_delete=models.PROTECT,
        related_name="product_variants",
    )

    sku = models.CharField(
        max_length=80,
        unique=True,
        editable=False,
    )

    price = models.DecimalField(
        max_digits=14,
        decimal_places=0,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = [
            "size__sort_order",
            "size__name",
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["product_color", "size"],
                name="uq_product_variant_combination",
            ),
            models.CheckConstraint(
                condition=Q(price__gte=0),
                name="ck_product_variant_price_gte_0",
            ),
        ]

    def clean(self):
        if not self.product_color_id or not self.size_id:
            return

        product = self.product_color.product
        size = self.size

        if size.size_type_id != product.size_type_id:
            raise ValidationError(
                {
                    "size": (
                        f"Size '{size.name}' does not belong "
                        f"to product size type "
                        f"'{product.size_type.name}'."
                    )
                }
            )

    def __str__(self):
        return self.sku


class ProductImage(models.Model):
    class ImageType(models.TextChoices):
        PRIMARY = "primary", "Primary"
        DETAIL = "detail", "Detail"
        ADDITIONAL = "additional", "Additional"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )

    product_color = models.ForeignKey(
        ProductColor,
        on_delete=models.CASCADE,
        related_name="images",
    )

    image = models.ImageField(
        upload_to="products/",
    )

    image_type = models.CharField(
        max_length=20,
        choices=ImageType.choices,
    )

    sort_order = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        ordering = [
            "sort_order",
            "id",
        ]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product_color",
                    "image_type",
                    "sort_order",
                ],
                name="uq_product_color_image_order",
            ),
            models.UniqueConstraint(
                fields=["product_color"],
                condition=Q(image_type="primary"),
                name="uq_product_color_primary_image",
            ),
        ]

    def clean(self):
        if self.product_color_id and self.product_id:
            if self.product_color.product_id != self.product_id:
                raise ValidationError(
                    {"product_color": ("Product color must belong to " "the selected product.")}
                )

    def __str__(self):
        return (
            f"{self.product.product_code} - "
            f"{self.product_color.color.name} - "
            f"{self.image_type}"
        )
