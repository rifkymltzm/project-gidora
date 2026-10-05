from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import filters, permissions, viewsets

from .admin_serializers import (
    AdminCategorySerializer,
    AdminColorSerializer,
    AdminProductColorSerializer,
    AdminProductImageSerializer,
    AdminProductSerializer,
    AdminProductVariantSerializer,
    AdminSizeSerializer,
    AdminSizeTypeSerializer,
)
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
from .permissions import IsSuperuser

# ============================================================
# Shared configuration
# ============================================================

class AdminCatalogViewSet(viewsets.ModelViewSet):
    """Base ViewSet for catalog resources managed by admin/staff users."""

    permission_classes = [permissions.IsAdminUser]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]


class SuperuserCatalogViewSet(AdminCatalogViewSet):
    """Base ViewSet for catalog resources restricted to superusers."""

    permission_classes = [IsSuperuser]


# ============================================================
# Product
# ============================================================

@extend_schema_view(
    list=extend_schema(
        summary="List products",
        description=(
            "Returns products for catalog management. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "Results can be filtered by category, gender, size type, "
            "and active status, searched by product information, "
            "and sorted by name, product code, or timestamps."
        ),
        parameters=[
            OpenApiParameter(
                name="category",
                description="Filter by category primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="category__code",
                description=(
                    "Filter by category code. "
                    "Use a category code managed through the "
                    "Admin Catalog category endpoint."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="gender",
                description="Filter by product gender.",
                required=False,
                type=str,
                enum=["men", "women", "unisex"],
            ),
            OpenApiParameter(
                name="size_type",
                description="Filter by size type primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="size_type__code",
                description=(
                    "Filter by size type code. "
                    "Available codes are managed through the "
                    "Admin Catalog size type endpoint."
                ),
                required=False,
                type=str,
                enum=["APPAREL", "FOOTWEAR", "ONE_SIZE"],
            ),
            OpenApiParameter(
                name="is_active",
                description="Filter by product active status.",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="search",
                description=(
                    "Search by product code, name, description, " "material, or category name."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort products by name, product code, creation date, "
                    "or update date. Prefix the field with - "
                    "for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "name",
                    "-name",
                    "product_code",
                    "-product_code",
                    "created_at",
                    "-created_at",
                    "updated_at",
                    "-updated_at",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminProductSerializer(many=True),
                description="List of products.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve product",
        description=(
            "Returns detailed information for a product. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductSerializer,
                description="Product detail.",
            ),
            404: OpenApiResponse(description="Product not found."),
        },
    ),
    create=extend_schema(
        summary="Create product",
        description=(
            "Creates a new product for the catalog. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "The product code and slug are generated automatically. "
            "If size_type is omitted, the default size type of the selected "
            "category is used."
        ),
        responses={
            201: OpenApiResponse(
                response=AdminProductSerializer,
                description="Product created successfully.",
            ),
        },
    ),
    update=extend_schema(
        summary="Update product",
        description=(
            "Replaces the selected product data. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "The product code and slug are generated automatically and "
            "cannot be changed manually."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductSerializer,
                description="Product updated successfully.",
            ),
            404: OpenApiResponse(description="Product not found."),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update product",
        description=(
            "Updates selected product fields without replacing the entire product. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "The product code and slug are read-only and cannot be changed manually."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductSerializer,
                description="Product updated successfully.",
            ),
            404: OpenApiResponse(description="Product not found."),
        },
    ),
    destroy=extend_schema(
        summary="Delete product",
        description=(
            "Deletes the selected product from the catalog. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            204: OpenApiResponse(
                description="Product deleted successfully.",
            ),
            404: OpenApiResponse(description="Product not found."),
        },
    ),
)
@extend_schema(tags=["Admin Catalog"])
class AdminProductViewSet(AdminCatalogViewSet):
    queryset = Product.objects.select_related(
        "category",
        "size_type",
    ).prefetch_related(
        "product_colors__color",
        "product_colors__variants__size",
        "images__product_color",
    )

    serializer_class = AdminProductSerializer

    filterset_fields = [
        "category",
        "category__code",
        "gender",
        "size_type",
        "size_type__code",
        "is_active",
    ]

    search_fields = [
        "product_code",
        "name",
        "description",
        "material",
        "category__name",
    ]

    ordering_fields = [
        "name",
        "product_code",
        "created_at",
        "updated_at",
    ]

    ordering = ["-created_at"]


# ============================================================
# Product Color
# ============================================================

@extend_schema_view(
    list=extend_schema(
        summary="List product colors",
        description=(
            "Returns product-color relationships for catalog management. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "Results can be filtered by product, color, and active status, "
            "searched by product or color information, and sorted by "
            "product name or color name."
        ),
        parameters=[
            OpenApiParameter(
                name="product",
                description="Filter by product primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="color",
                description="Filter by color primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="is_active",
                description="Filter by active status.",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="search",
                description=("Search by product name, product code, " "color name, or color code."),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by product name or color name. "
                    "Prefix the field with - for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "product__name",
                    "-product__name",
                    "color__name",
                    "-color__name",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminProductColorSerializer(many=True),
                description="List of product-color relationships.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve product color",
        description=(
            "Returns detailed information for a product-color relationship. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductColorSerializer,
                description="Product-color detail.",
            ),
            404: OpenApiResponse(
                description="Product-color relationship not found.",
            ),
        },
    ),
    create=extend_schema(
        summary="Create product color",
        description=(
            "Associates an active color with an active product. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            201: OpenApiResponse(
                response=AdminProductColorSerializer,
                description="Product color created successfully.",
            ),
        },
    ),
    update=extend_schema(
        summary="Update product color",
        description=(
            "Replaces the selected product-color relationship. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductColorSerializer,
                description="Product color updated successfully.",
            ),
            404: OpenApiResponse(
                description="Product-color relationship not found.",
            ),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update product color",
        description=(
            "Updates selected fields of a product-color relationship. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductColorSerializer,
                description="Product color updated successfully.",
            ),
            404: OpenApiResponse(
                description="Product-color relationship not found.",
            ),
        },
    ),
    destroy=extend_schema(
        summary="Delete product color",
        description=(
            "Removes the selected product-color relationship. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            204: OpenApiResponse(
                description="Product color deleted successfully.",
            ),
            404: OpenApiResponse(
                description="Product-color relationship not found.",
            ),
        },
    ),
)
@extend_schema(tags=["Admin Catalog"])
class AdminProductColorViewSet(AdminCatalogViewSet):
    queryset = ProductColor.objects.select_related(
        "product",
        "color",
    )

    serializer_class = AdminProductColorSerializer

    filterset_fields = [
        "product",
        "color",
        "is_active",
    ]

    search_fields = [
        "product__name",
        "product__product_code",
        "color__name",
        "color__code",
    ]

    ordering_fields = [
        "product__name",
        "color__name",
    ]

    ordering = [
        "product__name",
        "color__name",
    ]


