from django.core.validators import MinValueValidator
from django.db import models


class ShippingMethod(models.Model):
    """
    Metode pengiriman yang tersedia untuk customer.

    Untuk MVP, harga shipping bersifat statis.
    """

    code = models.CharField(
        max_length=30,
        unique=True,
    )

    courier = models.CharField(
        max_length=50,
    )

    service = models.CharField(
        max_length=50,
    )

    price = models.DecimalField(
        max_digits=14,
        decimal_places=0,
        validators=[MinValueValidator(0)],
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["price", "id"]

    def __str__(self):
        return f"{self.courier} {self.service}"


class Shipment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        SHIPPED = "SHIPPED", "Shipped"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"

    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.PROTECT,
        related_name="shipment",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    courier = models.CharField(max_length=50, blank=True)
    service = models.CharField(max_length=50, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)

    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"


class ShipmentItem(models.Model):
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
        related_name="items",
    )
    order_item = models.ForeignKey(
        "orders.OrderItem",
        on_delete=models.PROTECT,
        related_name="shipment_items",
    )

    product_name_snapshot = models.CharField(max_length=200)
    sku_snapshot = models.CharField(max_length=80)
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["shipment", "order_item"],
                name="uq_shipment_order_item",
            ),
        ]

    def __str__(self):
        return f"{self.shipment.order.order_number} - {self.sku_snapshot}"
