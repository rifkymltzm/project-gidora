from django.core.exceptions import ValidationError
from django.db.models import F, IntegerField, Value, Prefetch
from django.db.models.functions import Coalesce

from decimal import Decimal

from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
)

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cart, CartItem
from .serializers import (
    AddCartItemSerializer,
    CartSerializer,
    UpdateCartItemSerializer,
)
from .services import (
    add_item,
    clear_cart,
    get_or_create_active_cart,
    remove_item,
    update_item_quantity,
)


def get_cart_queryset():
    cart_item_queryset = CartItem.objects.select_related(
        "variant",
        "variant__product_color__product",
        "variant__product_color__color",
        "variant__size",
    ).annotate(
        available_stock=Coalesce(
            F("variant__inventory__stock_on_hand") - F("variant__inventory__reserved"),
            Value(0),
            output_field=IntegerField(),
        )
    )

    return Cart.objects.prefetch_related(
        Prefetch(
            "items",
            queryset=cart_item_queryset,
        ),
    )


class CartViewSet(viewsets.ViewSet):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    @extend_schema(
        summary="Retrieve active cart",
        description=(
            "Mengambil active cart milik authenticated user. "
            "Jika user belum memiliki active cart, cart baru akan "
            "dibuat secara otomatis."
        ),
        responses={
            200: CartSerializer,
        },
        tags=["Cart"],
    )
    def list(self, request):
        cart = get_or_create_active_cart(
            user=request.user,
        )

        cart = get_cart_queryset().get(pk=cart.pk)

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Add item to cart",
        description=(
            "Menambahkan product variant ke active cart.\n\n"
            "Jika variant sudah ada di cart, quantity akan "
            "ditambahkan ke quantity yang sudah ada.\n\n"
            "Backend akan memvalidasi stock yang tersedia, "
            "tetapi tidak melakukan reservation. Reservation "
            "dilakukan pada proses checkout."
        ),
        request=AddCartItemSerializer,
        responses={
            201: OpenApiResponse(
                response=CartSerializer,
                description="Item berhasil ditambahkan ke cart.",
            ),
            400: OpenApiResponse(
                description="Request tidak valid atau stock tidak mencukupi.",
            ),
        },
        tags=["Cart"],
    )
    def create(self, request):
        serializer = AddCartItemSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        try:
            item = add_item(
                user=request.user,
                variant=serializer.validated_data["variant"],
                quantity=serializer.validated_data["quantity"],
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_cart_queryset().get(pk=item.cart_id)

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Update cart item quantity",
        description=(
            "Mengubah quantity satu cart item.\n\n"
            "Variant tidak dapat diubah melalui endpoint ini. "
            "Untuk variant berbeda, hapus item lalu tambahkan "
            "variant baru.\n\n"
            "Backend akan memvalidasi stock yang tersedia."
        ),
        request=UpdateCartItemSerializer,
        responses={
            200: OpenApiResponse(
                response=CartSerializer,
                description="Quantity berhasil diperbarui.",
            ),
            400: OpenApiResponse(
                description="Request tidak valid atau stock tidak mencukupi.",
            ),
            404: OpenApiResponse(
                description="Cart item tidak ditemukan.",
            ),
        },
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="ID cart item.",
            ),
        ],
        tags=["Cart"],
    )
    def partial_update(self, request, pk=None):
        serializer = UpdateCartItemSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        try:
            item = update_item_quantity(
                user=request.user,
                item_id=pk,
                quantity=serializer.validated_data["quantity"],
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart = get_cart_queryset().get(pk=item.cart_id)

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Remove cart item",
        description="Menghapus satu item dari active cart.",
        responses={
            204: None,
            404: OpenApiResponse(
                description="Cart item tidak ditemukan.",
            ),
        },
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="ID cart item.",
            ),
        ],
        tags=["Cart"],
    )
    def destroy(self, request, pk=None):
        try:
            remove_item(
                user=request.user,
                item_id=pk,
            )
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )

    @extend_schema(
        summary="Clear cart",
        description=(
            "Menghapus seluruh item dari active cart milik "
            "authenticated user. Jika active cart belum ada "
            "atau cart sudah kosong, endpoint tetap berhasil "
            "tanpa membuat cart baru."
        ),
        responses={
            204: OpenApiResponse(
                description="Cart berhasil dikosongkan.",
            ),
        },
        tags=["Cart"],
    )
    @action(
        detail=False,
        methods=["delete"],
        url_path="clear",
    )
    def clear(self, request):
        clear_cart(user=request.user)

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )
