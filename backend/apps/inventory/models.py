from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db import models

from apps.catalog.models import ProductVariant


class Inventory(models.Model):
    variant = models.OneToOneField(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="inventory",
    )
    stock_on_hand = models.PositiveIntegerField(default=0)
    reserved = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["variant"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(reserved__lte=models.F("stock_on_hand")),
                name="inventory_reserved_lte_stock",
            ),
        ]

    @property
    def available(self):
        return self.stock_on_hand - self.reserved

    def clean(self):
        if self.reserved > self.stock_on_hand:
            raise ValidationError(
                {"reserved": ("Reserved stock cannot be greater than stock on hand.")}
            )

    def __str__(self):
        return f"{self.variant.sku} - {self.available} available"


class InventoryReservation(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        RELEASED = "RELEASED", "Released"
        CONFIRMED = "CONFIRMED", "Confirmed"
        EXPIRED = "EXPIRED", "Expired"

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="inventory_reservations",
    )
    inventory = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    quantity = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name="inventory_reservation_quantity_positive",
            ),
        ]

    def clean(self):
        if self.expires_at <= timezone.now():
            raise ValidationError({"expires_at": ("Reservation expiration must be in the future.")})

    def __str__(self):
        return (
            f"{self.order.order_number} - "
            f"{self.inventory.variant.sku} - "
            f"{self.quantity} - "
            f"{self.status}"
        )
