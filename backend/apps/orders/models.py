from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        PROCESSING = "PROCESSING", "Processing"
        SHIPPED = "SHIPPED", "Shipped"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"

    order_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
        blank=True,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    subtotal = models.DecimalField(
        max_digits=14,
        decimal_places=0,
        validators=[MinValueValidator(0)],
    )

    discount_amount = models.DecimalField(
        max_digits=14,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
    )

    shipping_amount = models.DecimalField(
        max_digits=14,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
    )

    shipping_method_code = models.CharField(
        max_length=30,
        blank=True,
    )

    shipping_courier = models.CharField(
        max_length=50,
        blank=True,
    )

    shipping_service = models.CharField(
        max_length=50,
        blank=True,
    )

    tax_amount = models.DecimalField(
        max_digits=14,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
    )

    total_amount = models.DecimalField(
        max_digits=14,
        decimal_places=0,
        validators=[MinValueValidator(0)],
    )

    currency = models.CharField(
        max_length=3,
        default="IDR",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.order_number:
            if not self.pk:
                super().save(*args, **kwargs)

            self.order_number = f"GDR-{self.created_at:%Y%m%d}-{self.pk:04d}"

            super().save(
                update_fields=["order_number"],
            )
            return

        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product_variant = models.ForeignKey(
        "catalog.ProductVariant",
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    product_name_snapshot = models.CharField(
        max_length=200,
    )

    sku_snapshot = models.CharField(
        max_length=80,
    )

    variant_snapshot = models.CharField(
        max_length=200,
    )

    unit_price = models.DecimalField(
        max_digits=14,
        decimal_places=0,
        validators=[MinValueValidator(0)],
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    subtotal = models.DecimalField(
        max_digits=14,
        decimal_places=0,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.order.order_number} - {self.sku_snapshot}"


class OrderAddress(models.Model):
    class AddressType(models.TextChoices):
        SHIPPING = "SHIPPING", "Shipping"
        BILLING = "BILLING", "Billing"

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="addresses",
    )

    address_type = models.CharField(
        max_length=20,
        choices=AddressType.choices,
    )

    recipient_name = models.CharField(
        max_length=150,
    )

    phone_number = models.CharField(
        max_length=30,
    )

    address_line = models.TextField()

    sub_district = models.CharField(
        max_length=100,
    )

    district = models.CharField(
        max_length=100,
    )

    city = models.CharField(
        max_length=100,
    )

    province = models.CharField(
        max_length=100,
    )

    postal_code = models.CharField(
        max_length=20,
    )

    country = models.CharField(
        max_length=100,
        default="Indonesia",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["order", "address_type"],
                name="uq_order_address_type",
            ),
        ]

    def __str__(self):
        return f"{self.order.order_number} - {self.address_type}"