# ============================================================
# Product Variant
# ============================================================

@extend_schema_view(
    list=extend_schema(
        summary="List product variants",
        description=(
            "Returns product variants for catalog management. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "Results can be filtered by product, color, size, and active status, "
            "searched by SKU or related catalog information, and sorted by "
            "SKU, price, or timestamps."
        ),
        parameters=[
            OpenApiParameter(
                name="product_color__product",
                description="Filter by product primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="product_color__color",
                description="Filter by color primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="size",
                description="Filter by size primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="is_active",
                description="Filter by active status.",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="search",
                description=(
                    "Search by SKU, product name, product code, "
                    "color name, color code, or size name."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by SKU, price, creation date, or update date. "
                    "Prefix the field with - for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "sku",
                    "-sku",
                    "price",
                    "-price",
                    "created_at",
                    "-created_at",
                    "updated_at",
                    "-updated_at",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminProductVariantSerializer(many=True),
                description="List of product variants.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve product variant",
        description=(
            "Returns detailed information for a product variant. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductVariantSerializer,
                description="Product variant detail.",
            ),
            404: OpenApiResponse(description="Product variant not found."),
        },
    ),
    create=extend_schema(
        summary="Create product variant",
        description=(
            "Creates a product variant for a product color and size. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "The SKU is generated automatically from the product, color, and size."
        ),
        responses={
            201: OpenApiResponse(
                response=AdminProductVariantSerializer,
                description="Product variant created successfully.",
            ),
        },
    ),
    update=extend_schema(
        summary="Update product variant",
        description=(
            "Replaces the selected product variant data. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "The SKU is generated automatically and remains read-only."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductVariantSerializer,
                description="Product variant updated successfully.",
            ),
            404: OpenApiResponse(description="Product variant not found."),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update product variant",
        description=(
            "Updates selected product variant fields without replacing "
            "the entire variant. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "The SKU remains read-only."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductVariantSerializer,
                description="Product variant updated successfully.",
            ),
            404: OpenApiResponse(description="Product variant not found."),
        },
    ),
    destroy=extend_schema(
        summary="Delete product variant",
        description=(
            "Deletes the selected product variant from the catalog. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            204: OpenApiResponse(
                description="Product variant deleted successfully.",
            ),
            404: OpenApiResponse(description="Product variant not found."),
        },
    ),
)
@extend_schema(tags=["Admin Catalog"])
class AdminProductVariantViewSet(AdminCatalogViewSet):
    queryset = ProductVariant.objects.select_related(
        "product_color__product",
        "product_color__color",
        "size",
    )

    serializer_class = AdminProductVariantSerializer

    filterset_fields = [
        "product_color__product",
        "product_color__color",
        "size",
        "is_active",
    ]

    search_fields = [
        "sku",
        "product_color__product__name",
        "product_color__product__product_code",
        "product_color__color__name",
        "product_color__color__code",
        "size__name",
    ]

    ordering_fields = [
        "sku",
        "price",
        "created_at",
        "updated_at",
    ]

    ordering = ["sku"]


