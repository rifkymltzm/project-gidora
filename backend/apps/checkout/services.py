from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db.models import Prefetch

from apps.cart.models import Cart, CartItem
from apps.inventory.models import Inventory
from apps.shipping.models import ShippingMethod


def get_checkout_summary(
    *,
    user,
    shipping_method_id=None,
):
    cart = (
        Cart.objects.prefetch_related(
            Prefetch(
                "items",
                queryset=CartItem.objects.select_related(
                    "variant__product_color__product",
                    "variant__product_color__color",
                    "variant__size",
                ),
            )
        )
        .filter(
            user=user,
            status=Cart.Status.ACTIVE,
        )
        .first()
    )

    if not cart:
        raise ValidationError(
            {
                "cart": "Active cart not found.",
            }
        )

    items = list(cart.items.all())

    if not items:
        raise ValidationError(
            {
                "cart": "Cart is empty.",
            }
        )

    variant_ids = [item.variant_id for item in items]

    inventories = {
        inventory.variant_id: inventory
        for inventory in (Inventory.objects.filter(variant_id__in=variant_ids))
    }

    subtotal = Decimal("0")
    checkout_items = []

    for item in items:
        variant = item.variant
        inventory = inventories.get(variant.id)

        if not variant.is_active:
            raise ValidationError(
                {"cart": (f"Product variant '{variant.sku}' " "is no longer available.")}
            )

        if not inventory:
            raise ValidationError(
                {"cart": (f"Product variant '{variant.sku}' " "has no inventory.")}
            )

        available_stock = inventory.available

        if item.quantity > available_stock:
            raise ValidationError(
                {
                    "cart": (
                        f"Insufficient stock for '{variant.sku}'. "
                        f"Available stock: {available_stock}."
                    )
                }
            )

        item_subtotal = variant.price * item.quantity

        subtotal += item_subtotal

        checkout_items.append(
            {
                "cart_item_id": item.id,
                "variant_id": variant.id,
                "product_name": (variant.product_color.product.name),
                "sku": variant.sku,
                "color": (variant.product_color.color.name),
                "size": variant.size.name,
                "price": variant.price,
                "available": available_stock,
                "quantity": item.quantity,
                "subtotal": item_subtotal,
            }
        )

    shipping_methods = list(
        ShippingMethod.objects.filter(
            is_active=True,
        )
    )

    selected_shipping_method = None

    if shipping_method_id is not None:
        try:
            selected_shipping_method = ShippingMethod.objects.get(
                pk=shipping_method_id,
                is_active=True,
            )
        except ShippingMethod.DoesNotExist:
            raise ValidationError({"shipping_method": ("Shipping method not found or inactive.")})

    shipping_amount = selected_shipping_method.price if selected_shipping_method else Decimal("0")

    discount_amount = Decimal("0")
    tax_amount = Decimal("0")

    grand_total = subtotal - discount_amount + shipping_amount + tax_amount

    return {
        "cart_id": cart.id,
        "items": checkout_items,
        "shipping_methods": shipping_methods,
        "selected_shipping_method_id": (
            selected_shipping_method.id if selected_shipping_method else None
        ),
        "subtotal": subtotal,
        "discount_amount": discount_amount,
        "shipping_amount": shipping_amount,
        "tax_amount": tax_amount,
        "grand_total": grand_total,
    }
