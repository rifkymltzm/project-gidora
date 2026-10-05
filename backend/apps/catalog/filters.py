from django_filters import rest_framework as filters
from rest_framework.filters import OrderingFilter

from .models import Product


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(
        field_name="category__code",
        lookup_expr="iexact",
        help_text="Filter berdasarkan category code, misalnya OW atau PT.",
    )

    gender = filters.CharFilter(
        field_name="gender",
        lookup_expr="iexact",
        help_text="Filter berdasarkan gender: men, women, atau unisex.",
    )

    size_type = filters.CharFilter(
        field_name="size_type__code",
        lookup_expr="iexact",
        help_text=(
            "Filter berdasarkan size type code, " "misalnya APPAREL, FOOTWEAR, atau ONE_SIZE."
        ),
    )

    badge = filters.CharFilter(
        field_name="badge",
        lookup_expr="iexact",
        help_text="Filter berdasarkan badge produk.",
    )

    color = filters.CharFilter(
        field_name="product_colors__color__code",
        lookup_expr="iexact",
        help_text="Filter berdasarkan color code, misalnya BLK atau WHT.",
    )

    size = filters.CharFilter(
        field_name="product_colors__variants__size__name",
        lookup_expr="iexact",
        help_text="Filter berdasarkan size, misalnya M, L, XL, atau 42.",
    )

    class Meta:
        model = Product
        fields = [
            "category",
            "gender",
            "size_type",
            "badge",
            "color",
            "size",
        ]


class ProductOrderingFilter(OrderingFilter):
    ordering_aliases = {
        "name": "name",
        "created_at": "created_at",
        "updated_at": "updated_at",
        "price": "min_variant_price",
    }

    def get_ordering(self, request, queryset, view):
        params = request.query_params.get(self.ordering_param)

        if params:
            fields = [field.strip() for field in params.split(",")]

            ordering = []

            for field in fields:
                descending = field.startswith("-")
                field_name = field.lstrip("-")

                if field_name not in self.ordering_aliases:
                    continue

                database_field = self.ordering_aliases[field_name]

                if descending:
                    database_field = f"-{database_field}"

                ordering.append(database_field)

            if ordering:
                return ordering

        return self.get_default_ordering(view)
