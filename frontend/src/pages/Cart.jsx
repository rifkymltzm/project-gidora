import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

export default function Cart() {
  const { items, subtotal, removeFromCart, updateQuantity, decreaseQuantity } =
    useCart();

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-[70vh] w-full bg-background">
      <main className="mx-auto max-w-screen-2xl px-margin-mobile pb-20 pt-28 md:px-margin-desktop md:pt-32">
        {/* =========================================================
           HEADER
        ========================================================= */}

        <div className="mb-10">
          <h1 className="mb-4 font-headline-lg-mobile text-on-background md:font-headline-display">
            SHOPPING BAG
          </h1>

          <p className="ps-1 font-label-caps text-text-muted">
            {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"} IN YOUR BAG
          </p>
        </div>

        {/* =========================================================
           CART CONTENT
        ========================================================= */}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="border-t border-border-subtle">
              {items.map((item) => (
                <CartItem
                  key={item.cartItemKey}
                  item={item}
                  onRemove={() => removeFromCart(item.cartItemKey)}
                  onIncrease={() =>
                    updateQuantity(item.cartItemKey, item.quantity + 1)
                  }
                  onDecrease={() => decreaseQuantity(item.cartItemKey)}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <CartSummary subtotal={subtotal} />
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   CART ITEM
========================================================= */

function CartItem({ item, onRemove, onIncrease, onDecrease }) {
  const productId = item.productId ?? item.id;

  return (
    <div className="flex gap-4 border-b border-border-subtle py-6 md:gap-6">
      {/* Product Image */}
      <Link
        to={`/products/${productId}`}
        aria-label={`View ${item.name}`}
        className="group h-28 w-24 shrink-0 overflow-hidden bg-surface-container-lowest md:h-36 md:w-32"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
            <span className="font-technical-data text-text-muted">
              NO IMAGE
            </span>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <Link to={`/products/${productId}`} className="group inline-block">
              <h2 className="font-label-caps text-primary transition-colors duration-300 group-hover:text-text-muted">
                {item.name}
              </h2>
            </Link>

            {item.color && (
              <p className="mt-2 font-technical-data text-text-muted">
                COLOR: {item.color.toUpperCase()}
              </p>
            )}

            {item.size && (
              <p className="mt-1 font-technical-data text-text-muted">
                SIZE: {item.size.toUpperCase()}
              </p>
            )}
          </div>

          {/* Price */}
          <p className="shrink-0 font-technical-data text-primary">
            {formatPrice(item.priceNum * item.quantity)}
          </p>
        </div>

        {/* Quantity + Remove */}
        <div className="mt-auto flex items-end justify-between pt-6">
          {/* Quantity Control */}
          <div className="flex items-center border border-border-subtle">
            <button
              type="button"
              onClick={onDecrease}
              aria-label={`Decrease quantity of ${item.name}`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-text-muted transition-colors hover:bg-surface-container-low hover:text-primary"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                remove
              </span>
            </button>

            <span className="flex h-8 min-w-8 items-center justify-center border-x border-border-subtle font-technical-data">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              aria-label={`Increase quantity of ${item.name}`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-text-muted transition-colors hover:bg-surface-container-low hover:text-primary"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                add
              </span>
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            className="cursor-pointer font-label-caps text-text-muted underline transition-colors hover:text-primary"
          >
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function CartSummary({ subtotal }) {
  return (
    <aside className="lg:col-span-4">
      <div className="border border-border-subtle bg-surface-container-lowest p-6 md:p-7 lg:sticky lg:top-28">
        {/* Header */}
        <div className="mb-7 border-b border-border-subtle pb-5">
          <h2 className="font-headline-lg-mobile text-primary md:font-headline-lg">
            ORDER SUMMARY
          </h2>
        </div>

        {/* Price Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-text-muted">SUBTOTAL</span>

            <span className="font-technical-data text-primary">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-6">
            <span className="font-label-caps text-text-muted">SHIPPING</span>

            <span className="text-right font-technical-data text-text-muted">
              CALCULATED AT NEXT STEP
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="mt-7 border-t border-border-subtle pt-5">
          <div className="flex items-end justify-between gap-4">
            <span className="font-label-caps text-primary">TOTAL</span>

            <span className="font-body-lg text-primary">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between bg-primary px-5 py-4 font-label-caps tracking-widest text-on-primary transition-colors duration-300 hover:bg-surface-tint"
          >
            <span>CHECKOUT</span>

            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              arrow_forward
            </span>
          </button>

          <Link
            to="/products"
            className="flex w-full items-center justify-center border border-border-subtle px-5 py-4 font-label-caps tracking-widest text-primary transition-colors duration-300 hover:border-primary hover:bg-surface-container-low"
          >
            CONTINUE SHOPPING
          </Link>
        </div>

        {/* Shipping Note */}
        <p className="mt-5 text-center font-technical-data text-text-muted">
          SHIPPING OPTIONS AND FINAL COSTS WILL BE SHOWN AT CHECKOUT.
        </p>
      </div>
    </aside>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyCart() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface px-margin-mobile">
      <div className="text-center">
        <p className="mb-4 font-headline-lg-mobile text-primary md:font-headline-lg">
          YOUR BAG IS EMPTY
        </p>

        <p className="font-body-md text-text-muted">
          Belum ada produk yang ditambahkan ke shopping bag.
        </p>

        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 border border-primary px-5 py-3 font-label-caps text-primary transition-colors duration-300 hover:bg-primary hover:text-on-primary"
        >
          EXPLORE COLLECTIONS
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
