from django.urls import path

from .views import (
    AdminOrderDetailView,
    AdminOrderListView,
)

urlpatterns = [
    path(
        "",
        AdminOrderListView.as_view(),
        name="admin-order-list",
    ),
    path(
        "<str:order_number>/",
        AdminOrderDetailView.as_view(),
        name="admin-order-detail",
    ),
]
