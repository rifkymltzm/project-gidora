from rest_framework import serializers

from .models import (
    Category,
    Color,
    Product,
    ProductColor,
    ProductImage,
    ProductVariant,
    Size,
    SizeType,
)


class SizeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SizeType
        fields = [
            "id",
            "name",
            "code",
            "is_active",
        ]


class SizeSerializer(serializers.ModelSerializer):
    size_type = SizeTypeSerializer(read_only=True)

    class Meta:
        model = Size
        fields = [
            "id",
            "name",
            "size_type",
            "sort_order",
            "is_active",
        ]


class CategorySerializer(serializers.ModelSerializer):
    default_size_type = SizeTypeSerializer(read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "code",
            "default_size_type",
            "is_active",
        ]


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = [
            "id",
            "name",
            "code",
            "slug",
            "hex_code",
            "is_active",
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "product_color",
            "image",
            "image_type",
            "sort_order",
        ]


class ProductVariantSizeSerializer(serializers.ModelSerializer):
    """
    Simplified size representation for ProductVariant.

    Product already exposes its size_type, so repeating size_type
    inside every variant would be redundant.
    """

    class Meta:
        model = Size
        fields = [
            "id",
            "name",
            "sort_order",
            "is_active",
        ]


class ProductVariantSerializer(serializers.ModelSerializer):
    size = ProductVariantSizeSerializer(read_only=True)

    available = serializers.IntegerField(
        source="available_stock",
        read_only=True,
        help_text=(
            "Jumlah unit yang saat ini tersedia untuk dibeli. "
            "Dihitung dari stock_on_hand - reserved. "
            "Jika inventory belum tersedia, nilainya 0."
        ),
    )

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "sku",
            "size",
            "price",
            "available",
            "is_active",
        ]


class ProductColorSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)

    variants = ProductVariantSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = ProductColor
        fields = [
            "id",
            "color",
            "variants",
            "is_active",
        ]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    size_type = SizeTypeSerializer(read_only=True)

    product_colors = ProductColorSerializer(
        many=True,
        read_only=True,
    )

    images = ProductImageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "product_code",
            "name",
            "slug",
            "description",
            "material",
            "badge",
            "category",
            "gender",
            "size_type",
            "product_colors",
            "images",
            "is_active",
            "created_at",
            "updated_at",
        ]
