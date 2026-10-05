from django.core.exceptions import ValidationError

from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
)

from rest_framework import permissions, status, views
from rest_framework.response import Response

from .serializers import CheckoutSummarySerializer
from .services import get_checkout_summary


class CheckoutPreviewView(views.APIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    @extend_schema(
        operation_id="checkout_preview",
        summary="Preview Checkout",
        description=(
            "Return a checkout summary based on the authenticated user's "
            "active cart.\n\n"
            "The response contains:\n"
            "- Cart items and current product variant information.\n"
            "- Available stock for each item.\n"
            "- Active shipping methods.\n"
            "- The selected shipping method, when provided.\n"
            "- Subtotal, discount, shipping amount, tax, and grand total.\n\n"
            "Use `shipping_method_id` to calculate the total with a specific "
            "shipping method. If it is omitted, `shipping_amount` is `0` "
            "and no shipping method is selected.\n\n"
            "This endpoint is read-only. It does not create an order, "
            "convert the cart, or reserve inventory."
        ),
        parameters=[
            OpenApiParameter(
                name="shipping_method_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description=(
                    "ID of an active shipping method to include in the "
                    "checkout calculation."
                ),
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=CheckoutSummarySerializer,
                description="Checkout summary successfully retrieved.",
            ),
            400: OpenApiResponse(
                description=(
                    "Checkout preview cannot be generated. Possible reasons "
                    "include missing or empty active cart, inactive product "
                    "variant, missing inventory, insufficient stock, invalid "
                    "shipping method ID, or inactive shipping method."
                ),
            ),
            401: OpenApiResponse(
                description="Authentication required.",
            ),
        },
        tags=["Checkout"],
    )
    def get(self, request):
        shipping_method_id = request.query_params.get("shipping_method_id")

        if shipping_method_id is not None:
            try:
                shipping_method_id = int(shipping_method_id)
            except (TypeError, ValueError):
                return Response(
                    {
                        "shipping_method": (
                            "Shipping method ID must be an integer."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            summary = get_checkout_summary(
                user=request.user,
                shipping_method_id=shipping_method_id,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CheckoutSummarySerializer(summary)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
