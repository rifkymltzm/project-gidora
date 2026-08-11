from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    # Endpoint Djoser (registrasi & manajemen user)
    path('api/v1/auth/', include('djoser.urls')),
    # Endpoint Djoser login (Generate & Refresh JWT Token)
    path('api/v1/auth/', include('djoser.urls.jwt')),
]
