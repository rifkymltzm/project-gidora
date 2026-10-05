from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.catalog.models import ProductVariant


class Cart(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        CONVERTED = "CONVERTED", "Converted"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="carts",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(status="ACTIVE"),
                name="uq_active_cart_per_user",
            ),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.status}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "variant"],
                name="uq_cart_variant",
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name="cart_item_quantity_positive",
            ),
        ]

    def __str__(self):
        return f"{self.cart} - " f"{self.variant.sku} x {self.quantity}"
