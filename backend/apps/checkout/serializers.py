from rest_framework import serializers


class CheckoutItemSerializer(serializers.Serializer):
    cart_item_id = serializers.IntegerField()
    variant_id = serializers.IntegerField()
    product_name = serializers.CharField()
    sku = serializers.CharField()
    color = serializers.CharField()
    size = serializers.CharField()

    price = serializers.DecimalField(
        max_digits=14,
        decimal_places=0,
    )

    available = serializers.IntegerField()

    quantity = serializers.IntegerField()

    subtotal = serializers.DecimalField(
        max_digits=14,
        decimal_places=0,
    )


class CheckoutShippingMethodSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    code = serializers.CharField()
    courier = serializers.CharField()
    service = serializers.CharField()

    price = serializers.DecimalField(
        max_digits=14,
        decimal_places=0,
    )


class CheckoutSummarySerializer(serializers.Serializer):
    cart_id = serializers.IntegerField()

    items = CheckoutItemSerializer(
        many=True,
    )

    shipping_methods = CheckoutShippingMethodSerializer(
        many=True,
    )

    selected_shipping_method_id = serializers.IntegerField(
        allow_null=True,
    )

    subtotal = serializers.DecimalField(
        max_digits=14,
        decimal_places=0,
    )

    discount_amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=0,
    )

    shipping_amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=0,
    )

    tax_amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=0,
    )

    grand_total = serializers.DecimalField(
        max_digits=14,
        decimal_places=0,
    )
