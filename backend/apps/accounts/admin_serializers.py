from rest_framework import serializers

from .models import User


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "is_active",
            "created_at",
            "last_login",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "email",
            "created_at",
            "last_login",
            "updated_at",
        ]
