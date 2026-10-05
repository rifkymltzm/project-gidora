from django.contrib import admin

from .models import (
    Category,
    Color,
    Product,
    ProductColor,
    ProductImage,
    ProductVariant,
    Size,
    SizeType,
)

from .services import (
    create_product,
    create_product_variant,
    generate_color_slug,
)


@admin.register(SizeType)
class SizeTypeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "is_active",
    )

    list_filter = ("is_active",)

    search_fields = (
        "name",
        "code",
    )


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "size_type",
        "sort_order",
        "is_active",
    )

    list_filter = (
        "size_type",
        "is_active",
    )

    search_fields = (
        "name",
        "size_type__name",
    )

    ordering = (
        "size_type",
        "sort_order",
        "name",
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "default_size_type",
        "next_product_sequence",
        "is_active",
    )

    list_filter = (
        "default_size_type",
        "is_active",
    )

    search_fields = (
        "name",
        "code",
    )

    readonly_fields = ("next_product_sequence",)


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "hex_code",
        "is_active",
    )

    list_filter = ("is_active",)

    search_fields = (
        "name",
        "code",
    )

    readonly_fields = ("slug",)

    def save_model(self, request, obj, form, change):
        if not change or not obj.slug:
            obj.slug = generate_color_slug(obj.name)

        super().save_model(
            request,
            obj,
            form,
            change,
        )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "product_code",
        "name",
        "category",
        "gender",
        "size_type",
        "is_active",
        "created_at",
    )

    list_filter = (
        "category",
        "gender",
        "size_type",
        "is_active",
    )

    search_fields = (
        "product_code",
        "name",
        "slug",
    )

    readonly_fields = (
        "product_code",
        "slug",
        "created_at",
        "updated_at",
    )

    def save_model(self, request, obj, form, change):
        if change:
            super().save_model(
                request,
                obj,
                form,
                change,
            )
            return

        product = create_product(
            category=obj.category,
            name=obj.name,
            description=obj.description,
            material=obj.material,
            badge=obj.badge,
            gender=obj.gender,
            size_type=obj.size_type,
            is_active=obj.is_active,
        )

        obj.pk = product.pk
        obj.product_code = product.product_code
        obj.slug = product.slug
        obj.created_at = product.created_at
        obj.updated_at = product.updated_at
        obj._state.adding = False
        obj._state.db = product._state.db


@admin.register(ProductColor)
class ProductColorAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "color",
        "is_active",
    )

    list_filter = (
        "color",
        "is_active",
    )

    search_fields = (
        "product__name",
        "product__product_code",
        "color__name",
        "color__code",
    )


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = (
        "sku",
        "product_color",
        "size",
        "price",
        "is_active",
    )

    list_filter = (
        "is_active",
        "size",
    )

    search_fields = (
        "sku",
        "product_color__product__name",
        "product_color__product__product_code",
        "product_color__color__name",
        "product_color__color__code",
    )

    readonly_fields = ("sku",)

    def save_model(self, request, obj, form, change):
        if change:
            super().save_model(
                request,
                obj,
                form,
                change,
            )
            return

        variant = create_product_variant(
            product_color=obj.product_color,
            size=obj.size,
            price=obj.price,
            is_active=obj.is_active,
        )

        obj.pk = variant.pk
        obj.sku = variant.sku
        obj.price = variant.price
        obj.is_active = variant.is_active
        obj._state.adding = False
        obj._state.db = variant._state.db


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "product_color",
        "image_type",
        "sort_order",
    )

    list_filter = ("image_type",)

    search_fields = (
        "product__name",
        "product__product_code",
    )
