from django.urls import path

from .views import (
    ShipmentDetailView,
    ShippingMethodListView,
)

urlpatterns = [
    path(
        "methods/",
        ShippingMethodListView.as_view(),
        name="shipping-method-list",
    ),
    path(
        "<str:order_number>/",
        ShipmentDetailView.as_view(),
        name="shipment-detail",
    ),
]
