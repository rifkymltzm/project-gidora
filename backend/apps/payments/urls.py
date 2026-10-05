from django.urls import path

from .views import (
    MidtransPaymentNotificationView,
    PaymentCreateView,
    PaymentStatusSyncView,
)

urlpatterns = [
    path(
        "",
        PaymentCreateView.as_view(),
        name="payment-create",
    ),
    path(
        "notification/",
        MidtransPaymentNotificationView.as_view(),
        name="midtrans-payment-notification",
    ),
    path(
        "orders/<str:order_number>/sync/",
        PaymentStatusSyncView.as_view(),
        name="payment-status-sync",
    ),
]
