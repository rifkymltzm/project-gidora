import { createContext, useContext, useEffect, useState } from 'react';

import PRODUCTS_DATA from '@/features/products/data/products';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'gidora-cart';

/*
 * PRODUCTS_DATA adalah mock/static data untuk saat ini.
 *
 * Index variant berdasarkan SKU agar pencarian variant tidak perlu
 * melakukan loop PRODUCTS_DATA setiap kali quantity berubah.
 *
 * Lookup:
 * O(n) → O(1)
 */
const VARIANT_BY_SKU = new Map();

for (const product of PRODUCTS_DATA) {
  for (const variant of product.variants ?? []) {
    VARIANT_BY_SKU.set(variant.sku, {
      product,
      variant,
    });
  }
}

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (!storedCart) {
        return [];
      }

      const parsedCart = JSON.parse(storedCart);

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return reconcileCartItems(parsedCart);
    } catch {
      return [];
    }
  });

  /*
   * LocalStorage hanya menyimpan state cart.
   *
   * PRODUCTS_DATA tetap menjadi source of truth untuk:
   * - product data
   * - variant data
   * - stock
   * - price
   * - image
   */
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /*
   * PRODUCTS_DATA adalah static module data.
   *
   * Initial cart sudah direconcile ketika state dibuat,
   * jadi tidak perlu melakukan reconciliation kedua setelah mount.
   */

  const addToCart = ({ product, color, size, quantity = 1, variant }) => {
    if (!product || !variant) return;

    const stock = normalizeStock(variant.stock);

    if (stock <= 0) return;

    const cartItemKey = createCartItemKey(variant.sku, color?.name, size);

    const requestedQuantity = Math.max(1, Number(quantity) || 1);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartItemKey === cartItemKey);

      if (existingItem) {
        const currentQuantity = Math.max(0, Number(existingItem.quantity) || 0);

        const nextQuantity = Math.min(currentQuantity + requestedQuantity, stock);

        return currentItems.map((item) =>
          item.cartItemKey === cartItemKey
            ? createCartItem({
                existingItem: item,
                product,
                color,
                size,
                variant,
                quantity: nextQuantity,
              })
            : item,
        );
      }

      return [
        ...currentItems,
        createCartItem({
          product,
          color,
          size,
          variant,
          quantity: Math.min(requestedQuantity, stock),
        }),
      ];
    });
  };

  const removeFromCart = (cartItemKey) => {
    setItems((currentItems) => currentItems.filter((item) => item.cartItemKey !== cartItemKey));
  };

  /*
   * Semua perubahan quantity melewati helper yang sama
   * sehingga logic stock/availability tidak duplicated.
   */
  const updateQuantity = (cartItemKey, quantity) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.cartItemKey !== cartItemKey) {
          return item;
        }

        return updateCartItemQuantity(item, quantity);
      }),
    );
  };

  const increaseQuantity = (cartItemKey) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.cartItemKey !== cartItemKey) {
          return item;
        }

        return updateCartItemQuantity(item, Number(item.quantity) + 1);
      }),
    );
  };

  const decreaseQuantity = (cartItemKey) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.cartItemKey !== cartItemKey) {
            return item;
          }

          /*
           * Untuk unavailable/out-of-stock item,
           * jangan mencoba mengubah quantity berdasarkan stock baru.
           *
           * UI juga tidak memanggil decrease ketika disabled,
           * tetapi guard ini membuat context tetap aman.
           */
          if (item.isUnavailable || item.isOutOfStock) {
            return item;
          }

          const currentQuantity = Math.max(1, Number(item.quantity) || 1);

          const nextQuantity = Math.max(1, currentQuantity - 1);

          return updateCartItemQuantity(item, nextQuantity);
        })
        .filter((item) => {
          /*
           * Item unavailable/out-of-stock tetap dipertahankan.
           *
           * Item normal dengan quantity <= 0 dibuang.
           */
          if (item.isUnavailable || item.isOutOfStock) {
            return true;
          }

          return item.quantity > 0;
        }),
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  /*
   * Derived cart data.
   *
   * Dua filter tetap dipertahankan karena lebih mudah dibaca
   * dan jumlah item cart biasanya kecil.
   */
  const purchasableItems = items.filter(
    (item) => item.quantity > 0 && !item.isOutOfStock && !item.isUnavailable,
  );

  const unavailableItems = items.filter(
    (item) => item.isOutOfStock || item.isUnavailable || item.quantity <= 0,
  );

  const totalItems = purchasableItems.reduce((total, item) => total + item.quantity, 0);

  const subtotal = purchasableItems.reduce(
    (total, item) => total + (Number(item.price) || 0) * item.quantity,
    0,
  );

  const hasUnavailableItems = unavailableItems.length > 0;

  const value = {
    items,
    purchasableItems,
    unavailableItems,
    hasUnavailableItems,

    totalItems,
    subtotal,

    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}

/* =========================================================
   CART ITEM CREATION
========================================================= */

