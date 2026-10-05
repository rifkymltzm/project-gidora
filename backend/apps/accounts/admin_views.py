from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .admin_serializers import AdminUserSerializer
from .models import User


@extend_schema(tags=["Admin Accounts"])
@extend_schema_view(
    list=extend_schema(
        operation_id="admin_accounts_users_list",
        summary="List customers",
        description=(
            "Mengambil daftar akun customer. "
            "Akun staff dan superuser tidak disertakan."
        ),
        parameters=[
            OpenApiParameter(
                name="search",
                type=str,
                location=OpenApiParameter.QUERY,
                description="Cari berdasarkan email, nama depan, atau nama belakang.",
            ),
            OpenApiParameter(
                name="ordering",
                type=str,
                location=OpenApiParameter.QUERY,
                description="Urutkan berdasarkan created_at atau -created_at.",
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=AdminUserSerializer(many=True),
                description="Daftar customer.",
            ),
            401: OpenApiResponse(description="Authentication diperlukan."),
            403: OpenApiResponse(description="Akses hanya untuk staff."),
        },
    ),
    retrieve=extend_schema(
        operation_id="admin_accounts_users_retrieve",
        summary="Get customer detail",
        description=(
            "Mengambil detail akun customer berdasarkan ID. "
            "Akun staff dan superuser tidak dapat diakses melalui endpoint ini."
        ),
        responses={
            200: OpenApiResponse(
                response=AdminUserSerializer,
                description="Detail customer.",
            ),
            401: OpenApiResponse(description="Authentication diperlukan."),
            403: OpenApiResponse(description="Akses hanya untuk staff."),
            404: OpenApiResponse(description="Customer tidak ditemukan."),
        },
    ),
    partial_update=extend_schema(
        operation_id="admin_accounts_users_partial_update",
        summary="Update customer",
        description=(
            "Memperbarui informasi customer. "
            "Field yang dapat diubah adalah first_name, last_name, "
            "phone_number, dan is_active. "
            "Email serta permission akun tidak dapat diubah melalui endpoint ini."
        ),
        request=AdminUserSerializer,
        responses={
            200: OpenApiResponse(
                response=AdminUserSerializer,
                description="Data customer berhasil diperbarui.",
            ),
            400: OpenApiResponse(description="Data tidak valid."),
            401: OpenApiResponse(description="Authentication diperlukan."),
            403: OpenApiResponse(description="Akses hanya untuk staff."),
            404: OpenApiResponse(description="Customer tidak ditemukan."),
        },
    ),
)
class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    http_method_names = [
        "get",
        "patch",
        "head",
        "options",
    ]

    search_fields = [
        "email",
        "first_name",
        "last_name",
    ]

    ordering_fields = [
        "created_at",
    ]

    ordering = [
        "-created_at",
    ]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return User.objects.none()

        return User.objects.filter(
            is_staff=False,
            is_superuser=False,
        ).order_by("-created_at")
