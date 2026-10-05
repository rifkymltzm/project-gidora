from drf_spectacular.extensions import OpenApiViewExtension
from drf_spectacular.utils import extend_schema


def hide_djoser_user_management_endpoints(endpoints):
    """
    Hide Djoser's generic user-management endpoints from OpenAPI.

    GIDORA menggunakan custom Admin Accounts API untuk:
    - list customers
    - retrieve customer
    - update customer

    Djoser tetap digunakan untuk authentication dan
    self-service account endpoints.
    """

    hidden_endpoints = {
        ("/api/v1/auth/users/", "GET"),
        ("/api/v1/auth/users/{id}/", "GET"),
        ("/api/v1/auth/users/{id}/", "PUT"),
        ("/api/v1/auth/users/{id}/", "PATCH"),
        ("/api/v1/auth/users/{id}/", "DELETE"),
    }

    filtered_endpoints = []

    for path, path_regex, method, callback in endpoints:
        if (path, method.upper()) in hidden_endpoints:
            continue

        filtered_endpoints.append(
            (path, path_regex, method, callback)
        )

    return filtered_endpoints


class DjoserUserViewExtension(OpenApiViewExtension):
    target_class = "djoser.views.UserViewSet"

    def view_replacement(self):
        return extend_schema(
            tags=["Accounts"],
        )(self.target_class)


class JWTTokenObtainPairViewExtension(OpenApiViewExtension):
    target_class = "rest_framework_simplejwt.views.TokenObtainPairView"

    def view_replacement(self):
        return extend_schema(
            tags=["Authentication"],
        )(self.target_class)


class JWTTokenRefreshViewExtension(OpenApiViewExtension):
    target_class = "rest_framework_simplejwt.views.TokenRefreshView"

    def view_replacement(self):
        return extend_schema(
            tags=["Authentication"],
        )(self.target_class)


class JWTTokenVerifyViewExtension(OpenApiViewExtension):
    target_class = "rest_framework_simplejwt.views.TokenVerifyView"

    def view_replacement(self):
        return extend_schema(
            tags=["Authentication"],
        )(self.target_class)
