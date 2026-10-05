from rest_framework import serializers

from .models import Payment


class PaymentCreateSerializer(serializers.Serializer):
    order_number = serializers.CharField(
        max_length=30,
    )
    payment_method = serializers.ChoiceField(
        choices=Payment.PaymentMethod.choices,
    )


class MidtransNotificationSerializer(serializers.Serializer):
    """
    OpenAPI schema and basic validation for Midtrans HTTP Notification.

    Signature verification is handled separately by MidtransClient.
    Business processing is handled by notification_services.
    """

    order_id = serializers.CharField(
        required=True,
    )
    transaction_id = serializers.CharField(
        required=False,
    )
    transaction_status = serializers.CharField(
        required=False,
    )
    status_code = serializers.CharField(
        required=True,
    )
    status_message = serializers.CharField(
        required=False,
    )

    gross_amount = serializers.CharField(
        required=True,
    )
    currency = serializers.CharField(
        required=False,
    )

    payment_type = serializers.CharField(
        required=False,
    )
    fraud_status = serializers.CharField(
        required=False,
    )

    transaction_time = serializers.CharField(
        required=False,
    )
    settlement_time = serializers.CharField(
        required=False,
    )
    expiry_time = serializers.CharField(
        required=False,
    )

    signature_key = serializers.CharField(
        required=True,
    )

    bank = serializers.CharField(
        required=False,
    )
    va_numbers = serializers.ListField(
        child=serializers.DictField(),
        required=False,
    )

    bill_key = serializers.CharField(
        required=False,
    )
    biller_code = serializers.CharField(
        required=False,
    )

    qr_string = serializers.CharField(
        required=False,
    )

    metadata = serializers.DictField(
        required=False,
    )


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True,
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "order_number",
            "provider",
            "payment_method",
            "status",
            "transaction_id",
            "amount",
            "currency",
            "bank",
            "va_number",
            "bill_key",
            "biller_code",
            "qr_string",
            "payment_url",
            "paid_at",
            "expires_at",
            "created_at",
        ]
        read_only_fields = fields
