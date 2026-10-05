from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.inventory.models import InventoryReservation
from apps.inventory.services import set_reservation_expiry
from apps.orders.models import Order

from .midtrans import MidtransClient
from .models import Payment


@transaction.atomic
def create_payment(*, order, payment_method):
    order = (
        Order.objects.select_for_update()
        .select_related("user")
        .prefetch_related(
            "items",
            "addresses",
        )
        .get(pk=order.pk)
    )

    if order.status != Order.Status.PENDING:
        raise ValidationError({"order": ("Payment can only be created " "for a pending order.")})

    if hasattr(order, "payment"):
        raise ValidationError({"payment": ("Payment already exists " "for this order.")})

    if order.total_amount <= 0:
        raise ValidationError({"amount": ("Payment amount must be greater than zero.")})

    # ---------------------------------------------------------
    # Validate active inventory reservations BEFORE
    # creating the Midtrans transaction.
    # ---------------------------------------------------------
    reservations = list(
        InventoryReservation.objects.select_for_update()
        .filter(
            order=order,
            status=InventoryReservation.Status.ACTIVE,
        )
        .order_by("inventory_id")
    )

    if not reservations:
        raise ValidationError(
            {
                "inventory": (
                    "No active inventory reservations found. "
                    "Create a new order before creating a payment."
                )
            }
        )

    now = timezone.now()

    if any(reservation.expires_at <= now for reservation in reservations):
        raise ValidationError(
            {
                "inventory": (
                    "Inventory reservation has expired. "
                    "Create a new order before creating a payment."
                )
            }
        )

    shipping_address = order.addresses.filter(
        address_type="SHIPPING",
    ).first()

    if not shipping_address:
        raise ValidationError({"address": ("Shipping address not found " "for this order.")})

    customer_details = _build_customer_details(
        order=order,
        shipping_address=shipping_address,
    )

    item_details = _build_item_details(
        order=order,
    )

    metadata = {
        "order_id": order.id,
        "order_number": order.order_number,
        "user_id": order.user_id,
        "shipping_method": order.shipping_method_code,
    }

    payment = Payment.objects.create(
        order=order,
        provider=Payment.Provider.MIDTRANS,
        payment_method=payment_method,
        status=Payment.Status.PENDING,
        amount=order.total_amount,
        currency=order.currency,
    )

    client = MidtransClient()

    response = client.create_transaction(
        order_id=order.order_number,
        amount=order.total_amount,
        payment_method=payment_method,
        customer_details=customer_details,
        item_details=item_details,
        custom_field1=order.order_number,
        custom_field2=order.shipping_method_code,
        custom_field3=f"user:{order.user_id}",
        metadata=metadata,
    )

    transaction_id = response.get("transaction_id")

    if not transaction_id:
        raise ValidationError({"payment": ("Midtrans did not return " "a transaction ID.")})

    payment.transaction_id = transaction_id

    _update_payment_from_charge_response(
        payment=payment,
        response=response,
    )

    # ---------------------------------------------------------
    # Midtrans is the source of truth for payment expiry.
    #
    # _update_payment_from_charge_response() already reads
    # expiry_time when it is present in the Charge response.
    # If it is not present, fetch the transaction status.
    # ---------------------------------------------------------
    if not payment.expires_at:
        status_response = client.get_transaction_status(order.order_number)

        expiry_time = status_response.get("expiry_time")

        if expiry_time:
            payment.expires_at = _parse_midtrans_datetime(expiry_time)

    if not payment.expires_at:
        raise ValidationError({"payment": ("Unable to determine Midtrans " "transaction expiry.")})

    # ---------------------------------------------------------
    # Synchronize every active inventory reservation with
    # the actual Midtrans payment expiry.
    # ---------------------------------------------------------
    for reservation in reservations:
        set_reservation_expiry(
            reservation=reservation,
            expires_at=payment.expires_at,
        )

    payment.save()

    return payment


def _build_customer_details(*, order, shipping_address):
    user = order.user

    first_name = shipping_address.recipient_name or user.first_name or "Customer"

    return {
        "first_name": first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": (shipping_address.phone_number or user.phone_number),
        "shipping_address": {
            "first_name": first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": (shipping_address.phone_number or user.phone_number),
            "address": shipping_address.address_line,
            "city": shipping_address.city,
            "postal_code": shipping_address.postal_code,
            "country_code": "IDN",
        },
    }


def _build_item_details(*, order):
    item_details = []

    for item in order.items.all():
        item_details.append(
            {
                "id": item.sku_snapshot,
                "price": int(item.unit_price),
                "quantity": item.quantity,
                "name": item.product_name_snapshot[:50],
            }
        )

    if order.shipping_amount > 0:
        item_details.append(
            {
                "id": "SHIPPING",
                "price": int(order.shipping_amount),
                "quantity": 1,
                "name": (f"{order.shipping_courier} " f"{order.shipping_service}")[:50],
            }
        )

    if order.discount_amount > 0:
        item_details.append(
            {
                "id": "DISCOUNT",
                "price": -int(order.discount_amount),
                "quantity": 1,
                "name": "Discount",
            }
        )

    if order.tax_amount > 0:
        item_details.append(
            {
                "id": "TAX",
                "price": int(order.tax_amount),
                "quantity": 1,
                "name": "Tax",
            }
        )

    return item_details


def _update_payment_from_charge_response(
    *,
    payment,
    response,
):
    payment_method = payment.payment_method

    if payment_method in {
        Payment.PaymentMethod.BCA_VA,
        Payment.PaymentMethod.BNI_VA,
        Payment.PaymentMethod.BRI_VA,
        Payment.PaymentMethod.PERMATA_VA,
        Payment.PaymentMethod.CIMB_VA,
    }:
        va_numbers = response.get("va_numbers") or []

        if va_numbers:
            va_data = va_numbers[0]

            payment.bank = va_data.get(
                "bank",
                "",
            )

            payment.va_number = va_data.get(
                "va_number",
                "",
            )

        # Permata can return the VA number
        # in a different field.
        if not payment.va_number:
            payment.va_number = response.get(
                "permata_va_number",
                "",
            )

            if payment.va_number:
                payment.bank = "permata"

    elif payment_method == Payment.PaymentMethod.MANDIRI:
        payment.bill_key = response.get(
            "bill_key",
            "",
        )

        payment.biller_code = response.get(
            "biller_code",
            "",
        )

    elif payment_method in {
        Payment.PaymentMethod.GOPAY,
        Payment.PaymentMethod.SHOPEEPAY,
        Payment.PaymentMethod.QRIS,
    }:
        payment.payment_url = _get_action_url(response.get("actions"))

        qr_string = response.get("qr_string")

        if qr_string:
            payment.qr_string = qr_string

    expiry_time = response.get("expiry_time")

    if expiry_time:
        payment.expires_at = _parse_midtrans_datetime(expiry_time)


def _get_action_url(actions):
    if not actions:
        return ""

    preferred_actions = {
        "generate-qr-code",
        "generate-qr-code-v2",
        "deeplink-redirect",
        "deeplink-redirect-v2",
    }

    for action in actions:
        if action.get("name") in preferred_actions:
            return action.get("url", "")

    for action in actions:
        url = action.get("url")

        if url:
            return url

    return ""


def _parse_midtrans_datetime(value):
    from datetime import datetime

    formats = (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S",
    )

    for date_format in formats:
        try:
            parsed = datetime.strptime(
                value,
                date_format,
            )

            if parsed.tzinfo is None:
                parsed = timezone.make_aware(parsed)

            return parsed

        except ValueError:
            continue

    raise ValidationError({"expiry_time": ("Invalid Midtrans expiry_time format.")})