# ============================================================
# Product Image
# ============================================================

@extend_schema_view(
    list=extend_schema(
        summary="List product images",
        description=(
            "Returns product images for catalog management. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "Results can be filtered by product, product color, and image type, "
            "searched by product information, and sorted by display order "
            "or image type."
        ),
        parameters=[
            OpenApiParameter(
                name="product",
                description="Filter by product primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="product_color",
                description="Filter by product color primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="image_type",
                description="Filter by image type.",
                required=False,
                type=str,
                enum=["primary", "detail", "additional"],
            ),
            OpenApiParameter(
                name="search",
                description="Search by product name or product code.",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by display order or image type. "
                    "Prefix the field with - for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "sort_order",
                    "-sort_order",
                    "image_type",
                    "-image_type",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminProductImageSerializer(many=True),
                description="List of product images.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve product image",
        description=(
            "Returns detailed information for a product image. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductImageSerializer,
                description="Product image detail.",
            ),
            404: OpenApiResponse(description="Product image not found."),
        },
    ),
    create=extend_schema(
        summary="Create product image",
        description=(
            "Creates a product image associated with a product color. "
            "This endpoint requires an authenticated staff/admin user.\n\n"
            "The selected product color must belong to the selected product. "
            "Only one primary image is allowed for each product."
        ),
        responses={
            201: OpenApiResponse(
                response=AdminProductImageSerializer,
                description="Product image created successfully.",
            ),
        },
    ),
    update=extend_schema(
        summary="Update product image",
        description=(
            "Replaces the selected product image data. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductImageSerializer,
                description="Product image updated successfully.",
            ),
            404: OpenApiResponse(description="Product image not found."),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update product image",
        description=(
            "Updates selected product image fields without replacing "
            "the entire image record. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminProductImageSerializer,
                description="Product image updated successfully.",
            ),
            404: OpenApiResponse(description="Product image not found."),
        },
    ),
    destroy=extend_schema(
        summary="Delete product image",
        description=(
            "Deletes the selected product image from the catalog. "
            "This endpoint requires an authenticated staff/admin user."
        ),
        responses={
            204: OpenApiResponse(
                description="Product image deleted successfully.",
            ),
            404: OpenApiResponse(description="Product image not found."),
        },
    ),
)
@extend_schema(tags=["Admin Catalog"])
class AdminProductImageViewSet(AdminCatalogViewSet):
    queryset = ProductImage.objects.select_related(
        "product",
        "product_color__color",
    )

    serializer_class = AdminProductImageSerializer

    filterset_fields = [
        "product",
        "product_color",
        "image_type",
    ]

    search_fields = [
        "product__name",
        "product__product_code",
    ]

    ordering_fields = [
        "sort_order",
        "image_type",
    ]

    ordering = [
        "product",
        "sort_order",
    ]


# ============================================================
# Category
# ============================================================

