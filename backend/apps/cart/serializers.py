from decimal import Decimal

from rest_framework import serializers

from apps.catalog.models import ProductVariant

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """
    Read-only representation of a cart item.
    """

    product_name = serializers.CharField(
        source="variant.product_color.product.name",
        read_only=True,
    )

    sku = serializers.CharField(
        source="variant.sku",
        read_only=True,
    )

    color = serializers.CharField(
        source="variant.product_color.color.name",
        read_only=True,
    )

    size = serializers.CharField(
        source="variant.size.name",
        read_only=True,
    )

    price = serializers.DecimalField(
        source="variant.price",
        max_digits=14,
        decimal_places=0,
        read_only=True,
    )

    available = serializers.IntegerField(
        source="available_stock",
        read_only=True,
        help_text=("Jumlah unit variant yang saat ini tersedia " "untuk dibeli."),
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "variant",
            "product_name",
            "sku",
            "color",
            "size",
            "price",
            "available",
            "quantity",
            "subtotal",
            "created_at",
            "updated_at",
        ]

        read_only_fields = fields

    def get_subtotal(self, obj) -> Decimal:
        return obj.variant.price * obj.quantity


class AddCartItemSerializer(serializers.Serializer):
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(
            is_active=True,
        ),
        help_text="ID product variant yang ingin ditambahkan.",
    )

    quantity = serializers.IntegerField(
        min_value=1,
        help_text="Jumlah unit yang ingin ditambahkan.",
    )


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(
        min_value=1,
        help_text="Jumlah unit baru.",
    )


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    total_items = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "status",
            "items",
            "total_items",
            "subtotal",
            "created_at",
            "updated_at",
        ]

        read_only_fields = fields

    def get_total_items(self, obj) -> int:
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj) -> Decimal:
        return sum(
            (item.variant.price * item.quantity for item in obj.items.all()),
            Decimal("0"),
        )
