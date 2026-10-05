from django.urls import path

from .views import (
    ShipmentCancelView,
    ShipmentDeliverView,
    ShipmentProcessingView,
    ShipmentShipView,
)

urlpatterns = [
    path(
        "<str:order_number>/processing/",
        ShipmentProcessingView.as_view(),
        name="admin-shipment-processing",
    ),
    path(
        "<str:order_number>/ship/",
        ShipmentShipView.as_view(),
        name="admin-shipment-ship",
    ),
    path(
        "<str:order_number>/deliver/",
        ShipmentDeliverView.as_view(),
        name="admin-shipment-deliver",
    ),
    path(
        "<str:order_number>/cancel/",
        ShipmentCancelView.as_view(),
        name="admin-shipment-cancel",
    ),
]