@extend_schema_view(
    list=extend_schema(
        summary="List categories",
        description=(
            "Returns categories for catalog administration. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "Results can be filtered by category code, default size type, "
            "and active status, searched by name or code, and sorted by "
            "name, code, or product sequence."
        ),
        parameters=[
            OpenApiParameter(
                name="code",
                description="Filter by category code.",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="default_size_type",
                description="Filter by default size type primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="is_active",
                description="Filter by active status.",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="search",
                description="Search by category name or code.",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by name, code, or next product sequence. "
                    "Prefix the field with - for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "name",
                    "-name",
                    "code",
                    "-code",
                    "next_product_sequence",
                    "-next_product_sequence",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminCategorySerializer(many=True),
                description="List of categories.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve category",
        description=(
            "Returns detailed information for a category. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminCategorySerializer,
                description="Category detail.",
            ),
            404: OpenApiResponse(description="Category not found."),
        },
    ),
    create=extend_schema(
        summary="Create category",
        description=(
            "Creates a new catalog category. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "The selected default size type must be active."
        ),
        responses={
            201: OpenApiResponse(
                response=AdminCategorySerializer,
                description="Category created successfully.",
            ),
        },
    ),
    update=extend_schema(
        summary="Update category",
        description=(
            "Replaces the selected category data. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "The next product sequence is managed automatically and remains read-only."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminCategorySerializer,
                description="Category updated successfully.",
            ),
            404: OpenApiResponse(description="Category not found."),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update category",
        description=(
            "Updates selected category fields. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "The next product sequence remains read-only."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminCategorySerializer,
                description="Category updated successfully.",
            ),
            404: OpenApiResponse(description="Category not found."),
        },
    ),
    destroy=extend_schema(
        summary="Delete category",
        description=(
            "Deletes the selected category. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            204: OpenApiResponse(
                description="Category deleted successfully.",
            ),
            404: OpenApiResponse(description="Category not found."),
        },
    ),
)
@extend_schema(tags=["Admin Catalog"])
class AdminCategoryViewSet(SuperuserCatalogViewSet):
    queryset = Category.objects.select_related("default_size_type")

    serializer_class = AdminCategorySerializer

    filterset_fields = [
        "code",
        "default_size_type",
        "is_active",
    ]

    search_fields = [
        "name",
        "code",
    ]

    ordering_fields = [
        "name",
        "code",
        "next_product_sequence",
    ]

    ordering = ["name"]


# ============================================================
# Color
# ============================================================

@extend_schema_view(
    list=extend_schema(
        summary="List colors",
        description=(
            "Returns colors for catalog administration. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "Results can be filtered by color code and active status, "
            "searched by name, code, or slug, and sorted by name or code."
        ),
        parameters=[
            OpenApiParameter(
                name="code",
                description="Filter by color code.",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="is_active",
                description="Filter by active status.",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="search",
                description="Search by color name, code, or slug.",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by name or code. " "Prefix the field with - for descending order."
                ),
                required=False,
                type=str,
                enum=["name", "-name", "code", "-code"],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminColorSerializer(many=True),
                description="List of colors.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve color",
        description=(
            "Returns detailed information for a color. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminColorSerializer,
                description="Color detail.",
            ),
            404: OpenApiResponse(description="Color not found."),
        },
    ),
    create=extend_schema(
        summary="Create color",
        description=(
            "Creates a new catalog color. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "The slug is generated automatically from the color name."
        ),
        responses={
            201: OpenApiResponse(
                response=AdminColorSerializer,
                description="Color created successfully.",
            ),
        },
    ),
    update=extend_schema(
        summary="Update color",
        description=(
            "Replaces the selected color data. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "The slug remains read-only."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminColorSerializer,
                description="Color updated successfully.",
            ),
            404: OpenApiResponse(description="Color not found."),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update color",
        description=(
            "Updates selected color fields. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "The slug remains read-only."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminColorSerializer,
                description="Color updated successfully.",
            ),
            404: OpenApiResponse(description="Color not found."),
        },
    ),
    destroy=extend_schema(
        summary="Delete color",
        description=(
            "Deletes the selected catalog color. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            204: OpenApiResponse(description="Color deleted successfully."),
            404: OpenApiResponse(description="Color not found."),
        },
    ),
)
@extend_schema(tags=["Admin Catalog"])
class AdminColorViewSet(SuperuserCatalogViewSet):
    queryset = Color.objects.all()

    serializer_class = AdminColorSerializer

    filterset_fields = [
        "code",
        "is_active",
    ]

    search_fields = [
        "name",
        "code",
        "slug",
    ]

    ordering_fields = [
        "name",
        "code",
    ]

    ordering = ["name"]


# ============================================================
# Size
# ============================================================

