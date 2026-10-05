from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Address
from .serializers import AddressSerializer


@extend_schema(tags=["User Addresses"])
@extend_schema_view(
    list=extend_schema(
        summary="List my addresses",
        description=(
            "Mengambil seluruh alamat milik user yang sedang login.\n\n"
            "Endpoint ini hanya mengembalikan alamat milik user tersebut. "
            "Alamat milik user lain tidak dapat diakses."
        ),
        responses={
            200: OpenApiResponse(
                response=AddressSerializer(many=True),
                description="Daftar alamat milik user.",
            ),
            401: OpenApiResponse(
                description="Authentication diperlukan.",
            ),
        },
    ),
    retrieve=extend_schema(
        summary="Get my address",
        description=(
            "Mengambil detail satu alamat milik user yang sedang login.\n\n"
            "Jika address ID bukan milik user tersebut, API akan "
            "mengembalikan 404."
        ),
        responses={
            200: OpenApiResponse(
                response=AddressSerializer,
                description="Detail alamat.",
            ),
            401: OpenApiResponse(
                description="Authentication diperlukan.",
            ),
            404: OpenApiResponse(
                description="Alamat tidak ditemukan.",
            ),
        },
    ),
    create=extend_schema(
        summary="Create address",
        description=(
            "Membuat alamat baru untuk user yang sedang login.\n\n"
            "Field `user` tidak perlu dikirim karena user diambil "
            "secara otomatis dari JWT authentication."
        ),
        request=AddressSerializer,
        responses={
            201: OpenApiResponse(
                response=AddressSerializer,
                description="Alamat berhasil dibuat.",
            ),
            400: OpenApiResponse(
                description="Data alamat tidak valid.",
            ),
            401: OpenApiResponse(
                description="Authentication diperlukan.",
            ),
        },
        examples=[
            OpenApiExample(
                "Create address",
                request_only=True,
                value={
                    "label": "Home",
                    "recipient_name": "GIDORA Customer",
                    "phone_number": "081234567890",
                    "address_line": "Jl. Contoh No. 123",
                    "sub_district": "Kebayoran Baru",
                    "district": "Jakarta Selatan",
                    "city": "Jakarta Selatan",
                    "province": "DKI Jakarta",
                    "postal_code": "12190",
                    "country": "Indonesia",
                },
            ),
        ],
    ),
    update=extend_schema(
        summary="Replace my address",
        description=(
            "Mengganti seluruh data alamat milik user yang sedang login.\n\n"
            "Gunakan `PATCH` jika hanya ingin mengubah sebagian field."
        ),
        request=AddressSerializer,
        responses={
            200: OpenApiResponse(
                response=AddressSerializer,
                description="Alamat berhasil diperbarui.",
            ),
            400: OpenApiResponse(
                description="Data alamat tidak valid.",
            ),
            401: OpenApiResponse(
                description="Authentication diperlukan.",
            ),
            404: OpenApiResponse(
                description="Alamat tidak ditemukan.",
            ),
        },
    ),
    partial_update=extend_schema(
        summary="Partially update my address",
        description=("Mengubah sebagian field dari alamat milik user yang sedang login."),
        request=AddressSerializer,
        responses={
            200: OpenApiResponse(
                response=AddressSerializer,
                description="Alamat berhasil diperbarui.",
            ),
            400: OpenApiResponse(
                description="Data alamat tidak valid.",
            ),
            401: OpenApiResponse(
                description="Authentication diperlukan.",
            ),
            404: OpenApiResponse(
                description="Alamat tidak ditemukan.",
            ),
        },
    ),
    destroy=extend_schema(
        summary="Delete my address",
        description=(
            "Menghapus alamat milik user yang sedang login.\n\n"
            "Pastikan alamat tersebut tidak sedang digunakan oleh "
            "proses checkout yang aktif."
        ),
        responses={
            204: OpenApiResponse(
                description="Alamat berhasil dihapus.",
            ),
            401: OpenApiResponse(
                description="Authentication diperlukan.",
            ),
            404: OpenApiResponse(
                description="Alamat tidak ditemukan.",
            ),
        },
    ),
)
class AddressViewSet(viewsets.ModelViewSet):
    """
    CRUD alamat milik user yang sedang login.

    User hanya dapat mengakses alamat miliknya sendiri.
    """

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Address.objects.none()

        return Address.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
        )
