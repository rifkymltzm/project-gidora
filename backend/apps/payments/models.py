from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        FAILED = "FAILED", "Failed"
        EXPIRED = "EXPIRED", "Expired"
        CANCELLED = "CANCELLED", "Cancelled"

    class Provider(models.TextChoices):
        MIDTRANS = "MIDTRANS", "Midtrans"

    class PaymentMethod(models.TextChoices):
        BCA_VA = "BCA_VA", "BCA Virtual Account"
        BNI_VA = "BNI_VA", "BNI Virtual Account"
        BRI_VA = "BRI_VA", "BRI Virtual Account"
        MANDIRI = "MANDIRI", "Mandiri Bill"
        PERMATA_VA = "PERMATA_VA", "Permata Virtual Account"
        CIMB_VA = "CIMB_VA", "CIMB Virtual Account"
        GOPAY = "GOPAY", "GoPay"
        SHOPEEPAY = "SHOPEEPAY", "ShopeePay"
        QRIS = "QRIS", "QRIS"

    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.PROTECT,
        related_name="payment",
    )

    provider = models.CharField(
        max_length=20,
        choices=Provider.choices,
        default=Provider.MIDTRANS,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    transaction_id = models.CharField(
        max_length=100,
        blank=True,
    )

    amount = models.DecimalField(
        max_digits=14,
        decimal_places=0,
    )

    currency = models.CharField(
        max_length=3,
        default="IDR",
    )

    # Bank transfer / Virtual Account
    bank = models.CharField(
        max_length=20,
        blank=True,
    )

    va_number = models.CharField(
        max_length=50,
        blank=True,
    )

    # Mandiri Bill
    bill_key = models.CharField(
        max_length=50,
        blank=True,
    )

    biller_code = models.CharField(
        max_length=50,
        blank=True,
    )

    # QRIS
    qr_string = models.TextField(
        blank=True,
    )

    # GoPay / ShopeePay / QR image / redirect
    payment_url = models.URLField(
        max_length=2048,
        blank=True,
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"
