from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError

from apps.checkout.services import get_checkout_summary


@pytest.mark.django_db
def test_get_checkout_summary_returns_cart_items(
    user,
    cart_item,
    inventory,
):
    summary = get_checkout_summary(
        user=user,
    )

    assert summary["cart_id"] == cart_item.cart_id
    assert len(summary["items"]) == 1

    item = summary["items"][0]

    assert item["cart_item_id"] == cart_item.id
    assert item["variant_id"] == cart_item.variant_id
    assert item["product_name"] == "Basic Shirt"
    assert item["sku"] == "GDR-SH-001-BLK-M"
    assert item["color"] == "Black"
    assert item["size"] == "M"
    assert item["price"] == Decimal("250000")
    assert item["available"] == 10
    assert item["quantity"] == 2
    assert item["subtotal"] == Decimal("500000")


@pytest.mark.django_db
def test_get_checkout_summary_calculates_subtotal(
    user,
    cart_item,
    inventory,
):
    summary = get_checkout_summary(
        user=user,
    )

    assert summary["subtotal"] == Decimal("500000")
    assert summary["discount_amount"] == Decimal("0")
    assert summary["shipping_amount"] == Decimal("0")
    assert summary["tax_amount"] == Decimal("0")
    assert summary["grand_total"] == Decimal("500000")


@pytest.mark.django_db
def test_get_checkout_summary_requires_active_cart(user):
    with pytest.raises(ValidationError) as exc_info:
        get_checkout_summary(user=user)

    assert exc_info.value.message_dict == {
        "cart": ["Active cart not found."],
    }


@pytest.mark.django_db
def test_get_checkout_summary_rejects_empty_cart(
    user,
    cart,
):
    with pytest.raises(ValidationError) as exc_info:
        get_checkout_summary(user=user)

    assert exc_info.value.message_dict == {
        "cart": ["Cart is empty."],
    }


@pytest.mark.django_db
def test_get_checkout_summary_rejects_inactive_variant(
    user,
    cart_item,
    inventory,
):
    cart_item.variant.is_active = False
    cart_item.variant.save(update_fields=["is_active"])

    with pytest.raises(ValidationError) as exc_info:
        get_checkout_summary(user=user)

    assert "no longer available" in str(exc_info.value.message_dict["cart"][0])


@pytest.mark.django_db
def test_get_checkout_summary_rejects_missing_inventory(
    user,
    cart_item,
    inventory,
):
    inventory.delete()

    with pytest.raises(ValidationError) as exc_info:
        get_checkout_summary(user=user)

    assert "has no inventory" in str(exc_info.value.message_dict["cart"][0])


@pytest.mark.django_db
def test_get_checkout_summary_rejects_insufficient_stock(
    user,
    cart_item,
    inventory,
):
    inventory.stock_on_hand = 1
    inventory.save(update_fields=["stock_on_hand"])

    with pytest.raises(ValidationError) as exc_info:
        get_checkout_summary(user=user)

    assert "Insufficient stock" in str(exc_info.value.message_dict["cart"][0])


@pytest.mark.django_db
def test_get_checkout_summary_returns_active_shipping_methods(
    user,
    cart_item,
    inventory,
    shipping_method,
    second_shipping_method,
    inactive_shipping_method,
):
    summary = get_checkout_summary(
        user=user,
    )

    shipping_codes = {method.code for method in summary["shipping_methods"]}

    assert shipping_codes == {
        "JNE_REG",
        "JNE_YES",
    }


@pytest.mark.django_db
def test_get_checkout_summary_without_shipping_method(
    user,
    cart_item,
    inventory,
    shipping_method,
):
    summary = get_checkout_summary(
        user=user,
    )

    assert summary["selected_shipping_method_id"] is None
    assert summary["shipping_amount"] == Decimal("0")
    assert summary["grand_total"] == Decimal("500000")


@pytest.mark.django_db
def test_get_checkout_summary_with_shipping_method(
    user,
    cart_item,
    inventory,
    shipping_method,
):
    summary = get_checkout_summary(
        user=user,
        shipping_method_id=shipping_method.id,
    )

    assert summary["selected_shipping_method_id"] == shipping_method.id
    assert summary["shipping_amount"] == Decimal("15000")
    assert summary["grand_total"] == Decimal("515000")


@pytest.mark.django_db
def test_get_checkout_summary_rejects_invalid_shipping_method(
    user,
    cart_item,
    inventory,
):
    with pytest.raises(ValidationError) as exc_info:
        get_checkout_summary(
            user=user,
            shipping_method_id=999999,
        )

    assert exc_info.value.message_dict == {
        "shipping_method": [
            "Shipping method not found or inactive.",
        ],
    }


@pytest.mark.django_db
def test_get_checkout_summary_rejects_inactive_shipping_method(
    user,
    cart_item,
    inventory,
    inactive_shipping_method,
):
    with pytest.raises(ValidationError) as exc_info:
        get_checkout_summary(
            user=user,
            shipping_method_id=inactive_shipping_method.id,
        )

    assert exc_info.value.message_dict == {
        "shipping_method": [
            "Shipping method not found or inactive.",
        ],
    }
