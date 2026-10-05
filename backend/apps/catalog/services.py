from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.text import slugify

from rest_framework import serializers


from .models import Category, Color, Product, ProductVariant


def generate_product_slug(name):
    base_slug = slugify(name)

    if not base_slug:
        raise ValidationError({"name": "Product name must contain valid characters."})

    slug = base_slug
    counter = 2

    while Product.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


def generate_color_slug(name):
    base_slug = slugify(name)

    if not base_slug:
        raise ValidationError({"name": "Color name must contain valid characters."})

    slug = base_slug
    counter = 2

    while Color.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


@transaction.atomic
def create_product(*, category, name, **extra_fields):
    category = Category.objects.select_for_update().get(pk=category.pk)

    extra_fields.setdefault(
        "size_type",
        category.default_size_type,
    )

    sequence = category.next_product_sequence

    product_code = f"GDR-{category.code}-{sequence:03d}"

    category.next_product_sequence = sequence + 1

    category.save(update_fields=["next_product_sequence"])

    product = Product.objects.create(
        category=category,
        name=name,
        product_code=product_code,
        slug=generate_product_slug(name),
        **extra_fields,
    )

    return product


def create_color(*, name, code, hex_code, **extra_fields):
    color = Color.objects.create(
        name=name,
        code=code,
        slug=generate_color_slug(name),
        hex_code=hex_code,
        **extra_fields,
    )

    return color


def create_product_variant(
    *,
    product_color,
    size,
    price,
    **extra_fields,
):
    product = product_color.product

    if size.size_type_id != product.size_type_id:
        raise ValidationError(
            {"size": ("Size must belong to the same size type " "as the product.")}
        )

    sku = f"{product.product_code}-" f"{product_color.color.code}-" f"{size.name.upper()}"

    variant = ProductVariant(
        product_color=product_color,
        size=size,
        sku=sku,
        price=price,
        **extra_fields,
    )

    try:
        variant.full_clean()
    except ValidationError as exc:
        raise serializers.ValidationError(exc.message_dict)

    variant.save()

    return variant
