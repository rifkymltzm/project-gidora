from django.contrib import admin

from .models import (
    Order,
    OrderAddress,
    OrderItem,
)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False
    show_change_link = True

    readonly_fields = [
        "product_variant",
        "product_name_snapshot",
        "sku_snapshot",
        "variant_snapshot",
        "unit_price",
        "quantity",
        "subtotal",
    ]

    fields = [
        "product_variant",
        "product_name_snapshot",
        "sku_snapshot",
        "variant_snapshot",
        "unit_price",
        "quantity",
        "subtotal",
    ]


class OrderAddressInline(admin.StackedInline):
    model = OrderAddress
    extra = 0
    max_num = 2
    can_delete = False

    readonly_fields = [
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

    fields = [
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


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "user",
        "status",
        "total_amount",
        "shipping_courier",
        "shipping_service",
        "created_at",
    ]

    list_filter = [
        "status",
        "currency",
        "shipping_courier",
        "shipping_service",
        "created_at",
    ]

    search_fields = [
        "order_number",
        "user__email",
        "user__first_name",
        "user__last_name",
    ]

    ordering = [
        "-created_at",
    ]

    readonly_fields = [
        "order_number",
        "user",
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
        "created_at",
        "updated_at",
    ]

    fieldsets = [
        (
            "Order",
            {
                "fields": [
                    "order_number",
                    "user",
                    "status",
                ],
            },
        ),
        (
            "Amount",
            {
                "fields": [
                    "subtotal",
                    "discount_amount",
                    "shipping_amount",
                    "tax_amount",
                    "total_amount",
                    "currency",
                ],
            },
        ),
        (
            "Shipping",
            {
                "fields": [
                    "shipping_method_code",
                    "shipping_courier",
                    "shipping_service",
                ],
            },
        ),
        (
            "Timestamps",
            {
                "fields": [
                    "created_at",
                    "updated_at",
                ],
            },
        ),
    ]

    inlines = [
        OrderItemInline,
        OrderAddressInline,
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "sku_snapshot",
        "product_name_snapshot",
        "variant_snapshot",
        "unit_price",
        "quantity",
        "subtotal",
    ]

    search_fields = [
        "order__order_number",
        "sku_snapshot",
        "product_name_snapshot",
        "variant_snapshot",
    ]

    readonly_fields = [
        "order",
        "product_variant",
        "product_name_snapshot",
        "sku_snapshot",
        "variant_snapshot",
        "unit_price",
        "quantity",
        "subtotal",
    ]

    list_select_related = [
        "order",
        "product_variant",
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(OrderAddress)
class OrderAddressAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "address_type",
        "recipient_name",
        "city",
        "province",
        "postal_code",
    ]

    list_filter = [
        "address_type",
        "province",
        "city",
    ]

    search_fields = [
        "order__order_number",
        "recipient_name",
        "phone_number",
        "city",
        "province",
        "postal_code",
    ]

    readonly_fields = [
        "order",
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

    list_select_related = [
        "order",
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
