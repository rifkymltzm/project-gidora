import pytest

from apps.accounts.models import Address, User


@pytest.mark.django_db
class TestUserModel:

    def test_create_user_normalizes_email(self):
        user = User.objects.create_user(
            email="  CUSTOMER@GIDORA.COM  ",
            password="password123",
        )

        assert user.email == "customer@gidora.com"

    def test_create_user_hashes_password(self):
        user = User.objects.create_user(
            email="customer@gidora.com",
            password="password123",
        )

        assert user.password != "password123"
        assert user.check_password("password123")

    def test_create_user_requires_email(self):
        with pytest.raises(ValueError, match="Email is required."):
            User.objects.create_user(
                email="",
                password="password123",
            )

    def test_create_user_defaults_to_active_non_staff_user(self):
        user = User.objects.create_user(
            email="customer@gidora.com",
            password="password123",
        )

        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_superuser_sets_staff_and_superuser_flags(self):
        user = User.objects.create_superuser(
            email="admin@gidora.com",
            password="password123",
        )

        assert user.is_active is True
        assert user.is_staff is True
        assert user.is_superuser is True

    def test_create_superuser_rejects_non_staff(self):
        with pytest.raises(
            ValueError,
            match="Superuser must have is_staff=True.",
        ):
            User.objects.create_superuser(
                email="admin@gidora.com",
                password="password123",
                is_staff=False,
            )

    def test_create_superuser_rejects_non_superuser(self):
        with pytest.raises(
            ValueError,
            match="Superuser must have is_superuser=True.",
        ):
            User.objects.create_superuser(
                email="admin@gidora.com",
                password="password123",
                is_superuser=False,
            )

    def test_user_string_representation(self):
        user = User.objects.create_user(
            email="customer@gidora.com",
            password="password123",
        )

        assert str(user) == "customer@gidora.com"


@pytest.mark.django_db
class TestAddressModel:

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

    def test_address_string_representation(self, address):
        assert str(address) == "Home - Gidora Customer"

    def test_address_belongs_to_user(self, address, user):
        assert address.user == user

    def test_address_defaults_country_to_indonesia(self, user):
        address = Address.objects.create(
            user=user,
            label="Office",
            recipient_name="Gidora Customer",
            phone_number="08123456789",
            address_line="Jl. Office No. 1",
            sub_district="Jatirasa",
            district="Jatiasih",
            city="Bekasi",
            province="Jawa Barat",
            postal_code="17424",
        )

        assert address.country == "Indonesia"

    def test_deleting_user_deletes_addresses(self, address, user):
        address_id = address.pk

        user.delete()

        assert not Address.objects.filter(
            pk=address_id,
        ).exists()
