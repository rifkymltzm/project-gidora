from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.orders.models import Order

from .models import ShippingMethod, Shipment, ShipmentItem


def get_shipping_methods():
    """
    Return all active shipping methods.
    """

    return ShippingMethod.objects.filter(
        is_active=True,
    )


@transaction.atomic
def create_shipment(*, order):
    """
    Create a shipment for a confirmed order.

    One order can only have one shipment.
    """

    if order.status != Order.Status.CONFIRMED:
        raise ValidationError({"order": ("Shipment can only be created " "for a confirmed order.")})

    if Shipment.objects.filter(order=order).exists():
        raise ValidationError({"shipment": ("Shipment already exists for this order.")})

    order_items = list(order.items.all())

    if not order_items:
        raise ValidationError({"order": "Order has no items."})

    shipment = Shipment.objects.create(
        order=order,
        status=Shipment.Status.PENDING,
    )

    ShipmentItem.objects.bulk_create(
        [
            ShipmentItem(
                shipment=shipment,
                order_item=order_item,
                product_name_snapshot=order_item.product_name_snapshot,
                sku_snapshot=order_item.sku_snapshot,
                quantity=order_item.quantity,
            )
            for order_item in order_items
        ]
    )

    return shipment


@transaction.atomic
def start_processing(*, shipment):
    """
    Move a pending shipment into processing.
    """

    shipment = Shipment.objects.select_for_update().select_related("order").get(pk=shipment.pk)

    if shipment.status != Shipment.Status.PENDING:
        raise ValidationError({"shipment": ("Only a pending shipment " "can start processing.")})

    order = Order.objects.select_for_update().get(pk=shipment.order_id)

    shipment.status = Shipment.Status.PROCESSING
    shipment.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    order.status = Order.Status.PROCESSING
    order.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return shipment


@transaction.atomic
def ship_order(*, shipment, tracking_number):
    """
    Mark a processing shipment as shipped.

    Courier and service are taken from the order's
    shipping snapshot. Tracking number is provided
    manually by staff.
    """

    shipment = Shipment.objects.select_for_update().select_related("order").get(pk=shipment.pk)

    if shipment.status != Shipment.Status.PROCESSING:
        raise ValidationError({"shipment": ("Only a processing shipment " "can be shipped.")})

    if not tracking_number:
        raise ValidationError({"tracking_number": ("Tracking number is required.")})

    order = Order.objects.select_for_update().get(pk=shipment.order_id)

    shipment.status = Shipment.Status.SHIPPED
    shipment.courier = order.shipping_courier
    shipment.service = order.shipping_service
    shipment.tracking_number = tracking_number
    shipment.shipped_at = timezone.now()

    shipment.save(
        update_fields=[
            "status",
            "courier",
            "service",
            "tracking_number",
            "shipped_at",
            "updated_at",
        ]
    )

    order.status = Order.Status.SHIPPED
    order.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return shipment


@transaction.atomic
def mark_delivered(*, shipment):
    """
    Mark a shipped shipment as delivered.
    """

    shipment = Shipment.objects.select_for_update().select_related("order").get(pk=shipment.pk)

    if shipment.status != Shipment.Status.SHIPPED:
        raise ValidationError({"shipment": ("Only a shipped shipment " "can be delivered.")})

    order = Order.objects.select_for_update().get(pk=shipment.order_id)

    shipment.status = Shipment.Status.DELIVERED
    shipment.delivered_at = timezone.now()

    shipment.save(
        update_fields=[
            "status",
            "delivered_at",
            "updated_at",
        ]
    )

    order.status = Order.Status.DELIVERED
    order.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return shipment


@transaction.atomic
def cancel_shipment(*, shipment):
    """
    Cancel a shipment that has not been shipped yet.
    """

    shipment = Shipment.objects.select_for_update().get(pk=shipment.pk)

    if shipment.status not in {
        Shipment.Status.PENDING,
        Shipment.Status.PROCESSING,
    }:
        raise ValidationError(
            {"shipment": ("Only pending or processing " "shipments can be cancelled.")}
        )

    shipment.status = Shipment.Status.CANCELLED
    shipment.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return shipment
