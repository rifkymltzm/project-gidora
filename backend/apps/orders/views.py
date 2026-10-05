from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
)

from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import (
    OrderCreateSerializer,
    OrderListSerializer,
    OrderSerializer,
)
from .services import cancel_order, create_order


class OrderListCreateView(APIView):
    """
    Customer order collection endpoint.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="orders_create",
        summary="Create Order",
        description=(
            "Create a new order from the authenticated user's active cart.\n\n"
            "Shipping address must be provided using exactly one of these "
            "sources:\n"
            "- `shipping_address_id`: use an existing address belonging to "
            "the authenticated user.\n"
            "- `shipping_address`: provide a new address for this order "
            "without saving it to the account.\n\n"
            "The selected shipping method must be active. "
            "The address is copied into the order as an address snapshot.\n\n"
            "The order is created with `PENDING` status. Inventory is "
            "reserved for the order and the active cart is converted to "
            "`CONVERTED` status as part of the same transaction.\n\n"
            "If order creation or inventory reservation fails, the "
            "transaction is rolled back."
        ),
        request=OrderCreateSerializer,
        responses={
            201: OpenApiResponse(
                response=OrderSerializer,
                description="Order successfully created.",
            ),
            400: OpenApiResponse(
                description=(
                    "Invalid request or order cannot be created. "
                    "Possible reasons include missing or conflicting "
                    "shipping address sources, invalid shipping method, "
                    "empty or missing active cart, inactive product "
                    "variant, or insufficient inventory."
                ),
            ),
            401: OpenApiResponse(
                description="Authentication required.",
            ),
        },
        tags=["Orders"],
    )
    def post(self, request):
        serializer = OrderCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        try:
            order = create_order(
                user=request.user,
                shipping_address=serializer.validated_data[
                    "shipping_address_data"
                ],
                shipping_method=serializer.validated_data[
                    "shipping_method_id"
                ],
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        operation_id="orders_list",
        summary="List My Orders",
        description=(
            "Return all orders belonging to the authenticated customer.\n\n"
            "Orders are returned from newest to oldest."
        ),
        responses={
            200: OpenApiResponse(
                response=OrderListSerializer(many=True),
                description="Orders successfully retrieved.",
            ),
            401: OpenApiResponse(
                description="Authentication required.",
            ),
        },
        tags=["Orders"],
    )
    def get(self, request):
        orders = Order.objects.filter(
            user=request.user,
        ).order_by("-created_at")

        serializer = OrderListSerializer(
            orders,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class OrderDetailView(APIView):
    """
    Customer order detail endpoint.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="orders_retrieve",
        summary="Get My Order Detail",
        description=(
            "Return detailed information about a specific order "
            "belonging to the authenticated customer.\n\n"
            "An order can only be retrieved by its owner."
        ),
        parameters=[
            OpenApiParameter(
                name="order_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="Unique GIDORA order number.",
                required=True,
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=OrderSerializer,
                description="Order detail successfully retrieved.",
            ),
            401: OpenApiResponse(
                description="Authentication required.",
            ),
            404: OpenApiResponse(
                description=(
                    "Order not found or the order does not belong "
                    "to the authenticated customer."
                ),
            ),
        },
        tags=["Orders"],
    )
    def get(self, request, order_number):
        order = get_object_or_404(
            Order.objects.filter(
                user=request.user,
                order_number=order_number,
            ).prefetch_related(
                "items",
                "addresses",
            ),
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


class OrderCancelView(APIView):
    """
    Customer order cancellation endpoint.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    @extend_schema(
        operation_id="orders_cancel",
        summary="Cancel My Order",
        description=(
            "Cancel a pending order belonging to the authenticated customer.\n\n"
            "Only orders with `PENDING` status can be cancelled. "
            "Active inventory reservations are released automatically.\n\n"
            "An order that already has a payment created cannot be "
            "cancelled directly through this endpoint."
        ),
        parameters=[
            OpenApiParameter(
                name="order_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="Unique GIDORA order number.",
                required=True,
            ),
        ],
        request=None,
        responses={
            200: OpenApiResponse(
                response=OrderSerializer,
                description="Order successfully cancelled.",
            ),
            400: OpenApiResponse(
                description=(
                    "Order cannot be cancelled because it is not in "
                    "`PENDING` status or a payment has already been created."
                ),
            ),
            401: OpenApiResponse(
                description="Authentication required.",
            ),
            404: OpenApiResponse(
                description=(
                    "Order not found or the order does not belong "
                    "to the authenticated customer."
                ),
            ),
        },
        tags=["Orders"],
    )
    def post(self, request, order_number):
        order = get_object_or_404(
            Order.objects.filter(
                user=request.user,
                order_number=order_number,
            ),
        )

        try:
            order = cancel_order(order=order)
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


class AdminOrderListView(APIView):
    """
    Staff order collection endpoint.
    """

    permission_classes = [IsAdminUser]

    @extend_schema(
        operation_id="admin_orders_list",
        summary="List All Orders",
        description=(
            "Return all customer orders for authenticated staff users.\n\n"
            "This endpoint is read-only. Order status changes are handled "
            "by the payment and shipping workflows."
        ),
        responses={
            200: OpenApiResponse(
                response=OrderListSerializer(many=True),
                description="Orders successfully retrieved.",
            ),
            401: OpenApiResponse(
                description="Authentication required.",
            ),
            403: OpenApiResponse(
                description="Staff permission required.",
            ),
        },
        tags=["Admin Orders"],
    )
    def get(self, request):
        orders = Order.objects.select_related(
            "user",
        ).order_by("-created_at")

        serializer = OrderListSerializer(
            orders,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class AdminOrderDetailView(APIView):
    """
    Staff order detail endpoint.
    """

    permission_classes = [IsAdminUser]

    @extend_schema(
        operation_id="admin_orders_retrieve",
        summary="Get Order Detail",
        description=(
            "Return detailed information about any customer order "
            "for authenticated staff users.\n\n"
            "This endpoint is read-only. Order status changes are handled "
            "by the payment and shipping workflows."
        ),
        parameters=[
            OpenApiParameter(
                name="order_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="Unique GIDORA order number.",
                required=True,
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=OrderSerializer,
                description="Order detail successfully retrieved.",
            ),
            401: OpenApiResponse(
                description="Authentication required.",
            ),
            403: OpenApiResponse(
                description="Staff permission required.",
            ),
            404: OpenApiResponse(
                description="Order not found.",
            ),
        },
        tags=["Admin Orders"],
    )
    def get(self, request, order_number):
        order = get_object_or_404(
            Order.objects.select_related(
                "user",
            ).prefetch_related(
                "items",
                "addresses",
            ),
            order_number=order_number,
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )
