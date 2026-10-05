from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.inventory.models import InventoryReservation
from apps.inventory.services import (
    confirm_reservation,
    release_reservation,
)
from apps.shipping.services import create_shipment

from .models import Payment

SUCCESS_STATUSES = {
    "settlement",
    "capture",
}

FAILED_STATUSES = {
    "deny",
    "failure",
    "cancel",
    "expire",
}

TERMINAL_PAYMENT_STATUSES = {
    Payment.Status.PAID,
    Payment.Status.FAILED,
    Payment.Status.EXPIRED,
    Payment.Status.CANCELLED,
}


@transaction.atomic
def process_payment_status(*, payload):
    """
    Process a Midtrans transaction status.

    This function is intentionally shared by:
    - Midtrans HTTP Notification
    - Manual GET Status fallback
    """

    order_number = payload.get("order_id")

    if not order_number:
        raise ValidationError({"order_id": ("Midtrans order_id is required.")})

    payment = (
        Payment.objects.select_for_update()
        .select_related("order")
        .get(
            order__order_number=order_number,
        )
    )

    _validate_notification_amount(
        payment=payment,
        payload=payload,
    )

    _update_payment_metadata(
        payment=payment,
        payload=payload,
    )

    # Payment yang sudah mencapai status final tidak boleh
    # berubah kembali karena notification / GET Status yang terlambat.
    if payment.status in TERMINAL_PAYMENT_STATUSES:
        payment.save()
        return payment

    transaction_status = payload.get(
        "transaction_status",
    )

    if transaction_status in SUCCESS_STATUSES:
        _process_success(
            payment=payment,
            payload=payload,
        )

    elif transaction_status in FAILED_STATUSES:
        _process_failure(
            payment=payment,
            transaction_status=transaction_status,
        )

    # Status seperti "pending" tidak mengubah state bisnis.
    payment.save()

    return payment


@transaction.atomic
def process_payment_notification(*, payload):
    """
    Backward-compatible wrapper for webhook processing.

    Signature verification is performed by the view before
    this function is called.
    """

    return process_payment_status(
        payload=payload,
    )


def _validate_notification_amount(*, payment, payload):
    gross_amount = payload.get("gross_amount")

    if gross_amount is None:
        raise ValidationError({"gross_amount": ("Midtrans gross_amount is required.")})

    try:
        gross_amount = Decimal(
            str(gross_amount),
        )
    except Exception as exc:
        raise ValidationError({"gross_amount": ("Invalid Midtrans gross_amount.")}) from exc

    if gross_amount != payment.amount:
        raise ValidationError(
            {"gross_amount": ("Midtrans gross_amount does not match " "the payment amount.")}
        )

    currency = payload.get("currency")

    if currency and currency != payment.currency:
        raise ValidationError(
            {"currency": ("Midtrans currency does not match " "the payment currency.")}
        )


def _update_payment_metadata(*, payment, payload):
    transaction_id = payload.get("transaction_id")

    if transaction_id:
        payment.transaction_id = transaction_id

    expiry_time = payload.get("expiry_time")

    if expiry_time:
        payment.expires_at = _parse_midtrans_datetime(
            expiry_time,
        )

    va_numbers = payload.get("va_numbers") or []

    if va_numbers:
        va_number_data = va_numbers[0]

        payment.bank = va_number_data.get(
            "bank",
            "",
        )
        payment.va_number = va_number_data.get(
            "va_number",
            "",
        )

    bill_key = payload.get("bill_key")

    if bill_key:
        payment.bill_key = bill_key

    biller_code = payload.get("biller_code")

    if biller_code:
        payment.biller_code = biller_code

    qr_string = payload.get("qr_string")

    if qr_string:
        payment.qr_string = qr_string


def _process_success(*, payment, payload):
    fraud_status = payload.get("fraud_status")

    if fraud_status and fraud_status != "accept":
        raise ValidationError({"fraud_status": ("Midtrans fraud status is not accepted.")})

    order = payment.order

    reservations = list(
        InventoryReservation.objects.select_for_update().filter(
            order=order,
            status=InventoryReservation.Status.ACTIVE,
        )
    )

    if not reservations:
        raise ValidationError(
            {"inventory": ("No active inventory reservations found " "for this order.")}
        )

    for reservation in reservations:
        confirmed_reservation = confirm_reservation(
            reservation=reservation,
        )

        if confirmed_reservation.status != InventoryReservation.Status.CONFIRMED:
            raise ValidationError(
                {"inventory": ("One or more inventory reservations " "could not be confirmed.")}
            )

    payment.status = Payment.Status.PAID
    payment.paid_at = timezone.now()

    if order.status == order.Status.PENDING:
        order.status = order.Status.CONFIRMED
        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

    create_shipment(
        order=order,
    )


def _process_failure(
    *,
    payment,
    transaction_status,
):
    if transaction_status == "expire":
        payment.status = Payment.Status.EXPIRED

    elif transaction_status == "cancel":
        payment.status = Payment.Status.CANCELLED

    else:
        payment.status = Payment.Status.FAILED

    order = payment.order

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

    if order.status == order.Status.PENDING:
        order.status = order.Status.CANCELLED
        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )


def _parse_midtrans_datetime(value):
    from datetime import datetime

    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S",
    ]

    for date_format in formats:
        try:
            parsed = datetime.strptime(
                value,
                date_format,
            )

            if parsed.tzinfo is None:
                parsed = timezone.make_aware(
                    parsed,
                )

            return parsed

        except ValueError:
            continue

    raise ValidationError({"expiry_time": ("Invalid Midtrans expiry_time format.")})
