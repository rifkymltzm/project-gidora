from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import Inventory, InventoryReservation


@transaction.atomic
def add_stock(*, variant, quantity):
    if quantity <= 0:
        raise ValidationError({"quantity": "Quantity must be greater than zero."})

    inventory, _ = Inventory.objects.select_for_update().get_or_create(variant=variant)

    inventory.stock_on_hand += quantity
    inventory.save(update_fields=["stock_on_hand", "updated_at"])

    return inventory


@transaction.atomic
def reserve_stock(*, order, variant, quantity, expires_at):
    if quantity <= 0:
        raise ValidationError({"quantity": "Quantity must be greater than zero."})

    if expires_at <= timezone.now():
        raise ValidationError({"expires_at": "Reservation expiration must be in the future."})

    try:
        inventory = (
            Inventory.objects.select_for_update().select_related("variant").get(variant=variant)
        )
    except Inventory.DoesNotExist:
        raise ValidationError({"inventory": (f"Inventory not found for variant '{variant.sku}'.")})

    available = inventory.stock_on_hand - inventory.reserved

    if quantity > available:
        raise ValidationError({"quantity": (f"Insufficient stock. Available stock: {available}.")})

    inventory.reserved += quantity
    inventory.save(update_fields=["reserved", "updated_at"])

    return InventoryReservation.objects.create(
        inventory=inventory,
        order=order,
        quantity=quantity,
        expires_at=expires_at,
    )


@transaction.atomic
def set_reservation_expiry(*, reservation, expires_at):
    """
    Update the expiry time of an active inventory reservation.
    """

    if expires_at <= timezone.now():
        raise ValidationError({"expires_at": "Expiration must be in the future."})

    reservation = InventoryReservation.objects.select_for_update().get(pk=reservation.pk)

    if reservation.status != InventoryReservation.Status.ACTIVE:
        raise ValidationError({"reservation": ("Only active reservations can be updated.")})

    if reservation.expires_at <= timezone.now():
        raise ValidationError(
            {
                "reservation": (
                    "Reservation has expired. " "Create a new order before creating a payment."
                )
            }
        )

    reservation.expires_at = expires_at

    reservation.save(update_fields=["expires_at", "updated_at"])

    return reservation


@transaction.atomic
def release_reservation(*, reservation):
    reservation = (
        InventoryReservation.objects.select_for_update()
        .select_related("inventory")
        .get(pk=reservation.pk)
    )

    if reservation.status != InventoryReservation.Status.ACTIVE:
        return reservation

    inventory = Inventory.objects.select_for_update().get(pk=reservation.inventory_id)

    inventory.reserved -= reservation.quantity
    inventory.save(update_fields=["reserved", "updated_at"])

    reservation.status = InventoryReservation.Status.RELEASED
    reservation.save(update_fields=["status", "updated_at"])

    return reservation


@transaction.atomic
def confirm_reservation(*, reservation):
    reservation = (
        InventoryReservation.objects.select_for_update()
        .select_related("inventory")
        .get(pk=reservation.pk)
    )

    if reservation.status != InventoryReservation.Status.ACTIVE:
        return reservation

    inventory = Inventory.objects.select_for_update().get(pk=reservation.inventory_id)

    if reservation.expires_at <= timezone.now():
        inventory.reserved -= reservation.quantity
        inventory.save(update_fields=["reserved", "updated_at"])

        reservation.status = InventoryReservation.Status.EXPIRED
        reservation.save(update_fields=["status", "updated_at"])

        return reservation

    inventory.stock_on_hand -= reservation.quantity
    inventory.reserved -= reservation.quantity
    inventory.save(update_fields=["stock_on_hand", "reserved", "updated_at"])

    reservation.status = InventoryReservation.Status.CONFIRMED
    reservation.save(update_fields=["status", "updated_at"])

    return reservation
