from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    can_delete = False
    readonly_fields = (
        "variant",
        "quantity",
        "created_at",
        "updated_at",
    )


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "status",
        "created_at",
        "updated_at",
    )
    list_filter = ("status",)
    search_fields = ("user__email",)
    readonly_fields = (
        "user",
        "status",
        "created_at",
        "updated_at",
    )
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "cart",
        "variant",
        "quantity",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "cart__user__email",
        "variant__sku",
        "variant__product_color__product__name",
    )
    readonly_fields = (
        "cart",
        "variant",
        "quantity",
        "created_at",
        "updated_at",
    )
