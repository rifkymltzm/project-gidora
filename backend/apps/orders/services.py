from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.cart.models import Cart
from apps.inventory.models import InventoryReservation
from apps.inventory.services import release_reservation, reserve_stock
from apps.shipping.models import ShippingMethod

from .models import Order, OrderAddress, OrderItem

RESERVATION_DURATION = timedelta(minutes=30)


@transaction.atomic
def create_order(
    *,
    user,
    shipping_address,
    shipping_method,
):
    """
    Create a pending order from the user's active cart.

    shipping_address is already normalized by the serializer and
    can come from either a saved account address or a new checkout
    address.
    """

    reservation_expires_at = timezone.now() + RESERVATION_DURATION

    shipping_method = (
        ShippingMethod.objects.select_for_update()
        .filter(
            id=shipping_method.id,
            is_active=True,
        )
        .first()
    )

    if not shipping_method:
        raise ValidationError({"shipping_method": ("Shipping method not found or inactive.")})

    cart = (
        Cart.objects.select_for_update()
        .prefetch_related(
            "items__variant__product_color__product",
            "items__variant__product_color__color",
            "items__variant__size",
        )
        .filter(
            user=user,
            status=Cart.Status.ACTIVE,
        )
        .first()
    )

    if not cart:
        raise ValidationError({"cart": "Active cart not found."})

    items = sorted(
        cart.items.all(),
        key=lambda item: item.variant_id,
    )

    if not items:
        raise ValidationError({"cart": "Cart is empty."})

    subtotal = Decimal("0")
    order_items = []

    for item in items:
        variant = item.variant

        if not variant.is_active:
            raise ValidationError(
                {"cart": (f"Product variant '{variant.sku}' " "is no longer available.")}
            )

        item_subtotal = variant.price * item.quantity
        subtotal += item_subtotal

        order_items.append(
            {
                "item": item,
                "variant": variant,
                "subtotal": item_subtotal,
            }
        )

    discount_amount = Decimal("0")
    tax_amount = Decimal("0")
    shipping_amount = shipping_method.price

    total_amount = subtotal - discount_amount + shipping_amount + tax_amount

    order = Order.objects.create(
        user=user,
        status=Order.Status.PENDING,
        subtotal=subtotal,
        discount_amount=discount_amount,
        shipping_amount=shipping_amount,
        shipping_method_code=shipping_method.code,
        shipping_courier=shipping_method.courier,
        shipping_service=shipping_method.service,
        tax_amount=tax_amount,
        total_amount=total_amount,
        currency="IDR",
    )

    OrderAddress.objects.create(
        order=order,
        address_type=OrderAddress.AddressType.SHIPPING,
        **shipping_address,
    )

    for data in order_items:
        item = data["item"]
        variant = data["variant"]

        variant_snapshot = f"{variant.product_color.color.name} / " f"{variant.size.name}"

        OrderItem.objects.create(
            order=order,
            product_variant=variant,
            product_name_snapshot=(variant.product_color.product.name),
            sku_snapshot=variant.sku,
            variant_snapshot=variant_snapshot,
            unit_price=variant.price,
            quantity=item.quantity,
            subtotal=data["subtotal"],
        )

        reserve_stock(
            order=order,
            variant=variant,
            quantity=item.quantity,
            expires_at=reservation_expires_at,
        )

    cart.status = Cart.Status.CONVERTED
    cart.save(
        update_fields=[
            "status",
            "updated_at",
        ],
    )

    return order


@transaction.atomic
def cancel_order(*, order):
    """
    Cancel a pending order before payment is created.

    Active inventory reservations are released.
    """

    order = Order.objects.select_for_update().get(pk=order.pk)

    if order.status != Order.Status.PENDING:
        raise ValidationError({"order": ("Only a pending order can be cancelled.")})

    if hasattr(order, "payment"):
        raise ValidationError(
            {"order": ("Order cannot be cancelled directly " "after payment has been created.")}
        )

    reservations = list(
        InventoryReservation.objects.select_for_update().filter(
            order=order,
            status=InventoryReservation.Status.ACTIVE,
        )
    )

    for reservation in reservations:
        release_reservation(
            reservation=reservation,
        )

    order.status = Order.Status.CANCELLED
    order.save(
        update_fields=[
            "status",
            "updated_at",
        ],
    )

    return order
