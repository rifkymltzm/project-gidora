from rest_framework import serializers

from .models import Shipment, ShipmentItem, ShippingMethod


class ShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingMethod
        fields = [
            "id",
            "code",
            "courier",
            "service",
            "price",
        ]
        read_only_fields = fields


class ShipmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentItem
        fields = [
            "id",
            "product_name_snapshot",
            "sku_snapshot",
            "quantity",
        ]
        read_only_fields = fields


class ShipmentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True,
        help_text="Nomor order yang terkait dengan shipment.",
    )

    order_status = serializers.CharField(
        source="order.status",
        read_only=True,
        help_text="Status keseluruhan order.",
    )

    items = ShipmentItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Shipment
        fields = [
            "id",
            "order_number",
            "order_status",
            "status",
            "courier",
            "service",
            "tracking_number",
            "shipped_at",
            "delivered_at",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = fields


class ShipmentShipSerializer(serializers.Serializer):
    tracking_number = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        help_text="Nomor resi dari kurir.",
    )