@extend_schema_view(
    list=extend_schema(
        summary="List sizes",
        description=(
            "Returns sizes for catalog administration. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "Results can be filtered by size type and active status, "
            "searched by size or size type information, and sorted by "
            "name or sort order."
        ),
        parameters=[
            OpenApiParameter(
                name="size_type",
                description="Filter by size type primary key.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="size_type__code",
                description=(
                    "Filter by size type code. "
                    "Use a code managed through the Admin Catalog "
                    "size type endpoint."
                ),
                required=False,
                type=str,
                enum=["APPAREL", "FOOTWEAR", "ONE_SIZE"],
            ),
            OpenApiParameter(
                name="is_active",
                description="Filter by active status.",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="search",
                description=("Search by size name, size type name, " "or size type code."),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by name or sort order. " "Prefix the field with - for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "name",
                    "-name",
                    "sort_order",
                    "-sort_order",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminSizeSerializer(many=True),
                description="List of sizes.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve size",
        description=(
            "Returns detailed information for a size. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminSizeSerializer,
                description="Size detail.",
            ),
            404: OpenApiResponse(description="Size not found."),
        },
    ),
    create=extend_schema(
        summary="Create size",
        description=(
            "Creates a new catalog size associated with an active size type. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            201: OpenApiResponse(
                response=AdminSizeSerializer,
                description="Size created successfully.",
            ),
        },
    ),
    update=extend_schema(
        summary="Update size",
        description=(
            "Replaces the selected size data. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminSizeSerializer,
                description="Size updated successfully.",
            ),
            404: OpenApiResponse(description="Size not found."),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update size",
        description=(
            "Updates selected size fields. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminSizeSerializer,
                description="Size updated successfully.",
            ),
            404: OpenApiResponse(description="Size not found."),
        },
    ),
    destroy=extend_schema(
        summary="Delete size",
        description=(
            "Deletes the selected catalog size. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            204: OpenApiResponse(description="Size deleted successfully."),
            404: OpenApiResponse(description="Size not found."),
        },
    ),
)
@extend_schema(tags=["Admin Catalog"])
class AdminSizeViewSet(SuperuserCatalogViewSet):
    queryset = Size.objects.select_related("size_type")

    serializer_class = AdminSizeSerializer

    filterset_fields = [
        "size_type",
        "size_type__code",
        "is_active",
    ]

    search_fields = [
        "name",
        "size_type__name",
        "size_type__code",
    ]

    ordering_fields = [
        "name",
        "sort_order",
    ]

    ordering = [
        "size_type",
        "sort_order",
        "name",
    ]


# ============================================================
# Size Type
# ============================================================

@extend_schema_view(
    list=extend_schema(
        summary="List size types",
        description=(
            "Returns size types for catalog administration. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "Size type codes are fixed and cannot be changed through this API. "
            "Results can be filtered by code and active status, searched by "
            "name or code, and sorted by name or code."
        ),
        parameters=[
            OpenApiParameter(
                name="code",
                description="Filter by size type code.",
                required=False,
                type=str,
                enum=["APPAREL", "FOOTWEAR", "ONE_SIZE"],
            ),
            OpenApiParameter(
                name="is_active",
                description="Filter by active status.",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="search",
                description="Search by size type name or code.",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by name or code. " "Prefix the field with - for descending order."
                ),
                required=False,
                type=str,
                enum=["name", "-name", "code", "-code"],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminSizeTypeSerializer(many=True),
                description="List of size types.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve size type",
        description=(
            "Returns detailed information for a size type. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminSizeTypeSerializer,
                description="Size type detail.",
            ),
            404: OpenApiResponse(description="Size type not found."),
        },
    ),
    update=extend_schema(
        summary="Update size type",
        description=(
            "Replaces the selected size type data. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "The size type code remains read-only."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminSizeTypeSerializer,
                description="Size type updated successfully.",
            ),
            404: OpenApiResponse(description="Size type not found."),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update size type",
        description=(
            "Updates selected size type fields. "
            "This endpoint requires an authenticated superuser. "
            "Staff users who are not superusers cannot access this endpoint.\n\n"
            "The size type code remains read-only."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminSizeTypeSerializer,
                description="Size type updated successfully.",
            ),
            404: OpenApiResponse(description="Size type not found."),
        },
    ),
)
@extend_schema(tags=["Admin Catalog"])
class AdminSizeTypeViewSet(SuperuserCatalogViewSet):
    queryset = SizeType.objects.all()

    serializer_class = AdminSizeTypeSerializer

    http_method_names = [
        "get",
        "put",
        "patch",
        "head",
        "options",
    ]

    filterset_fields = [
        "code",
        "is_active",
    ]

    search_fields = [
        "name",
        "code",
    ]

    ordering_fields = [
        "name",
        "code",
    ]

    ordering = ["name"]
