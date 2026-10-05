from rest_framework import serializers

from apps.accounts.models import Address
from apps.shipping.models import ShippingMethod

from .models import Order, OrderAddress, OrderItem


class ShippingAddressInputSerializer(serializers.Serializer):
    recipient_name = serializers.CharField(
        max_length=150,
    )

    phone_number = serializers.CharField(
        max_length=30,
    )

    address_line = serializers.CharField()

    sub_district = serializers.CharField(
        max_length=100,
    )

    district = serializers.CharField(
        max_length=100,
    )

    city = serializers.CharField(
        max_length=100,
    )

    province = serializers.CharField(
        max_length=100,
    )

    postal_code = serializers.CharField(
        max_length=20,
    )

    country = serializers.CharField(
        max_length=100,
        default="Indonesia",
    )


class OrderCreateSerializer(serializers.Serializer):
    shipping_address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(),
        required=False,
        write_only=True,
    )

    shipping_address = ShippingAddressInputSerializer(
        required=False,
        write_only=True,
    )

    shipping_method_id = serializers.PrimaryKeyRelatedField(
        queryset=ShippingMethod.objects.filter(
            is_active=True,
        ),
    )

    def validate(self, attrs):
        request = self.context["request"]

        saved_address = attrs.get("shipping_address_id")
        new_shipping_address = attrs.get("shipping_address")

        if not saved_address and not new_shipping_address:
            raise serializers.ValidationError(
                {"shipping_address": ("Provide either shipping_address_id " "or shipping_address.")}
            )

        if saved_address and new_shipping_address:
            raise serializers.ValidationError(
                {
                    "shipping_address": (
                        "Provide either shipping_address_id " "or shipping_address, not both."
                    )
                }
            )

        if saved_address:
            if saved_address.user_id != request.user.id:
                raise serializers.ValidationError({"shipping_address_id": ("Address not found.")})

            attrs["shipping_address_data"] = {
                "recipient_name": saved_address.recipient_name,
                "phone_number": saved_address.phone_number,
                "address_line": saved_address.address_line,
                "sub_district": saved_address.sub_district,
                "district": saved_address.district,
                "city": saved_address.city,
                "province": saved_address.province,
                "postal_code": saved_address.postal_code,
                "country": saved_address.country,
            }

        else:
            attrs["shipping_address_data"] = new_shipping_address

        return attrs


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name_snapshot",
            "sku_snapshot",
            "variant_snapshot",
            "unit_price",
            "quantity",
            "subtotal",
        ]
        read_only_fields = fields


class OrderAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderAddress
        fields = [
            "id",
            "address_type",
            "recipient_name",
            "phone_number",
            "address_line",
            "sub_district",
            "district",
            "city",
            "province",
            "postal_code",
            "country",
        ]
        read_only_fields = fields


class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "total_amount",
            "currency",
            "created_at",
        ]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    addresses = OrderAddressSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "subtotal",
            "discount_amount",
            "shipping_amount",
            "shipping_method_code",
            "shipping_courier",
            "shipping_service",
            "tax_amount",
            "total_amount",
            "currency",
            "items",
            "addresses",
            "created_at",
        ]
        read_only_fields = fields