function createCartItem({ existingItem = null, product, color, size, variant, quantity }) {
  const stock = normalizeStock(variant.stock);

  return {
    /*
     * Preserve existing cart item metadata when available.
     */
    ...(existingItem ?? {}),

    cartItemKey: createCartItemKey(
      variant.sku,
      color?.name ?? existingItem?.color,
      size ?? existingItem?.size,
    ),

    /*
     * Product
     */
    productSku: product.sku,
    name: product.name,
    slug: product.slug,
    price: Number(product.price) || 0,

    /*
     * Variant
     */
    sku: variant.sku,
    variantId: variant.id,
    colorId: color?.id ?? variant.colorId ?? existingItem?.colorId ?? null,
    color: color?.name ?? existingItem?.color ?? '',
    size: size ?? existingItem?.size ?? '',
    stock,

    /*
     * Image mengikuti color variant.
     */
    image: color?.image ?? existingItem?.image ?? product.images?.primary ?? '',

    quantity: Math.max(0, Math.min(Number(quantity) || 0, stock)),

    isUnavailable: false,
    isOutOfStock: stock <= 0,
  };
}

/* =========================================================
   CART QUANTITY
========================================================= */

/*
 * Satu source of truth untuk perubahan quantity.
 *
 * Semua update:
 * - updateQuantity
 * - increaseQuantity
 * - decreaseQuantity
 *
 * menggunakan helper ini.
 */
function updateCartItemQuantity(item, requestedQuantity) {
  const result = findProductVariant(item.sku);

  /*
   * Variant sudah tidak ada di PRODUCTS_DATA.
   */
  if (!result) {
    return {
      ...item,
      quantity: 0,
      stock: 0,
      isUnavailable: true,
      isOutOfStock: false,
    };
  }

  const { product, variant } = result;
  const stock = normalizeStock(variant.stock);

  /*
   * Variant masih ada tetapi stock 0.
   */
  if (stock <= 0) {
    return {
      ...item,
      ...getFreshVariantData(item, product, variant),
      quantity: 0,
      stock: 0,
      isUnavailable: false,
      isOutOfStock: true,
    };
  }

  const quantity = Math.min(Math.max(1, Number(requestedQuantity) || 1), stock);

  return {
    ...item,
    ...getFreshVariantData(item, product, variant),
    quantity,
    stock,
    isUnavailable: false,
    isOutOfStock: false,
  };
}

/* =========================================================
   CART RECONCILIATION
========================================================= */

function reconcileCartItems(cartItems) {
  return cartItems.map((item) => {
    const result = findProductVariant(item.sku);

    /*
     * Variant sudah tidak ada di PRODUCTS_DATA.
     *
     * Item tetap dipertahankan agar user tahu bahwa
     * cart mereka memiliki item yang sudah tidak tersedia.
     */
    if (!result) {
      return {
        ...item,
        quantity: 0,
        stock: 0,
        isUnavailable: true,
        isOutOfStock: false,
      };
    }

    const { product, variant } = result;
    const stock = normalizeStock(variant.stock);

    /*
     * Variant masih ada tetapi stock 0.
     */
    if (stock <= 0) {
      return {
        ...item,
        ...getFreshVariantData(item, product, variant),
        quantity: 0,
        stock: 0,
        isUnavailable: false,
        isOutOfStock: true,
      };
    }

    /*
     * Variant masih tersedia.
     *
     * Quantity cart tidak boleh melebihi stock terbaru.
     */
    const storedQuantity = Math.max(0, Number(item.quantity) || 0);

    return {
      ...item,
      ...getFreshVariantData(item, product, variant),
      quantity: Math.min(storedQuantity, stock),
      stock,
      isUnavailable: false,
      isOutOfStock: false,
    };
  });
}

/*
 * Mengambil data product + variant sekaligus.
 *
 * Karena sudah menggunakan Map, lookup SKU adalah O(1).
 */
function findProductVariant(sku) {
  if (!sku) {
    return null;
  }

  return VARIANT_BY_SKU.get(sku) ?? null;
}

function getFreshVariantData(item, product, variant) {
  const color = product.colors?.find((colorItem) => colorItem.id === variant.colorId);

  return {
    productSku: product.sku,
    name: product.name,
    slug: product.slug,
    price: Number(product.price) || 0,

    sku: variant.sku,
    variantId: variant.id,

    colorId: variant.colorId ?? item.colorId ?? null,

    color: color?.name ?? item.color ?? '',

    size: variant.size ?? item.size ?? '',

    stock: normalizeStock(variant.stock),

    image: color?.image ?? product.images?.primary ?? item.image ?? '',
  };
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeStock(stock) {
  const numericStock = Number(stock);

  if (!Number.isFinite(numericStock)) {
    return 0;
  }

  return Math.max(0, numericStock);
}

function createCartItemKey(sku, color, size) {
  return JSON.stringify([
    String(sku || '').toLowerCase(),
    String(color || '').toLowerCase(),
    String(size || '').toLowerCase(),
  ]);
}
