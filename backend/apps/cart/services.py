from django.core.exceptions import ValidationError
from django.db import transaction

from apps.inventory.models import Inventory

from .models import Cart, CartItem


def _get_locked_inventory(*, variant):
    return Inventory.objects.select_for_update().filter(variant=variant).first()


def _get_variant_available_stock(*, variant):
    inventory = _get_locked_inventory(
        variant=variant,
    )

    if inventory is None:
        return 0

    return inventory.stock_on_hand - inventory.reserved


@transaction.atomic
def get_or_create_active_cart(*, user):
    """
    Get the user's active cart or create one if it does not exist.
    """

    user_model = type(user)

    user = user_model.objects.select_for_update().get(pk=user.pk)

    cart, _ = Cart.objects.get_or_create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    return cart


@transaction.atomic
def add_item(*, user, variant, quantity):
    if quantity <= 0:
        raise ValidationError({"quantity": ("Quantity must be greater than zero.")})

    if not variant.is_active:
        raise ValidationError({"variant": ("This product variant is no longer available.")})

    cart = get_or_create_active_cart(
        user=user,
    )

    item = (
        CartItem.objects.select_for_update()
        .filter(
            cart=cart,
            variant=variant,
        )
        .first()
    )

    current_quantity = item.quantity if item else 0
    requested_quantity = current_quantity + quantity

    available_stock = _get_variant_available_stock(
        variant=variant,
    )

    if requested_quantity > available_stock:
        raise ValidationError(
            {
                "quantity": (
                    f"Insufficient stock. "
                    f"Available stock: {available_stock}. "
                    f"Current cart quantity: "
                    f"{current_quantity}."
                )
            }
        )

    if item is None:
        item = CartItem.objects.create(
            cart=cart,
            variant=variant,
            quantity=quantity,
        )
    else:
        item.quantity = requested_quantity
        item.save(
            update_fields=[
                "quantity",
                "updated_at",
            ]
        )

    return item


@transaction.atomic
def update_item_quantity(*, user, item_id, quantity):
    if quantity <= 0:
        raise ValidationError({"quantity": ("Quantity must be greater than zero.")})

    item = (
        CartItem.objects.select_for_update()
        .select_related(
            "cart",
            "variant",
        )
        .get(
            id=item_id,
            cart__user=user,
            cart__status=Cart.Status.ACTIVE,
        )
    )

    if not item.variant.is_active:
        raise ValidationError({"variant": ("This product variant is no longer available.")})

    available_stock = _get_variant_available_stock(
        variant=item.variant,
    )

    if quantity > available_stock:
        raise ValidationError(
            {"quantity": (f"Insufficient stock. " f"Available stock: {available_stock}.")}
        )

    item.quantity = quantity

    item.save(
        update_fields=[
            "quantity",
            "updated_at",
        ]
    )

    return item


@transaction.atomic
def remove_item(*, user, item_id):
    item = CartItem.objects.select_for_update().get(
        id=item_id,
        cart__user=user,
        cart__status=Cart.Status.ACTIVE,
    )

    item.delete()


@transaction.atomic
def clear_cart(*, user):
    cart = Cart.objects.filter(
        user=user,
        status=Cart.Status.ACTIVE,
    ).first()

    if cart is None:
        return

    cart.items.all().delete()
