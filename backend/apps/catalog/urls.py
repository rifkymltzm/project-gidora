from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ColorViewSet,
    ProductViewSet,
    SizeTypeViewSet,
    SizeViewSet,
)

router = DefaultRouter()

router.register(
    "products",
    ProductViewSet,
    basename="product",
)

router.register(
    "categories",
    CategoryViewSet,
    basename="category",
)

router.register(
    "size-types",
    SizeTypeViewSet,
    basename="size-type",
)

router.register(
    "sizes",
    SizeViewSet,
    basename="size",
)

router.register(
    "colors",
    ColorViewSet,
    basename="color",
)

urlpatterns = router.urls
