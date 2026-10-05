from django.core.exceptions import ValidationError

from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
)

from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Shipment
from .serializers import (
    ShipmentSerializer,
    ShipmentShipSerializer,
    ShippingMethodSerializer,
)
from .services import (
    cancel_shipment,
    get_shipping_methods,
    mark_delivered,
    ship_order,
    start_processing,
)


# ============================================================
# CUSTOMER
# ============================================================


class ShippingMethodListView(APIView):
    """
    Menampilkan metode pengiriman yang aktif dan tersedia
    untuk customer saat checkout.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ShippingMethodSerializer

    @extend_schema(
        operation_id="shipping_methods_list",
        summary="List Shipping Methods",
        description="""
Retrieve all active shipping methods available to customers.

This endpoint is used during checkout so the customer can select
a shipping method before creating an order.

Each shipping method contains:

- `id` — shipping method identifier used when creating an order.
- `code` — unique shipping method code.
- `courier` — courier name.
- `service` — courier service.
- `price` — static shipping price in IDR.

Only shipping methods with `is_active=true` are returned.

For the current MVP, shipping prices are static and are not calculated
dynamically based on destination, weight, or courier API.
""",
        responses={
            200: OpenApiResponse(
                response=ShippingMethodSerializer(many=True),
                description="List of active shipping methods.",
                examples=[
                    OpenApiExample(
                        "Shipping Methods",
                        value=[
                            {
                                "id": 1,
                                "code": "JNE_REG",
                                "courier": "JNE",
                                "service": "REG",
                                "price": "15000",
                            },
                            {
                                "id": 2,
                                "code": "JNE_YES",
                                "courier": "JNE",
                                "service": "YES",
                                "price": "25000",
                            },
                        ],
                        response_only=True,
                    ),
                ],
            ),
            401: OpenApiResponse(
                description="Authentication credentials were not provided.",
            ),
        },
        tags=["Shipping"],
    )
    def get(self, request):
        shipping_methods = get_shipping_methods()

        serializer = ShippingMethodSerializer(
            shipping_methods,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class ShipmentDetailView(APIView):
    """
    Customer melihat status shipment milik order-nya sendiri.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ShipmentSerializer

    def get_shipment(self, request, order_number):
        try:
            return (
                Shipment.objects
                .select_related("order")
                .prefetch_related("items")
                .get(
                    order__order_number=order_number,
                    order__user=request.user,
                )
            )
        except Shipment.DoesNotExist:
            return None

    @extend_schema(
        operation_id="shipment_retrieve",
        summary="Get Shipment",
        description="""
Retrieve shipment information for a specific order.

Customers can only access the shipment belonging to their own order.

### Shipment lifecycle

- `PENDING` — shipment has been created and is waiting for fulfillment.
- `PROCESSING` — staff is currently processing the order.
- `SHIPPED` — shipment has been handed to the courier and tracking
  information is available.
- `DELIVERED` — shipment has been delivered to the customer.
- `CANCELLED` — shipment was cancelled before being shipped.

A shipment is normally created automatically when payment succeeds,
the order becomes `CONFIRMED`, and the fulfillment flow begins.

The response also includes `order_status`, which represents the overall
order status separately from the shipment status.
""",
        parameters=[
            OpenApiParameter(
                name="order_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="GIDORA order number.",
                examples=[
                    OpenApiExample(
                        "Order Number",
                        value="GDR-20260929-0008",
                    ),
                ],
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=ShipmentSerializer,
                description="Shipment information for the specified order.",
                examples=[
                    OpenApiExample(
                        "Shipment",
                        value={
                            "id": 1,
                            "order_number": "GDR-20260929-0008",
                            "order_status": "SHIPPED",
                            "status": "SHIPPED",
                            "courier": "JNE",
                            "service": "REG",
                            "tracking_number": "JNE123456789",
                            "shipped_at": "2026-10-01T10:00:00+07:00",
                            "delivered_at": None,
                            "created_at": "2026-09-30T14:00:00+07:00",
                            "updated_at": "2026-10-01T10:00:00+07:00",
                            "items": [
                                {
                                    "id": 1,
                                    "product_name_snapshot": "Test Shirt",
                                    "sku_snapshot": "GDR-SH-001-BLK-M",
                                    "quantity": 2,
                                }
                            ],
                        },
                        response_only=True,
                    ),
                ],
            ),
            401: OpenApiResponse(
                description="Authentication credentials were not provided.",
            ),
            404: OpenApiResponse(
                description=(
                    "Shipment was not found, or the order does not "
                    "belong to the authenticated customer."
                ),
            ),
        },
        tags=["Shipping"],
    )
    def get(self, request, order_number):
        shipment = self.get_shipment(
            request=request,
            order_number=order_number,
        )

        if not shipment:
            return Response(
                {"detail": "Shipment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            ShipmentSerializer(shipment).data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# ADMIN SHIPPING
# ============================================================


class AdminShipmentBaseView(APIView):
    """
    Base view untuk seluruh endpoint fulfillment staff.
    """

    permission_classes = [IsAdminUser]
    serializer_class = ShipmentSerializer

    def get_shipment(self, order_number):
        try:
            return (
                Shipment.objects
                .select_related("order")
                .prefetch_related("items")
                .get(
                    order__order_number=order_number,
                )
            )
        except Shipment.DoesNotExist:
            return None

    def refresh_shipment(self, shipment):
        """
        Ambil ulang shipment dari database setelah service
        mengubah status shipment/order.

        Ini memastikan serializer membaca state terbaru dari database.
        """
        return (
            Shipment.objects
            .select_related("order")
            .prefetch_related("items")
            .get(pk=shipment.pk)
        )


class ShipmentProcessingView(AdminShipmentBaseView):

    @extend_schema(
        operation_id="admin_shipment_processing",
        summary="Start Shipment Processing",
        description="""
Start fulfillment processing for an order's shipment.

This endpoint is restricted to staff/admin users.

### Requirements

- Shipment must currently have status `PENDING`.
- No request body is required.

### Result

- Shipment status → `PROCESSING`
- Order status → `PROCESSING`

This endpoint only changes the fulfillment state. It does not modify
payment data or inventory quantities.
""",
        parameters=[
            OpenApiParameter(
                name="order_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="GIDORA order number.",
                examples=[
                    OpenApiExample(
                        "Order Number",
                        value="GDR-20260929-0008",
                    ),
                ],
            ),
        ],
        request=None,
        responses={
            200: OpenApiResponse(
                response=ShipmentSerializer,
                description="Shipment successfully moved to PROCESSING.",
            ),
            400: OpenApiResponse(
                description=(
                    "Shipment cannot be processed because its current "
                    "status is not PENDING."
                ),
            ),
            401: OpenApiResponse(
                description="Authentication credentials were not provided.",
            ),
            403: OpenApiResponse(
                description="Authenticated user is not a staff/admin user.",
            ),
            404: OpenApiResponse(
                description="Shipment for the specified order was not found.",
            ),
        },
        tags=["Admin Shipping"],
    )
    def post(self, request, order_number):
        shipment = self.get_shipment(order_number)

        if not shipment:
            return Response(
                {"detail": "Shipment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            shipment = start_processing(
                shipment=shipment,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        shipment = self.refresh_shipment(shipment)

        return Response(
            ShipmentSerializer(shipment).data,
            status=status.HTTP_200_OK,
        )


class ShipmentShipView(AdminShipmentBaseView):

    serializer_class = ShipmentShipSerializer

    @extend_schema(
        operation_id="admin_shipment_ship",
        summary="Ship Order",
        description="""
Mark a shipment as shipped.

This endpoint is restricted to staff/admin users.

### Requirements

- Shipment must currently have status `PROCESSING`.
- `tracking_number` is required.
- No courier or service is accepted in the request body.

Courier and service are taken from the shipping snapshot stored on
the Order and copied to the Shipment when the shipment is marked as
shipped.

### Result

- Shipment status → `SHIPPED`
- Order status → `SHIPPED`
- `shipped_at` is automatically set.
- Courier and service are copied from the order shipping snapshot.
""",
        parameters=[
            OpenApiParameter(
                name="order_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="GIDORA order number.",
                examples=[
                    OpenApiExample(
                        "Order Number",
                        value="GDR-20260929-0008",
                    ),
                ],
            ),
        ],
        request=ShipmentShipSerializer,
        examples=[
            OpenApiExample(
                "Ship Order Request",
                value={
                    "tracking_number": "JNE123456789",
                },
                request_only=True,
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=ShipmentSerializer,
                description="Shipment successfully marked as SHIPPED.",
                examples=[
                    OpenApiExample(
                        "Shipped Shipment",
                        value={
                            "id": 1,
                            "order_number": "GDR-20260929-0008",
                            "order_status": "SHIPPED",
                            "status": "SHIPPED",
                            "courier": "JNE",
                            "service": "REG",
                            "tracking_number": "JNE123456789",
                            "shipped_at": "2026-10-01T10:00:00+07:00",
                            "delivered_at": None,
                            "created_at": "2026-09-30T14:00:00+07:00",
                            "updated_at": "2026-10-01T10:00:00+07:00",
                            "items": [
                                {
                                    "id": 1,
                                    "product_name_snapshot": "Test Shirt",
                                    "sku_snapshot": "GDR-SH-001-BLK-M",
                                    "quantity": 2,
                                }
                            ],
                        },
                        response_only=True,
                    ),
                ],
            ),
            400: OpenApiResponse(
                description=(
                    "Invalid tracking number or shipment is not "
                    "currently in PROCESSING status."
                ),
            ),
            401: OpenApiResponse(
                description="Authentication credentials were not provided.",
            ),
            403: OpenApiResponse(
                description="Authenticated user is not a staff/admin user.",
            ),
            404: OpenApiResponse(
                description="Shipment for the specified order was not found.",
            ),
        },
        tags=["Admin Shipping"],
    )
    def post(self, request, order_number):
        serializer = ShipmentShipSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        shipment = self.get_shipment(order_number)

        if not shipment:
            return Response(
                {"detail": "Shipment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            shipment = ship_order(
                shipment=shipment,
                tracking_number=serializer.validated_data["tracking_number"],
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        shipment = self.refresh_shipment(shipment)

        return Response(
            ShipmentSerializer(shipment).data,
            status=status.HTTP_200_OK,
        )


class ShipmentDeliverView(AdminShipmentBaseView):

    @extend_schema(
        operation_id="admin_shipment_deliver",
        summary="Mark Shipment as Delivered",
        description="""
Mark a shipped shipment as delivered.

This endpoint is restricted to staff/admin users.

### Requirements

- Shipment must currently have status `SHIPPED`.
- No request body is required.

### Result

- Shipment status → `DELIVERED`
- Order status → `DELIVERED`
- `delivered_at` is automatically set.
""",
        parameters=[
            OpenApiParameter(
                name="order_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="GIDORA order number.",
                examples=[
                    OpenApiExample(
                        "Order Number",
                        value="GDR-20260929-0008",
                    ),
                ],
            ),
        ],
        request=None,
        responses={
            200: OpenApiResponse(
                response=ShipmentSerializer,
                description="Shipment successfully marked as DELIVERED.",
            ),
            400: OpenApiResponse(
                description=(
                    "Shipment cannot be delivered because its current "
                    "status is not SHIPPED."
                ),
            ),
            401: OpenApiResponse(
                description="Authentication credentials were not provided.",
            ),
            403: OpenApiResponse(
                description="Authenticated user is not a staff/admin user.",
            ),
            404: OpenApiResponse(
                description="Shipment for the specified order was not found.",
            ),
        },
        tags=["Admin Shipping"],
    )
    def post(self, request, order_number):
        shipment = self.get_shipment(order_number)

        if not shipment:
            return Response(
                {"detail": "Shipment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            shipment = mark_delivered(
                shipment=shipment,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        shipment = self.refresh_shipment(shipment)

        return Response(
            ShipmentSerializer(shipment).data,
            status=status.HTTP_200_OK,
        )


class ShipmentCancelView(AdminShipmentBaseView):

    @extend_schema(
        operation_id="admin_shipment_cancel",
        summary="Cancel Shipment",
        description="""
Cancel a shipment before it has been shipped.

This endpoint is restricted to staff/admin users.

### Requirements

The shipment must currently be:

- `PENDING`, or
- `PROCESSING`

A shipment that is already `SHIPPED` or `DELIVERED` cannot be cancelled
through this endpoint.

### Result

- Shipment status → `CANCELLED`

This operation only changes the Shipment status.

It does **not** automatically change the related Order status to
`CANCELLED`.
""",
        parameters=[
            OpenApiParameter(
                name="order_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description="GIDORA order number.",
                examples=[
                    OpenApiExample(
                        "Order Number",
                        value="GDR-20260929-0008",
                    ),
                ],
            ),
        ],
        request=None,
        responses={
            200: OpenApiResponse(
                response=ShipmentSerializer,
                description="Shipment successfully cancelled.",
            ),
            400: OpenApiResponse(
                description=(
                    "Shipment cannot be cancelled because its current "
                    "status does not allow cancellation."
                ),
            ),
            401: OpenApiResponse(
                description="Authentication credentials were not provided.",
            ),
            403: OpenApiResponse(
                description="Authenticated user is not a staff/admin user.",
            ),
            404: OpenApiResponse(
                description="Shipment for the specified order was not found.",
            ),
        },
        tags=["Admin Shipping"],
    )
    def post(self, request, order_number):
        shipment = self.get_shipment(order_number)

        if not shipment:
            return Response(
                {"detail": "Shipment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            shipment = cancel_shipment(
                shipment=shipment,
            )
        except ValidationError as exc:
            return Response(
                exc.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        shipment = self.refresh_shipment(shipment)

        return Response(
            ShipmentSerializer(shipment).data,
            status=status.HTTP_200_OK,
        )
