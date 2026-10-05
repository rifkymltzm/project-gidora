import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Address, User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="customer@gidora.com",
        password="password123",
        first_name="Customer",
        last_name="Gidora",
    )


@pytest.fixture
def another_user(db):
    return User.objects.create_user(
        email="another@gidora.com",
        password="password123",
        first_name="Another",
        last_name="Customer",
    )


@pytest.fixture
def staff(db):
    user = User.objects.create_user(
        email="staff@gidora.com",
        password="password123",
        first_name="Staff",
        last_name="Gidora",
    )

    user.is_staff = True
    user.save(update_fields=["is_staff"])

    return user


@pytest.fixture
def superuser(db):
    return User.objects.create_superuser(
        email="admin@gidora.com",
        password="password123",
        first_name="Admin",
        last_name="Gidora",
    )


@pytest.fixture
def address(user):
    return Address.objects.create(
        user=user,
        label="Home",
        recipient_name="Customer Gidora",
        phone_number="08123456789",
        address_line="Jl. Gidora No. 1",
        sub_district="Jatirasa",
        district="Jatiasih",
        city="Bekasi",
        province="Jawa Barat",
        postal_code="17424",
        country="Indonesia",
    )


@pytest.fixture
def another_address(another_user):
    return Address.objects.create(
        user=another_user,
        label="Home",
        recipient_name="Another Customer",
        phone_number="08123456780",
        address_line="Jl. Another No. 1",
        sub_district="Kayuringin",
        district="Bekasi Selatan",
        city="Bekasi",
        province="Jawa Barat",
        postal_code="17148",
        country="Indonesia",
    )


