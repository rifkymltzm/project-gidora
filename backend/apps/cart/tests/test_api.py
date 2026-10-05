import pytest
from django.urls import reverse
from rest_framework import status
from decimal import Decimal
from apps.cart.models import Cart, CartItem


def cart_url():
    return reverse("cart-list")


def cart_clear_url():
    return reverse("cart-clear")


def cart_item_url(item_id):
    return reverse(
        "cart-detail",
        kwargs={"pk": item_id},
    )


@pytest.mark.django_db
def test_unauthenticated_user_cannot_access_cart(api_client):
    response = api_client.get(cart_url())

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_get_cart_creates_active_cart(authenticated_client, user):
    response = authenticated_client.get(cart_url())

    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == Cart.Status.ACTIVE
    assert response.data["items"] == []
    assert response.data["total_items"] == 0
    assert response.data["subtotal"] == Decimal("0")

    assert (
        Cart.objects.filter(
            user=user,
            status=Cart.Status.ACTIVE,
        ).count()
        == 1
    )


@pytest.mark.django_db
def test_add_item_to_cart(
    authenticated_client,
    user,
    variant,
    inventory,
):
    response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 2,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED

    assert response.data["status"] == Cart.Status.ACTIVE
    assert response.data["total_items"] == 2
    assert response.data["subtotal"] == Decimal("500000")

    assert len(response.data["items"]) == 1

    item = response.data["items"][0]

    assert item["variant"] == variant.id
    assert item["quantity"] == 2
    assert item["sku"] == variant.sku
    assert item["product_name"] == variant.product_color.product.name
    assert item["color"] == variant.product_color.color.name
    assert item["size"] == variant.size.name
    assert item["price"] == "250000"
    assert item["available"] == 10
    assert item["subtotal"] == Decimal("500000")


@pytest.mark.django_db
def test_add_existing_item_increases_quantity(
    authenticated_client,
    variant,
    inventory,
):
    authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 2,
        },
        format="json",
    )

    response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 3,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["total_items"] == 5
    assert len(response.data["items"]) == 1
    assert response.data["items"][0]["quantity"] == 5


@pytest.mark.django_db
def test_add_item_rejects_insufficient_stock(
    authenticated_client,
    variant,
    inventory,
):
    response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 11,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "quantity" in response.data

    assert not CartItem.objects.filter(
        cart__user__email="customer@gidora.com",
        variant=variant,
    ).exists()


@pytest.mark.django_db
def test_add_item_rejects_inactive_variant(
    authenticated_client,
    variant,
    inventory,
):
    variant.is_active = False
    variant.save(update_fields=["is_active"])

    response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 1,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "variant" in response.data


@pytest.mark.django_db
def test_update_cart_item_quantity(
    authenticated_client,
    variant,
    inventory,
):
    create_response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 2,
        },
        format="json",
    )

    item_id = create_response.data["items"][0]["id"]

    response = authenticated_client.patch(
        cart_item_url(item_id),
        {
            "quantity": 5,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["total_items"] == 5
    assert response.data["items"][0]["quantity"] == 5


@pytest.mark.django_db
def test_update_cart_item_rejects_insufficient_stock(
    authenticated_client,
    variant,
    inventory,
):
    create_response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 2,
        },
        format="json",
    )

    item_id = create_response.data["items"][0]["id"]

    response = authenticated_client.patch(
        cart_item_url(item_id),
        {
            "quantity": 11,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "quantity" in response.data


@pytest.mark.django_db
def test_update_cart_item_rejects_other_users_item(
    authenticated_client,
    api_client,
    other_user,
    variant,
    inventory,
):
    create_response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 2,
        },
        format="json",
    )

    item_id = create_response.data["items"][0]["id"]

    api_client.force_authenticate(user=other_user)

    response = api_client.patch(
        cart_item_url(item_id),
        {
            "quantity": 3,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND

    item = CartItem.objects.get(pk=item_id)
    assert item.quantity == 2


@pytest.mark.django_db
def test_delete_cart_item(
    authenticated_client,
    variant,
    inventory,
):
    create_response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 2,
        },
        format="json",
    )

    item_id = create_response.data["items"][0]["id"]

    response = authenticated_client.delete(
        cart_item_url(item_id),
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    assert not CartItem.objects.filter(
        pk=item_id,
    ).exists()


@pytest.mark.django_db
def test_delete_cart_item_rejects_other_users_item(
    authenticated_client,
    api_client,
    other_user,
    variant,
    inventory,
):
    create_response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 2,
        },
        format="json",
    )

    item_id = create_response.data["items"][0]["id"]

    api_client.force_authenticate(user=other_user)

    response = api_client.delete(
        cart_item_url(item_id),
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND

    assert CartItem.objects.filter(
        pk=item_id,
    ).exists()


@pytest.mark.django_db
def test_clear_cart(
    authenticated_client,
    variant,
    inventory,
):
    authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 2,
        },
        format="json",
    )

    response = authenticated_client.delete(
        cart_clear_url(),
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    assert not CartItem.objects.filter(
        cart__user__email="customer@gidora.com",
    ).exists()


@pytest.mark.django_db
def test_clear_cart_without_existing_cart_is_idempotent(
    authenticated_client,
    user,
):
    assert not Cart.objects.filter(
        user=user,
        status=Cart.Status.ACTIVE,
    ).exists()

    response = authenticated_client.delete(
        cart_clear_url(),
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    assert not Cart.objects.filter(
        user=user,
        status=Cart.Status.ACTIVE,
    ).exists()


@pytest.mark.django_db
def test_cart_validation_requires_variant(
    authenticated_client,
):
    response = authenticated_client.post(
        cart_url(),
        {
            "quantity": 2,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "variant" in response.data


@pytest.mark.django_db
def test_cart_validation_requires_positive_quantity(
    authenticated_client,
    variant,
    inventory,
):
    response = authenticated_client.post(
        cart_url(),
        {
            "variant": variant.id,
            "quantity": 0,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "quantity" in response.data
