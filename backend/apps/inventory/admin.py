from django.contrib import admin

from .models import Inventory, InventoryReservation


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "variant",
        "stock_on_hand",
        "reserved",
        "available",
        "updated_at",
    )

    search_fields = (
        "variant__sku",
        "variant__product_color__product__name",
    )

    list_filter = ("variant__product_color__color",)

    readonly_fields = (
        "available",
        "updated_at",
    )


@admin.register(InventoryReservation)
class InventoryReservationAdmin(admin.ModelAdmin):
    list_display = (
        "inventory",
        "quantity",
        "status",
        "expires_at",
        "created_at",
    )

    list_filter = ("status",)

    search_fields = ("inventory__variant__sku",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )
