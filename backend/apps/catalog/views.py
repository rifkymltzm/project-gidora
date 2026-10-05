from django.db.models import (
    F,
    IntegerField,
    Min,
    Prefetch,
    Q,
    Value,
)

from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import filters, permissions, viewsets

from .filters import ProductFilter, ProductOrderingFilter
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
from .serializers import (
    CategorySerializer,
    ColorSerializer,
    ProductSerializer,
    SizeSerializer,
    SizeTypeSerializer,
)


@extend_schema_view(
    list=extend_schema(
        summary="List active size types",
        description=(
            "Returns all active size types available for the storefront. "
            "Use the `code` filter when a specific size type is needed."
        ),
        parameters=[
            OpenApiParameter(
                name="code",
                description=(
                    "Filter by size type code. "
                    "Available values are `APPAREL`, `FOOTWEAR`, and `ONE_SIZE`."
                ),
                required=False,
                type=str,
                enum=[
                    "APPAREL",
                    "FOOTWEAR",
                    "ONE_SIZE",
                ],
            ),
            OpenApiParameter(
                name="search",
                description=("Search by size type name or code."),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by size type name or code. "
                    "Prefix the field with `-` for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "name",
                    "-name",
                    "code",
                    "-code",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=SizeTypeSerializer(many=True),
                description="List of active size types.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve size type",
        description=("Returns one active size type by ID."),
        responses={
            200: OpenApiResponse(
                response=SizeTypeSerializer,
                description="Size type detail.",
            ),
            404: OpenApiResponse(
                description="Size type not found or inactive.",
            ),
        },
    ),
)
@extend_schema(tags=["Catalog"])
class SizeTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SizeType.objects.filter(is_active=True)

    serializer_class = SizeTypeSerializer
    permission_classes = [permissions.AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = ["code"]

    search_fields = [
        "name",
        "code",
    ]

    ordering_fields = [
        "name",
        "code",
    ]

    ordering = ["name"]


@extend_schema_view(
    list=extend_schema(
        summary="List active sizes",
        description=(
            "Returns all active sizes available for the storefront. "
            "Sizes can be filtered by size type and searched by size "
            "name or size type name. "
            "Use this endpoint as the source of available size values "
            "when a specific size is required."
        ),
        parameters=[
            OpenApiParameter(
                name="size_type",
                description=("Filter by SizeType primary key."),
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="size_type__code",
                description=(
                    "Filter by size type code. "
                    "Use a code returned by "
                    "`GET /api/v1/catalog/size-types/`."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="search",
                description=("Search by size name or size type name."),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by `sort_order` or `name`. "
                    "Prefix the field with `-` for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "sort_order",
                    "-sort_order",
                    "name",
                    "-name",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=SizeSerializer(many=True),
                description="List of active sizes.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve size",
        description=("Returns one active size by ID, including its size type."),
        responses={
            200: OpenApiResponse(
                response=SizeSerializer,
                description="Size detail.",
            ),
            404: OpenApiResponse(
                description="Size not found or inactive.",
            ),
        },
    ),
)
@extend_schema(tags=["Catalog"])
class SizeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Size.objects.filter(is_active=True).select_related("size_type")

    serializer_class = SizeSerializer
    permission_classes = [permissions.AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "size_type",
        "size_type__code",
    ]

    search_fields = [
        "name",
        "size_type__name",
    ]

    ordering_fields = [
        "sort_order",
        "name",
    ]

    ordering = [
        "size_type",
        "sort_order",
        "name",
    ]


@extend_schema_view(
    list=extend_schema(
        summary="List active categories",
        description=(
            "Returns all active product categories available for the "
            "storefront. "
            "Use a category code returned by this endpoint when filtering "
            "products by category."
        ),
        parameters=[
            OpenApiParameter(
                name="code",
                description=(
                    "Filter by category code. "
                    "Use a category code returned by "
                    "`GET /api/v1/catalog/categories/`."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="default_size_type",
                description=("Filter by default SizeType primary key."),
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="search",
                description=("Search by category name or category code."),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by category name or code. "
                    "Prefix the field with `-` for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "name",
                    "-name",
                    "code",
                    "-code",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=CategorySerializer(many=True),
                description="List of active categories.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve category",
        description=("Returns one active category by ID, including its default " "size type."),
        responses={
            200: OpenApiResponse(
                response=CategorySerializer,
                description="Category detail.",
            ),
            404: OpenApiResponse(
                description="Category not found or inactive.",
            ),
        },
    ),
)
@extend_schema(tags=["Catalog"])
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True).select_related("default_size_type")

    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "code",
        "default_size_type",
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


@extend_schema_view(
    list=extend_schema(
        summary="List active colors",
        description=(
            "Returns all active colors available for the storefront. "
            "Use a color code returned by this endpoint when filtering "
            "products by color."
        ),
        parameters=[
            OpenApiParameter(
                name="code",
                description=(
                    "Filter by color code. "
                    "Use a color code returned by "
                    "`GET /api/v1/catalog/colors/`."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="search",
                description=("Search by color name or color code."),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort by color name or code. " "Prefix the field with `-` for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "name",
                    "-name",
                    "code",
                    "-code",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=ColorSerializer(many=True),
                description="List of active colors.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve color",
        description=("Returns one active color by ID."),
        responses={
            200: OpenApiResponse(
                response=ColorSerializer,
                description="Color detail.",
            ),
            404: OpenApiResponse(
                description="Color not found or inactive.",
            ),
        },
    ),
)
@extend_schema(tags=["Catalog"])
class ColorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Color.objects.filter(is_active=True)

    serializer_class = ColorSerializer
    permission_classes = [permissions.AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = ["code"]

    search_fields = [
        "name",
        "code",
    ]

    ordering_fields = [
        "name",
        "code",
    ]

    ordering = ["name"]


@extend_schema_view(
    list=extend_schema(
        summary="List products",
        description=(
            "Returns active products for the storefront. "
            "Products can be filtered by category, gender, size type, "
            "badge, color, and size. Results can also be searched "
            "and sorted by name, date, or minimum active variant price.\n\n"
            "Each active product variant also includes `available`, "
            "which represents the quantity currently available for "
            "purchase (`stock_on_hand - reserved`). "
            "If no inventory record exists for a variant, "
            "`available` is returned as `0`."
        ),
        parameters=[
            OpenApiParameter(
                name="category",
                description=(
                    "Filter products by category code. "
                    "Use a category code returned by "
                    "`GET /api/v1/catalog/categories/`."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="gender",
                description="Filter products by gender.",
                required=False,
                type=str,
                enum=[
                    "men",
                    "women",
                    "unisex",
                ],
            ),
            OpenApiParameter(
                name="size_type",
                description="Filter products by size type.",
                required=False,
                type=str,
                enum=[
                    "APPAREL",
                    "FOOTWEAR",
                    "ONE_SIZE",
                ],
            ),
            OpenApiParameter(
                name="badge",
                description=(
                    "Filter products by badge. " "Badge values are managed as product data."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="color",
                description=(
                    "Filter products by color code. "
                    "Use a color code returned by "
                    "`GET /api/v1/catalog/colors/`."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="size",
                description=(
                    "Filter products by size name. "
                    "Available sizes can be retrieved from "
                    "`GET /api/v1/catalog/sizes/`."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="search",
                description=(
                    "Search by product name, product code, description, "
                    "material, category name, or color name."
                ),
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="ordering",
                description=(
                    "Sort products by name, creation date, update date, "
                    "or minimum active variant price. "
                    "Prefix the field with `-` for descending order."
                ),
                required=False,
                type=str,
                enum=[
                    "name",
                    "-name",
                    "created_at",
                    "-created_at",
                    "updated_at",
                    "-updated_at",
                    "price",
                    "-price",
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=ProductSerializer(many=True),
                description="List of active products.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve product detail",
        description=(
            "Returns one active product including its category, "
            "size type, active colors, active variants, and product "
            "images.\n\n"
            "Each active product variant includes `available`, "
            "representing the quantity currently available for purchase. "
            "If no inventory record exists, `available` is returned as `0`."
        ),
        responses={
            200: OpenApiResponse(
                response=ProductSerializer,
                description="Product detail.",
            ),
            404: OpenApiResponse(
                description="Product not found or inactive.",
            ),
        },
    ),
)
@extend_schema(tags=["Catalog"])
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Product.objects.filter(is_active=True)
        .select_related(
            "category",
            "size_type",
        )
        .annotate(
            min_variant_price=Min(
                "product_colors__variants__price",
                filter=Q(
                    product_colors__is_active=True,
                    product_colors__variants__is_active=True,
                ),
            ),
        )
        .prefetch_related(
            Prefetch(
                "product_colors",
                queryset=(
                    ProductColor.objects.filter(is_active=True)
                    .select_related("color")
                    .prefetch_related(
                        Prefetch(
                            "variants",
                            queryset=(
                                ProductVariant.objects.filter(is_active=True)
                                .select_related("size")
                                .annotate(
                                    available_stock=Coalesce(
                                        F("inventory__stock_on_hand") - F("inventory__reserved"),
                                        Value(0),
                                        output_field=IntegerField(),
                                    )
                                )
                            ),
                        )
                    )
                ),
            ),
            Prefetch(
                "images",
                queryset=(
                    ProductImage.objects.filter(
                        product_color__is_active=True,
                    ).select_related(
                        "product_color__color",
                    )
                ),
            ),
        )
        .distinct()
    )

    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        ProductOrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = [
        "name",
        "product_code",
        "description",
        "material",
        "category__name",
        "product_colors__color__name",
    ]

    ordering = ["-created_at"]
