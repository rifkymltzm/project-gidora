from rest_framework.routers import DefaultRouter

from .admin_views import (
    AdminCategoryViewSet,
    AdminColorViewSet,
    AdminProductColorViewSet,
    AdminProductImageViewSet,
    AdminProductVariantViewSet,
    AdminProductViewSet,
    AdminSizeTypeViewSet,
    AdminSizeViewSet,
)

router = DefaultRouter()

router.register(
    "products",
    AdminProductViewSet,
    basename="admin-product",
)

router.register(
    "product-colors",
    AdminProductColorViewSet,
    basename="admin-product-color",
)

router.register(
    "variants",
    AdminProductVariantViewSet,
    basename="admin-product-variant",
)

router.register(
    "images",
    AdminProductImageViewSet,
    basename="admin-product-image",
)

router.register(
    "categories",
    AdminCategoryViewSet,
    basename="admin-category",
)

router.register(
    "colors",
    AdminColorViewSet,
    basename="admin-color",
)

router.register(
    "sizes",
    AdminSizeViewSet,
    basename="admin-size",
)

router.register(
    "size-types",
    AdminSizeTypeViewSet,
    basename="admin-size-type",
)


urlpatterns = router.urls
