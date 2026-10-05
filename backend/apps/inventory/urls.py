from rest_framework.routers import DefaultRouter

from .views import (
    InventoryReservationViewSet,
    InventoryViewSet,
)

router = DefaultRouter()

router.register(
    "",
    InventoryViewSet,
    basename="admin-inventory",
)

router.register(
    "reservations",
    InventoryReservationViewSet,
    basename="admin-inventory-reservation",
)

urlpatterns = router.urls
