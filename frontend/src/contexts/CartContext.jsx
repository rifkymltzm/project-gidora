import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "gidora-cart";

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);

      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = ({ product, color, size }) => {
    const cartItemKey = createCartItemKey(product.id, color, size);

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.cartItemKey === cartItemKey,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartItemKey === cartItemKey
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          cartItemKey,
          productId: product.id,
          name: product.name,
          price: product.price,
          priceNum: product.priceNum,
          image: product.images?.primary,
          color: color || "",
          size: size || "",
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (cartItemKey) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.cartItemKey !== cartItemKey),
    );
  };

  const updateQuantity = (cartItemKey, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemKey === cartItemKey
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (cartItemKey) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartItemKey === cartItemKey
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + (Number(item.priceNum) || 0) * item.quantity,
        0,
      ),
    [items],
  );

  const value = {
    items,
    totalItems,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    decreaseQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

function createCartItemKey(productId, color, size) {
  return `${productId}-${String(color || "").toLowerCase()}-${String(
    size || "",
  ).toLowerCase()}`;
}
