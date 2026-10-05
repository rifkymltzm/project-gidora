import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import TextButton from '@/components/ui/TextButton';
import Button from '@/components/ui/Button';

import { useCart } from '@/features/cart/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';

export default function Cart() {
  const {
    items,
    totalItems,
    subtotal,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    hasUnavailableItems,
  } = useCart();

  const [showMobileBar, setShowMobileBar] = useState(false);

  const summaryRef = useRef(null);
  const isNearSummaryRef = useRef(false);

  useEffect(() => {
    const summary = summaryRef.current;

    if (!summary) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isNearSummary = entry.isIntersecting;

        isNearSummaryRef.current = isNearSummary;

        if (isNearSummary) {
          setShowMobileBar(false);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 100px 0px',
        threshold: 0,
      },
    );

    observer.observe(summary);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let lenis = null;
    let handleScroll = null;

    const setupLenis = () => {
      lenis = window.__lenis;

      if (!lenis) return;

      handleScroll = ({ scroll, direction }) => {
        if (scroll <= 50) {
          setShowMobileBar(false);
          return;
        }

        if (isNearSummaryRef.current) {
          setShowMobileBar(false);
          return;
        }

        // Show while scrolling down.
        if (direction === 1) {
          setShowMobileBar(true);
        }

        // Hide while scrolling up.
        if (direction === -1) {
          setShowMobileBar(false);
        }
      };

      lenis.on('scroll', handleScroll);
    };

    // Lenis is already available.
    if (window.__lenis) {
      setupLenis();
    } else {
      // Wait until SmoothScroll initializes Lenis.
      window.addEventListener('lenis-ready', setupLenis, {
        once: true,
      });
    }

    return () => {
      if (lenis && handleScroll) {
        lenis.off('scroll', handleScroll);
      }

      window.removeEventListener('lenis-ready', setupLenis);
    };
  }, []);

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="bg-background min-h-[100svh] w-full pt-24 pb-12 sm:pt-26 sm:pb-20 lg:pt-30">
      <div className="px-margin-mobile md:px-margin-desktop mx-auto max-w-screen-2xl">
        <header className="mb-8 sm:mb-10">
          <h1 className="font-headline-lg-mobile text-on-background md:font-headline-display">
            SHOPPING BAG
          </h1>

          <p className="font-label-caps text-text-muted mt-3 pl-1">
            {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'} IN YOUR BAG
          </p>
        </header>

        {hasUnavailableItems && (
          <div className="border-border-subtle bg-surface-container-low -mt-3 mb-6 border p-5">
            <p className="font-label-caps text-tertiary-container">STOCK UPDATED</p>

            <p className="font-technical-data text-secondary mt-2 leading-5">
              Some items in your bag are no longer available. Please review them before continuing
              to checkout.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16">
          {/* Cart items */}
          <section className="lg:col-span-8" aria-label="Shopping bag items">
            <div className="border-text-muted border-t">
              {items.map((item) => (
                <CartItem
                  key={item.cartItemKey}
                  item={item}
                  onRemove={() => removeFromCart(item.cartItemKey)}
                  onIncrease={() => increaseQuantity(item.cartItemKey)}
                  onDecrease={() => decreaseQuantity(item.cartItemKey)}
                />
              ))}
            </div>
          </section>

          {/* Cart summary */}
          <aside ref={summaryRef} className="lg:sticky lg:top-38 lg:col-span-4 lg:self-start">
            <CartSummary subtotal={subtotal} hasUnavailableItems={hasUnavailableItems} />
          </aside>
        </div>
      </div>

      {/* Floating Mobile Checkout Bar */}
      <div
        className={`border-border-subtle bg-surface-container-lowest fixed right-0 bottom-0 left-0 z-40 transform border-t p-4 shadow-lg transition-transform duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          showMobileBar ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        } `}
        aria-hidden={!showMobileBar}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-technical-data text-text-muted block text-[10px]">
              TOTAL ({totalItems} ITEMS)
            </span>

            <span className="font-technical-data text-tertiary-container text-sm font-bold">
              {formatPrice(subtotal)}
            </span>
          </div>

          <CheckoutButton hasUnavailableItems={hasUnavailableItems} size="md" />
        </div>
      </div>
    </main>
  );
}

function CartItem({ item, onRemove, onIncrease, onDecrease }) {
  const productSlug = item.slug ?? item.sku;

  const hasStock = Number.isFinite(Number(item.stock));
  const stock = hasStock ? Math.max(0, Number(item.stock)) : null;

  const isUnavailable = Boolean(item.isUnavailable);
  const isOutOfStock = Boolean(item.isOutOfStock);

  const isBlocked = isUnavailable || isOutOfStock;

  const canIncrease = !isBlocked && stock !== null && item.quantity < stock;

  const remainingStock = stock !== null ? Math.max(stock - item.quantity, 0) : null;

  return (
    <article className={`border-text-muted border-b py-6 lg:py-7 ${isBlocked ? 'opacity-75' : ''}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3.5 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5 md:grid-cols-[144px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[160px_minmax(0,1fr)]">
        <Link
          to={`/products/${productSlug}`}
          aria-label={`View ${item.name}`}
          className="group bg-surface-container-low relative order-2 aspect-square w-full translate-y-2 overflow-hidden sm:order-none sm:w-full sm:translate-y-0"
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
                isBlocked ? 'opacity-40 grayscale' : ''
              }`}
            />
          ) : (
            <div className="bg-surface-container-low flex h-full w-full items-center justify-center">
              <span className="font-technical-data text-text-muted text-[9px]">NO IMAGE</span>
            </div>
          )}
        </Link>

        <div className="order-1 flex min-w-0 flex-col sm:order-none">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <Link to={`/products/${productSlug}`} className="group inline-block max-w-full">
                <h2 className="font-label-caps text-tertiary-container group-hover:text-text-muted line-clamp-2 transition-colors">
                  {item.name}
                </h2>
              </Link>

              <div className="mt-2.5 space-y-0.5 sm:mt-3 sm:space-y-1">
                {item.color && (
                  <p className="font-technical-data text-secondary tracking-wide">
                    <span className="text-tertiary-container">COLOR:</span>{' '}
                    {item.color.toUpperCase()}
                  </p>
                )}

                {item.size && (
                  <p className="font-technical-data text-secondary tracking-wide">
                    <span className="text-tertiary-container">SIZE:</span> {item.size.toUpperCase()}
                  </p>
                )}

                {item.sku && (
                  <p className="font-technical-data text-secondary tracking-wide">
                    <span className="text-tertiary-container">SKU:</span> {item.sku}
                  </p>
                )}
              </div>

              {isOutOfStock && (
                <p className="font-technical-data text-secondary mt-3 text-[10px] tracking-wide">
                  OUT OF STOCK — STOCK IS CURRENTLY 0
                </p>
              )}

              {isUnavailable && (
                <p className="font-technical-data text-secondary mt-3 text-[10px] tracking-wide">
                  VARIANT NO LONGER AVAILABLE
                </p>
              )}
            </div>

            <div className="hidden shrink-0 text-right sm:block">
              {!isBlocked && (
                <>
                  <p className="font-technical-data text-tertiary-container text-sm md:text-base">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {item.quantity > 1 && (
                    <p className="font-technical-data text-text-muted mt-1 text-[11px]">
                      {formatPrice(item.price)} / ITEM
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 hidden items-end justify-between gap-4 sm:flex">
            <QuantityControl
              stock={stock}
              quantity={item.quantity}
              remainingStock={remainingStock}
              canIncrease={canIncrease}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              itemName={item.name}
              isOutOfStock={isOutOfStock}
              disabled={isBlocked}
            />

            <TextButton variant="danger" animateUnderline onClick={onRemove} className="me-4">
              REMOVE
            </TextButton>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-4 sm:hidden">
        <QuantityControl
          stock={stock}
          quantity={item.quantity}
          remainingStock={remainingStock}
          canIncrease={canIncrease}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          itemName={item.name}
          isOutOfStock={isOutOfStock}
          disabled={isBlocked}
        />

        <TextButton variant="danger" animateUnderline onClick={onRemove} className="me-4">
          REMOVE
        </TextButton>
      </div>

      {!isBlocked && (
        <div className="border-border-subtle mt-4 flex items-center justify-between border-t pt-5 sm:hidden">
          <span className="font-label-caps text-text-muted text-[9px]">PRICE</span>

          <div className="text-right">
            <p className="font-technical-data text-tertiary-container text-xs">
              {formatPrice(item.price * item.quantity)}
            </p>

            {item.quantity > 1 && (
              <p className="font-technical-data text-text-muted mt-0.5 text-[8px]">
                {formatPrice(item.price)} / ITEM
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function QuantityControl({
  stock,
  quantity,
  remainingStock,
  canIncrease,
  onIncrease,
  onDecrease,
  itemName,
  isOutOfStock,
  disabled,
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2.5">
        <span className="font-technical-data text-tertiary-container text-[11px]">STOCK</span>

        {isOutOfStock ? (
          <span className="font-technical-data text-secondary text-[11px]">OUT OF STOCK</span>
        ) : (
          stock !== null && (
            <span className="font-technical-data text-secondary text-[11px]">
              {stock} AVAILABLE
            </span>
          )
        )}
      </div>

      <div className="border-border-subtle flex h-8 items-center justify-center border sm:h-9">
        <QuantityButton
          icon="remove"
          onClick={onDecrease}
          disabled={disabled || quantity <= 0}
          label={disabled ? `${itemName} is unavailable` : `Decrease quantity of ${itemName}`}
        />

        <span
          className="border-border-subtle font-technical-data text-tertiary-container flex h-full min-w-8 items-center justify-center border-x text-[11px] sm:min-w-9 sm:text-xs"
          aria-live="polite"
        >
          {quantity}
        </span>

        <QuantityButton
          icon="add"
          onClick={onIncrease}
          disabled={disabled || !canIncrease}
          label={
            disabled
              ? `${itemName} is unavailable`
              : isOutOfStock
                ? `${itemName} is out of stock`
                : stock !== null && !canIncrease
                  ? `Maximum available quantity reached for ${itemName}`
                  : `Increase quantity of ${itemName}`
          }
        />
      </div>

      {isOutOfStock ? (
        <p className="font-technical-data text-secondary mt-1.5 text-[10px] tracking-wide">
          CURRENTLY UNAVAILABLE
        </p>
      ) : (
        stock !== null &&
        remainingStock === 0 && (
          <p className="font-technical-data text-secondary mt-1.5 text-[10px] tracking-wide">
            MAXIMUM QUANTITY
          </p>
        )
      )}
    </div>
  );
}

function CartSummary({ subtotal, hasUnavailableItems }) {
  return (
    <div>
      <div className="border-border-subtle bg-surface-container-lowest border p-5 sm:p-6 md:p-7">
        <div className="border-border-subtle mb-6 border-b pb-5 sm:mb-7">
          <h2 className="font-headline-lg-mobile text-tertiary-container md:font-headline-lg">
            ORDER SUMMARY
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-6">
            <span className="font-technical-data text-secondary">SUBTOTAL</span>

            <span className="font-technical-data text-tertiary-container">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-6">
            <span className="font-technical-data text-secondary">SHIPPING</span>

            <span className="font-technical-data text-secondary max-w-[150px] text-right text-[11px] leading-5">
              CALCULATED AT NEXT STEP
            </span>
          </div>
        </div>

        <div className="border-border-subtle mt-6 border-t pt-5 sm:mt-7">
          <div className="flex items-end justify-between gap-4">
            <span className="font-technical-data text-text-muted font-bold">TOTAL</span>

            <span className="font-technical-data text-tertiary-container text-base font-bold">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>

        <div className="mt-7 space-y-3">
          <CheckoutButton hasUnavailableItems={hasUnavailableItems} size="full" />

          <Button as={Link} to="/products" variant="outline" size="full">
            CONTINUE SHOPPING
          </Button>
        </div>

        <p className="font-technical-data text-secondary mt-5 text-center text-[11px] leading-5">
          SHIPPING OPTIONS AND FINAL COSTS WILL BE SHOWN AT CHECKOUT.
        </p>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="bg-surface px-margin-mobile flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md text-center">
        <p className="font-headline-lg-mobile text-tertiary-container md:font-headline-lg">
          YOUR BAG IS EMPTY
        </p>

        <p className="font-body-md text-text-muted mt-4 mb-4">
          Belum ada produk yang ditambahkan ke shopping bag.
        </p>

        <Button as={Link} to="/products" variant="secondary" icon="shopping_bag_speed" size="lg">
          EXPLORE COLLECTIONS
        </Button>
      </div>
    </div>
  );
}

function QuantityButton({ icon, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-text-muted hover:bg-surface-container-low hover:text-tertiary-container flex h-full w-8 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-30 sm:w-9"
    >
      <span
        className="material-symbols-outlined flex w-3.5 items-center justify-center !text-[14px]"
        aria-hidden="true"
      >
        {icon}
      </span>
    </button>
  );
}

function CheckoutButton({ hasUnavailableItems, size = 'full' }) {
  if (hasUnavailableItems) {
    return (
      <Button type="button" variant="primary" size={size} icon="block" iconPosition="left" disabled>
        REVIEW BAG
      </Button>
    );
  }

  return (
    <Button as={Link} to="/checkout" variant="primary" size={size} icon="shopping_bag_speed">
      CHECKOUT
    </Button>
  );
}
