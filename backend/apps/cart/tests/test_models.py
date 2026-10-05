import pytest
from django.db import IntegrityError

from apps.cart.models import Cart, CartItem


@pytest.mark.django_db
def test_create_active_cart(user):
    cart = Cart.objects.create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    assert cart.user == user
    assert cart.status == Cart.Status.ACTIVE


@pytest.mark.django_db
def test_user_can_have_only_one_active_cart(user):
    Cart.objects.create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    with pytest.raises(IntegrityError):
        Cart.objects.create(
            user=user,
            status=Cart.Status.ACTIVE,
        )


@pytest.mark.django_db
def test_user_can_have_multiple_converted_carts(user):
    first_cart = Cart.objects.create(
        user=user,
        status=Cart.Status.CONVERTED,
    )

    second_cart = Cart.objects.create(
        user=user,
        status=Cart.Status.CONVERTED,
    )

    assert first_cart.pk != second_cart.pk


@pytest.mark.django_db
def test_create_cart_item(user, variant):
    cart = Cart.objects.create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    item = CartItem.objects.create(
        cart=cart,
        variant=variant,
        quantity=2,
    )

    assert item.cart == cart
    assert item.variant == variant
    assert item.quantity == 2


@pytest.mark.django_db
def test_cart_cannot_have_duplicate_variant(user, variant):
    cart = Cart.objects.create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    CartItem.objects.create(
        cart=cart,
        variant=variant,
        quantity=1,
    )

    with pytest.raises(IntegrityError):
        CartItem.objects.create(
            cart=cart,
            variant=variant,
            quantity=2,
        )


@pytest.mark.django_db
def test_cart_item_quantity_must_be_positive(user, variant):
    cart = Cart.objects.create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    item = CartItem(
        cart=cart,
        variant=variant,
        quantity=0,
    )

    with pytest.raises(Exception):
        item.full_clean()


@pytest.mark.django_db
def test_same_variant_can_exist_in_different_carts(
    user,
    other_user,
    variant,
):
    first_cart = Cart.objects.create(
        user=user,
        status=Cart.Status.ACTIVE,
    )

    second_cart = Cart.objects.create(
        user=other_user,
        status=Cart.Status.ACTIVE,
    )

    first_item = CartItem.objects.create(
        cart=first_cart,
        variant=variant,
        quantity=1,
    )

    second_item = CartItem.objects.create(
        cart=second_cart,
        variant=variant,
        quantity=1,
    )

    assert first_item.pk != second_item.pk
