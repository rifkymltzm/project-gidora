from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Inventory, InventoryReservation
from .serializers import (
    AddStockSerializer,
    InventoryReservationSerializer,
    InventorySerializer,
)
from .services import add_stock


@extend_schema_view(
    list=extend_schema(
        summary="List inventory",
        description=(
            "Mengambil daftar inventory seluruh product variant. "
            "Endpoint ini hanya dapat diakses oleh staff/admin.\n\n"
            "Field `available` dihitung sebagai "
            "`stock_on_hand - reserved`."
        ),
        responses={
            200: OpenApiResponse(
                response=InventorySerializer(many=True),
                description="Daftar inventory.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve inventory",
        description=("Mengambil detail inventory berdasarkan ID inventory."),
        responses={
            200: OpenApiResponse(
                response=InventorySerializer,
                description="Detail inventory.",
            ),
            404: OpenApiResponse(
                description="Inventory tidak ditemukan.",
            ),
        },
    ),
)
@extend_schema(tags=["Admin Inventory"])
class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Internal inventory management API.

    Inventory hanya dapat dilihat oleh staff/admin.
    Perubahan stock dilakukan melalui inventory service.
    """

    queryset = Inventory.objects.select_related(
        "variant",
        "variant__product_color__product",
        "variant__product_color__color",
        "variant__size",
    ).all()

    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(
        summary="Add stock",
        description=(
            "Menambahkan stock ke inventory sebuah product variant.\n\n"
            "Jika inventory untuk variant tersebut belum tersedia, "
            "inventory akan dibuat secara otomatis.\n\n"
            "Operasi ini dilakukan secara atomic untuk menjaga "
            "konsistensi stock."
        ),
        request=AddStockSerializer,
        responses={
            200: OpenApiResponse(
                response=InventorySerializer,
                description="Stock berhasil ditambahkan.",
                examples=[
                    OpenApiExample(
                        "Example response",
                        value={
                            "id": 1,
                            "variant": 12,
                            "variant_sku": "GDR-OW-001-BLK-M",
                            "stock_on_hand": 25,
                            "reserved": 5,
                            "available": 20,
                            "updated_at": "2026-09-30T12:00:00Z",
                        },
                    ),
                ],
            ),
            400: OpenApiResponse(
                description="Data request tidak valid.",
            ),
        },
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="add-stock",
    )
    def add_stock(self, request):
        serializer = AddStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        inventory = add_stock(
            variant=serializer.validated_data["variant"],
            quantity=serializer.validated_data["quantity"],
        )

        return Response(
            InventorySerializer(inventory).data,
            status=status.HTTP_200_OK,
        )


@extend_schema_view(
    list=extend_schema(
        summary="List inventory reservations",
        description=(
            "Mengambil daftar inventory reservation. "
            "Endpoint ini hanya dapat diakses oleh staff/admin.\n\n"
            "Reservation dibuat dan diubah melalui inventory service "
            "sebagai bagian dari flow checkout dan payment."
        ),
        responses={
            200: OpenApiResponse(
                response=InventoryReservationSerializer(many=True),
                description="Daftar inventory reservation.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve inventory reservation",
        description=("Mengambil detail satu inventory reservation berdasarkan ID."),
        responses={
            200: OpenApiResponse(
                response=InventoryReservationSerializer,
                description="Detail inventory reservation.",
            ),
            404: OpenApiResponse(
                description="Inventory reservation tidak ditemukan.",
            ),
        },
    ),
)
@extend_schema(tags=["Admin Inventory"])
class InventoryReservationViewSet(
    viewsets.ReadOnlyModelViewSet,
):
    """
    Internal inventory reservation API.

    Reservation lifecycle tidak dikelola secara langsung melalui API.
    Lifecycle ditangani oleh inventory services.
    """

    queryset = InventoryReservation.objects.select_related(
        "order",
        "inventory",
        "inventory__variant",
    ).all()

    serializer_class = InventoryReservationSerializer
    permission_classes = [permissions.IsAdminUser]
