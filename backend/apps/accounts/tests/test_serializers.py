import pytest

from apps.accounts.models import Address, User
from apps.accounts.serializers import AddressSerializer
from apps.accounts.admin_serializers import AdminUserSerializer


@pytest.mark.django_db
class TestAddressSerializer:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            email="customer@gidora.com",
            password="password123",
        )

    @pytest.fixture
    def address(self, user):
        return Address.objects.create(
            user=user,
            label="Home",
            recipient_name="Gidora Customer",
            phone_number="08123456789",
            address_line="Jl. Gidora No. 1",
            sub_district="Jatirasa",
            district="Jatiasih",
            city="Bekasi",
            province="Jawa Barat",
            postal_code="17424",
            country="Indonesia",
        )

    def test_address_serializer_contains_expected_fields(self):
        serializer = AddressSerializer()

        assert set(serializer.fields) == {
            "id",
            "label",
            "recipient_name",
            "phone_number",
            "address_line",
            "sub_district",
            "district",
            "city",
            "province",
            "postal_code",
            "country",
            "created_at",
            "updated_at",
        }

    def test_address_serializer_marks_system_fields_read_only(self):
        serializer = AddressSerializer()

        assert serializer.fields["id"].read_only is True
        assert serializer.fields["created_at"].read_only is True
        assert serializer.fields["updated_at"].read_only is True

    def test_address_serializer_serializes_address(self, address):
        serializer = AddressSerializer(address)

        assert serializer.data["id"] == address.id
        assert serializer.data["label"] == "Home"
        assert serializer.data["recipient_name"] == "Gidora Customer"
        assert serializer.data["city"] == "Bekasi"
        assert serializer.data["country"] == "Indonesia"

    def test_address_serializer_validates_required_fields(self):
        serializer = AddressSerializer(
            data={
                "label": "Home",
            }
        )

        assert serializer.is_valid() is False

        assert "recipient_name" in serializer.errors
        assert "phone_number" in serializer.errors
        assert "address_line" in serializer.errors
        assert "city" in serializer.errors

    def test_address_serializer_accepts_valid_data(self):
        serializer = AddressSerializer(
            data={
                "label": "Office",
                "recipient_name": "Gidora Customer",
                "phone_number": "08123456789",
                "address_line": "Jl. Office No. 1",
                "sub_district": "Jatirasa",
                "district": "Jatiasih",
                "city": "Bekasi",
                "province": "Jawa Barat",
                "postal_code": "17424",
                "country": "Indonesia",
            }
        )

        assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
class TestAdminUserSerializer:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            email="customer@gidora.com",
            password="password123",
            first_name="Gidora",
            last_name="Customer",
            phone_number="08123456789",
        )

    def test_admin_user_serializer_contains_expected_fields(self):
        serializer = AdminUserSerializer()

        assert set(serializer.fields) == {
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "is_active",
            "created_at",
            "last_login",
            "updated_at",
        }

    def test_admin_user_serializer_marks_system_fields_read_only(self):
        serializer = AdminUserSerializer()

        assert serializer.fields["id"].read_only is True
        assert serializer.fields["email"].read_only is True
        assert serializer.fields["created_at"].read_only is True
        assert serializer.fields["last_login"].read_only is True
        assert serializer.fields["updated_at"].read_only is True

    def test_admin_user_serializer_does_not_expose_privilege_fields(self):
        serializer = AdminUserSerializer()

        assert "is_staff" not in serializer.fields
        assert "is_superuser" not in serializer.fields

    def test_admin_user_serializer_serializes_customer(self, user):
        serializer = AdminUserSerializer(user)

        assert serializer.data["id"] == user.id
        assert serializer.data["email"] == user.email
        assert serializer.data["first_name"] == "Gidora"
        assert serializer.data["last_name"] == "Customer"
        assert serializer.data["phone_number"] == "08123456789"
        assert serializer.data["is_active"] is True

    def test_admin_user_serializer_updates_allowed_fields(self, user):
        serializer = AdminUserSerializer(
            user,
            data={
                "first_name": "Updated",
                "last_name": "Customer",
                "phone_number": "08999999999",
                "is_active": False,
            },
            partial=True,
        )

        assert serializer.is_valid(), serializer.errors

        updated_user = serializer.save()

        assert updated_user.first_name == "Updated"
        assert updated_user.last_name == "Customer"
        assert updated_user.phone_number == "08999999999"
        assert updated_user.is_active is False

    def test_admin_user_serializer_cannot_update_email(self, user):
        original_email = user.email

        serializer = AdminUserSerializer(
            user,
            data={
                "email": "changed@gidora.com",
            },
            partial=True,
        )

        assert serializer.is_valid(), serializer.errors

        updated_user = serializer.save()

        assert updated_user.email == original_email