@pytest.mark.django_db
class TestUserAddressAPI:

    def test_address_list_requires_authentication(
        self,
        api_client,
    ):
        response = api_client.get(
            reverse("address-list"),
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_address_list_returns_only_current_user_addresses(
        self,
        api_client,
        user,
        address,
        another_address,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.get(
            reverse("address-list"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

        assert response.data["results"][0]["id"] == address.id

    def test_address_create_assigns_current_user(
        self,
        api_client,
        user,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.post(
            reverse("address-list"),
            {
                "label": "Office",
                "recipient_name": "Customer Office",
                "phone_number": "08123456789",
                "address_line": "Jl. Office No. 10",
                "sub_district": "Jatirasa",
                "district": "Jatiasih",
                "city": "Bekasi",
                "province": "Jawa Barat",
                "postal_code": "17424",
                "country": "Indonesia",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        created_address = Address.objects.get(
            label="Office",
        )

        assert created_address.user == user

    def test_address_detail_returns_own_address(
        self,
        api_client,
        user,
        address,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.get(
            reverse(
                "address-detail",
                kwargs={"pk": address.pk},
            )
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == address.id
        assert response.data["label"] == address.label

    def test_address_detail_cannot_access_another_users_address(
        self,
        api_client,
        user,
        another_address,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.get(
            reverse(
                "address-detail",
                kwargs={"pk": another_address.pk},
            )
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_address_update_updates_own_address(
        self,
        api_client,
        user,
        address,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.patch(
            reverse(
                "address-detail",
                kwargs={"pk": address.pk},
            ),
            {
                "label": "Updated Home",
                "city": "Jakarta Selatan",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        address.refresh_from_db()

        assert address.label == "Updated Home"
        assert address.city == "Jakarta Selatan"

    def test_address_update_cannot_modify_another_users_address(
        self,
        api_client,
        user,
        another_address,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.patch(
            reverse(
                "address-detail",
                kwargs={"pk": another_address.pk},
            ),
            {
                "label": "Hacked Address",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

        another_address.refresh_from_db()

        assert another_address.label == "Home"

    def test_address_delete_deletes_own_address(
        self,
        api_client,
        user,
        address,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.delete(
            reverse(
                "address-detail",
                kwargs={"pk": address.pk},
            )
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Address.objects.filter(
            pk=address.pk,
        ).exists()

    def test_address_delete_cannot_delete_another_users_address(
        self,
        api_client,
        user,
        another_address,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.delete(
            reverse(
                "address-detail",
                kwargs={"pk": another_address.pk},
            )
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

        assert Address.objects.filter(
            pk=another_address.pk,
        ).exists()


@pytest.mark.django_db
class TestAdminAccountsAPI:

    def test_admin_accounts_requires_staff(
        self,
        api_client,
    ):
        response = api_client.get(
            reverse("admin-account-user-list"),
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_admin_accounts_rejects_normal_user(
        self,
        api_client,
        user,
    ):
        api_client.force_authenticate(user=user)

        response = api_client.get(
            reverse("admin-account-user-list"),
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_accounts_allows_staff(
        self,
        api_client,
        staff,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse("admin-account-user-list"),
        )

        assert response.status_code == status.HTTP_200_OK

    def test_admin_accounts_allows_superuser(
        self,
        api_client,
        superuser,
    ):
        api_client.force_authenticate(user=superuser)

        response = api_client.get(
            reverse("admin-account-user-list"),
        )

        assert response.status_code == status.HTTP_200_OK

    def test_admin_accounts_lists_customers_only(
        self,
        api_client,
        staff,
        user,
        another_user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse("admin-account-user-list"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2

        emails = {
            item["email"]
            for item in response.data["results"]
        }

        assert emails == {
            user.email,
            another_user.email,
        }

    def test_admin_accounts_excludes_staff(
        self,
        api_client,
        staff,
        user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse("admin-account-user-list"),
        )

        assert response.status_code == status.HTTP_200_OK

        emails = {
            item["email"]
            for item in response.data["results"]
        }

        assert staff.email not in emails
        assert user.email in emails

    def test_admin_accounts_excludes_superuser(
        self,
        api_client,
        staff,
        user,
        superuser,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse("admin-account-user-list"),
        )

        assert response.status_code == status.HTTP_200_OK

        emails = {
            item["email"]
            for item in response.data["results"]
        }

        assert superuser.email not in emails
        assert user.email in emails

    def test_admin_accounts_retrieve_customer(
        self,
        api_client,
        staff,
        user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse(
                "admin-account-user-detail",
                kwargs={"pk": user.pk},
            )
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == user.id
        assert response.data["email"] == user.email

    def test_admin_accounts_cannot_retrieve_staff(
        self,
        api_client,
        staff,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse(
                "admin-account-user-detail",
                kwargs={"pk": staff.pk},
            )
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_admin_accounts_cannot_retrieve_superuser(
        self,
        api_client,
        staff,
        superuser,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse(
                "admin-account-user-detail",
                kwargs={"pk": superuser.pk},
            )
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_admin_accounts_can_update_customer(
        self,
        api_client,
        staff,
        user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.patch(
            reverse(
                "admin-account-user-detail",
                kwargs={"pk": user.pk},
            ),
            {
                "first_name": "Updated",
                "last_name": "Customer",
                "phone_number": "08999999999",
                "is_active": False,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        user.refresh_from_db()

        assert user.first_name == "Updated"
        assert user.last_name == "Customer"
        assert user.phone_number == "08999999999"
        assert user.is_active is False

    def test_admin_accounts_email_is_read_only(
        self,
        api_client,
        staff,
        user,
    ):
        original_email = user.email

        api_client.force_authenticate(user=staff)

        response = api_client.patch(
            reverse(
                "admin-account-user-detail",
                kwargs={"pk": user.pk},
            ),
            {
                "email": "changed@gidora.com",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        user.refresh_from_db()

        assert user.email == original_email

    def test_admin_accounts_does_not_expose_privilege_fields(
        self,
        api_client,
        staff,
        user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse(
                "admin-account-user-detail",
                kwargs={"pk": user.pk},
            )
        )

        assert response.status_code == status.HTTP_200_OK

        assert "is_staff" not in response.data
        assert "is_superuser" not in response.data

    def test_admin_accounts_cannot_create_user(
        self,
        api_client,
        staff,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.post(
            reverse("admin-account-user-list"),
            {
                "email": "new@gidora.com",
                "first_name": "New",
                "last_name": "Customer",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_admin_accounts_cannot_replace_user(
        self,
        api_client,
        staff,
        user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.put(
            reverse(
                "admin-account-user-detail",
                kwargs={"pk": user.pk},
            ),
            {
                "first_name": "Updated",
                "last_name": "Customer",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_admin_accounts_cannot_delete_user(
        self,
        api_client,
        staff,
        user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.delete(
            reverse(
                "admin-account-user-detail",
                kwargs={"pk": user.pk},
            )
        )

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        assert User.objects.filter(
            pk=user.pk,
        ).exists()

    def test_admin_accounts_searches_customers(
        self,
        api_client,
        staff,
        user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse("admin-account-user-list"),
            {
                "search": "Customer",
            },
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["email"] == user.email

    def test_admin_accounts_orders_by_created_at(
        self,
        api_client,
        staff,
        user,
        another_user,
    ):
        api_client.force_authenticate(user=staff)

        response = api_client.get(
            reverse("admin-account-user-list"),
            {
                "ordering": "created_at",
            },
        )

        assert response.status_code == status.HTTP_200_OK

        created_at_values = [
            item["created_at"]
            for item in response.data["results"]
        ]

        assert created_at_values == sorted(
            created_at_values,
        )
