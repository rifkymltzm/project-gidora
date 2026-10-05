import pytest
from django.core.exceptions import ValidationError

from apps.cart.models import Cart, CartItem
from apps.cart.services import (
    add_item,
    clear_cart,
    get_or_create_active_cart,
    remove_item,
    update_item_quantity,
)


@pytest.mark.django_db
def test_get_or_create_active_cart_creates_cart(user):
    cart = get_or_create_active_cart(user=user)

    assert cart.user == user
    assert cart.status == Cart.Status.ACTIVE
    assert (
        Cart.objects.filter(
            user=user,
            status=Cart.Status.ACTIVE,
        ).count()
        == 1
    )


@pytest.mark.django_db
def test_get_or_create_active_cart_returns_existing_cart(user):
    first_cart = get_or_create_active_cart(user=user)
    second_cart = get_or_create_active_cart(user=user)

    assert first_cart.pk == second_cart.pk
    assert (
        Cart.objects.filter(
            user=user,
            status=Cart.Status.ACTIVE,
        ).count()
        == 1
    )


@pytest.mark.django_db
def test_add_item_creates_cart_item(user, variant, inventory):
    item = add_item(
        user=user,
        variant=variant,
        quantity=2,
    )

    assert item.variant == variant
    assert item.quantity == 2
    assert item.cart.user == user
    assert item.cart.status == Cart.Status.ACTIVE


@pytest.mark.django_db
def test_add_item_increases_existing_quantity(user, variant, inventory):
    first_item = add_item(
        user=user,
        variant=variant,
        quantity=2,
    )

    second_item = add_item(
        user=user,
        variant=variant,
        quantity=3,
    )

    assert first_item.pk == second_item.pk
    assert second_item.quantity == 5

    assert (
        CartItem.objects.filter(
            cart=first_item.cart,
            variant=variant,
        ).count()
        == 1
    )


@pytest.mark.django_db
def test_add_item_rejects_insufficient_stock(user, variant, inventory):
    with pytest.raises(ValidationError) as exc_info:
        add_item(
            user=user,
            variant=variant,
            quantity=11,
        )

    assert "quantity" in exc_info.value.message_dict
    assert "Insufficient stock" in str(exc_info.value)

    assert not CartItem.objects.filter(
        cart__user=user,
        variant=variant,
    ).exists()


@pytest.mark.django_db
def test_add_item_rejects_quantity_exceeding_stock_after_existing_quantity(
    user,
    variant,
    inventory,
):
    add_item(
        user=user,
        variant=variant,
        quantity=7,
    )

    with pytest.raises(ValidationError) as exc_info:
        add_item(
            user=user,
            variant=variant,
            quantity=4,
        )

    assert "quantity" in exc_info.value.message_dict
    assert "Insufficient stock" in str(exc_info.value)

    item = CartItem.objects.get(
        cart__user=user,
        variant=variant,
    )
    assert item.quantity == 7


@pytest.mark.django_db
def test_add_item_rejects_inactive_variant(user, variant, inventory):
    variant.is_active = False
    variant.save(update_fields=["is_active"])

    with pytest.raises(ValidationError) as exc_info:
        add_item(
            user=user,
            variant=variant,
            quantity=1,
        )

    assert exc_info.value.message_dict == {
        "variant": ["This product variant is no longer available."]
    }


@pytest.mark.django_db
def test_update_item_quantity(user, variant, inventory):
    item = add_item(
        user=user,
        variant=variant,
        quantity=2,
    )

    updated_item = update_item_quantity(
        user=user,
        item_id=item.id,
        quantity=5,
    )

    assert updated_item.pk == item.pk
    assert updated_item.quantity == 5


@pytest.mark.django_db
def test_update_item_quantity_rejects_insufficient_stock(
    user,
    variant,
    inventory,
):
    item = add_item(
        user=user,
        variant=variant,
        quantity=5,
    )

    with pytest.raises(ValidationError) as exc_info:
        update_item_quantity(
            user=user,
            item_id=item.id,
            quantity=11,
        )

    assert "quantity" in exc_info.value.message_dict

    item.refresh_from_db()
    assert item.quantity == 5


@pytest.mark.django_db
def test_update_item_quantity_rejects_inactive_variant(
    user,
    variant,
    inventory,
):
    item = add_item(
        user=user,
        variant=variant,
        quantity=2,
    )

    variant.is_active = False
    variant.save(update_fields=["is_active"])

    with pytest.raises(ValidationError) as exc_info:
        update_item_quantity(
            user=user,
            item_id=item.id,
            quantity=3,
        )

    assert exc_info.value.message_dict == {
        "variant": ["This product variant is no longer available."]
    }


@pytest.mark.django_db
def test_remove_item(user, variant, inventory):
    item = add_item(
        user=user,
        variant=variant,
        quantity=2,
    )

    remove_item(
        user=user,
        item_id=item.id,
    )

    assert not CartItem.objects.filter(
        pk=item.id,
    ).exists()


@pytest.mark.django_db
def test_remove_item_rejects_other_users_item(
    user,
    other_user,
    variant,
    inventory,
):
    item = add_item(
        user=user,
        variant=variant,
        quantity=2,
    )

    with pytest.raises(CartItem.DoesNotExist):
        remove_item(
            user=other_user,
            item_id=item.id,
        )

    assert CartItem.objects.filter(
        pk=item.id,
    ).exists()


@pytest.mark.django_db
def test_update_item_quantity_rejects_other_users_item(
    user,
    other_user,
    variant,
    inventory,
):
    item = add_item(
        user=user,
        variant=variant,
        quantity=2,
    )

    with pytest.raises(CartItem.DoesNotExist):
        update_item_quantity(
            user=other_user,
            item_id=item.id,
            quantity=3,
        )

    item.refresh_from_db()
    assert item.quantity == 2


@pytest.mark.django_db
def test_clear_cart_removes_all_items(user, variant, inventory):
    cart = get_or_create_active_cart(user=user)

    add_item(
        user=user,
        variant=variant,
        quantity=2,
    )
    add_item(
        user=user,
        variant=variant,
        quantity=3,
    )

    assert cart.items.count() == 1

    clear_cart(user=user)

    cart.refresh_from_db()

    assert cart.items.count() == 0


@pytest.mark.django_db
def test_clear_cart_without_active_cart_returns_none(user):
    assert not Cart.objects.filter(
        user=user,
        status=Cart.Status.ACTIVE,
    ).exists()

    result = clear_cart(user=user)

    assert result is None

    assert not Cart.objects.filter(
        user=user,
        status=Cart.Status.ACTIVE,
    ).exists()
