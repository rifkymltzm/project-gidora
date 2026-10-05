from django.contrib import admin

from .models import Shipment, ShipmentItem, ShippingMethod


@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "courier",
        "service",
        "price",
        "is_active",
        "created_at",
    ]

    list_filter = [
        "courier",
        "is_active",
    ]

    search_fields = [
        "code",
        "courier",
        "service",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "status",
        "courier",
        "service",
        "tracking_number",
        "shipped_at",
        "delivered_at",
        "created_at",
    ]

    list_filter = [
        "status",
        "courier",
        "service",
    ]

    search_fields = [
        "order__order_number",
        "tracking_number",
    ]

    readonly_fields = [
        "order",
        "status",
        "courier",
        "service",
        "tracking_number",
        "shipped_at",
        "delivered_at",
        "created_at",
        "updated_at",
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ShipmentItem)
class ShipmentItemAdmin(admin.ModelAdmin):
    list_display = [
        "shipment",
        "order_item",
        "sku_snapshot",
        "quantity",
    ]

    search_fields = [
        "shipment__order__order_number",
        "sku_snapshot",
    ]

    readonly_fields = [
        "shipment",
        "order_item",
        "product_name_snapshot",
        "sku_snapshot",
        "quantity",
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
