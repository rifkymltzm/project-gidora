from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "payment_method",
        "status",
        "amount",
        "transaction_id",
        "created_at",
        "paid_at",
    ]

    list_filter = [
        "provider",
        "payment_method",
        "status",
        "currency",
    ]

    search_fields = [
        "order__order_number",
        "transaction_id",
        "va_number",
        "bill_key",
        "biller_code",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
        "paid_at",
    ]
