from datetime import timedelta
from decimal import Decimal

import pytest
from django.utils import timezone

from apps.accounts.models import User
from apps.orders.models import Order
from apps.payments.models import Payment


@pytest.fixture
def order(db):
    user = User.objects.create_user(
        email="payment-model@test.com",
        password="password123",
        first_name="Payment",
        last_name="Tester",
    )

    return Order.objects.create(
        user=user,
        status=Order.Status.PENDING,
        subtotal=Decimal("100000"),
        discount_amount=Decimal("0"),
        shipping_amount=Decimal("0"),
        tax_amount=Decimal("0"),
        total_amount=Decimal("100000"),
        currency="IDR",
    )


@pytest.mark.django_db
def test_payment_defaults_to_pending(order):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=Decimal("100000"),
    )

    assert payment.status == Payment.Status.PENDING
    assert payment.provider == Payment.Provider.MIDTRANS
    assert payment.currency == "IDR"


@pytest.mark.django_db
def test_payment_string_representation(order):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=Decimal("100000"),
    )

    assert str(payment) == (f"{order.order_number} - {Payment.Status.PENDING}")


@pytest.mark.django_db
def test_payment_order_is_one_to_one(order):
    Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=Decimal("100000"),
    )

    with pytest.raises(Exception):
        Payment.objects.create(
            order=order,
            payment_method=Payment.PaymentMethod.BNI_VA,
            amount=Decimal("100000"),
        )


@pytest.mark.django_db
def test_payment_can_store_virtual_account_data(order):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=Decimal("100000"),
        bank="bca",
        va_number="1234567890",
    )

    payment.refresh_from_db()

    assert payment.bank == "bca"
    assert payment.va_number == "1234567890"


@pytest.mark.django_db
def test_payment_can_store_mandiri_bill_data(order):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.MANDIRI,
        amount=Decimal("100000"),
        bill_key="123456789",
        biller_code="70012",
    )

    payment.refresh_from_db()

    assert payment.bill_key == "123456789"
    assert payment.biller_code == "70012"


@pytest.mark.django_db
def test_payment_can_store_qris_data(order):
    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.QRIS,
        amount=Decimal("100000"),
        qr_string="000201010212...",
        payment_url="https://example.com/payment",
    )

    payment.refresh_from_db()

    assert payment.qr_string == "000201010212..."
    assert payment.payment_url == "https://example.com/payment"


@pytest.mark.django_db
def test_payment_can_store_expiry_and_paid_at(order):
    paid_at = timezone.now()
    expires_at = paid_at + timedelta(hours=1)

    payment = Payment.objects.create(
        order=order,
        payment_method=Payment.PaymentMethod.BCA_VA,
        amount=Decimal("100000"),
        expires_at=expires_at,
        paid_at=paid_at,
        status=Payment.Status.PAID,
    )

    payment.refresh_from_db()

    assert payment.status == Payment.Status.PAID
    assert payment.expires_at == expires_at
    assert payment.paid_at == paid_at
