from rest_framework import serializers

from apps.catalog.models import ProductVariant

from .models import Inventory, InventoryReservation


class InventorySerializer(serializers.ModelSerializer):
    variant_sku = serializers.CharField(
        source="variant.sku",
        read_only=True,
    )
    available = serializers.IntegerField(read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "id",
            "variant",
            "variant_sku",
            "stock_on_hand",
            "reserved",
            "available",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "stock_on_hand",
            "reserved",
            "available",
            "updated_at",
        ]


class AddStockSerializer(serializers.Serializer):
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_active=True),
    )
    quantity = serializers.IntegerField(min_value=1)


class InventoryReservationSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True,
    )
    variant_sku = serializers.CharField(
        source="inventory.variant.sku",
        read_only=True,
    )

    class Meta:
        model = InventoryReservation
        fields = [
            "id",
            "order",
            "order_number",
            "inventory",
            "variant_sku",
            "quantity",
            "status",
            "expires_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
