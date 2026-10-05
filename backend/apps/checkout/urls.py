from django.urls import path

from .views import CheckoutPreviewView

urlpatterns = [
    path(
        "preview/",
        CheckoutPreviewView.as_view(),
        name="checkout-preview",
    ),
]
