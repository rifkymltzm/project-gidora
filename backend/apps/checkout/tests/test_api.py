import pytest
from rest_framework import status
from rest_framework.reverse import reverse

from apps.cart.models import Cart
from apps.checkout.services import get_checkout_summary


def checkout_preview_url():
    return reverse("checkout-preview")


@pytest.mark.django_db
def test_unauthenticated_user_cannot_access_checkout_preview(
    api_client,
):
    response = api_client.get(
        checkout_preview_url(),
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_checkout_preview_returns_summary(
    authenticated_client,
    cart_item,
    inventory,
    shipping_method,
    second_shipping_method,
):
    response = authenticated_client.get(
        checkout_preview_url(),
    )

    assert response.status_code == status.HTTP_200_OK

    assert response.data["cart_id"] == cart_item.cart_id
    assert len(response.data["items"]) == 1

    assert response.data["subtotal"] == "500000"
    assert response.data["discount_amount"] == "0"
    assert response.data["shipping_amount"] == "0"
    assert response.data["tax_amount"] == "0"
    assert response.data["grand_total"] == "500000"

    assert {method["code"] for method in response.data["shipping_methods"]} == {
        "JNE_REG",
        "JNE_YES",
    }


@pytest.mark.django_db
def test_checkout_preview_with_shipping_method(
    authenticated_client,
    cart_item,
    inventory,
    shipping_method,
):
    response = authenticated_client.get(
        checkout_preview_url(),
        {
            "shipping_method_id": shipping_method.id,
        },
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["selected_shipping_method_id"] == shipping_method.id
    assert response.data["shipping_amount"] == "15000"
    assert response.data["grand_total"] == "515000"


@pytest.mark.django_db
def test_checkout_preview_rejects_non_integer_shipping_method_id(
    authenticated_client,
    cart_item,
    inventory,
):
    response = authenticated_client.get(
        checkout_preview_url(),
        {
            "shipping_method_id": "abc",
        },
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["shipping_method"] == "Shipping method ID must be an integer."


@pytest.mark.django_db
def test_checkout_preview_rejects_invalid_shipping_method(
    authenticated_client,
    cart_item,
    inventory,
):
    response = authenticated_client.get(
        checkout_preview_url(),
        {
            "shipping_method_id": 999999,
        },
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["shipping_method"] == ["Shipping method not found or inactive."]


@pytest.mark.django_db
def test_checkout_preview_rejects_empty_cart(
    authenticated_client,
    cart,
):
    response = authenticated_client.get(
        checkout_preview_url(),
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["cart"] == ["Cart is empty."]


@pytest.mark.django_db
def test_checkout_preview_rejects_insufficient_stock(
    authenticated_client,
    cart_item,
    inventory,
):
    inventory.stock_on_hand = 1
    inventory.save(update_fields=["stock_on_hand"])

    response = authenticated_client.get(
        checkout_preview_url(),
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Insufficient stock" in response.data["cart"][0]


@pytest.mark.django_db
def test_checkout_preview_does_not_create_cart(
    authenticated_client,
    user,
):
    assert not Cart.objects.filter(
        user=user,
        status=Cart.Status.ACTIVE,
    ).exists()

    response = authenticated_client.get(
        checkout_preview_url(),
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST

    assert not Cart.objects.filter(
        user=user,
        status=Cart.Status.ACTIVE,
    ).exists()
