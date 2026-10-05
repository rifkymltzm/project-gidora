import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import { formatPrice } from '@/utils/formatPrice';

export default function OrderSummary({
  items,
  totalItems,
  subtotal,
  shipping,
  total,
  hasUnavailableItems,
}) {
  return (
    <div className="border-border-subtle bg-surface-container-lowest border lg:sticky lg:top-28">
      <div className="border-border-subtle border-b p-6 md:p-7">
        <h2 className="font-headline-lg-mobile text-tertiary-container md:font-headline-lg">
          ORDER SUMMARY
        </h2>
        <p className="font-technical-data text-secondary mt-2">
          {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'} IN YOUR ORDER
        </p>
        {hasUnavailableItems && (
          <p className="font-technical-data text-error mt-3">SOME ITEMS REQUIRE YOUR ATTENTION</p>
        )}
      </div>

      <div data-lenis-prevent className="max-h-[360px] overflow-y-auto overscroll-contain">
        {items.map((item) => (
          <OrderSummaryItem key={item.cartItemKey} item={item} />
        ))}
      </div>

      <div className="border-border-subtle border-t p-6 md:p-7">
        <div className="space-y-4">
          <SummaryRow label="SUBTOTAL" value={formatPrice(subtotal)} />
          <SummaryRow label="SHIPPING" value={formatPrice(shipping.price)} />
        </div>

        <div className="border-border-subtle mt-7 border-t pt-5">
          <div className="flex items-end justify-between gap-4">
            <span className="font-input text-tertiary-container font-bold">TOTAL</span>
            <span className="font-input text-tertiary-container font-bold">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          icon="arrow_forward"
          size="full"
          className="mt-8"
          disabled={hasUnavailableItems}
        >
          PAYMENT METHOD
        </Button>
      </div>
    </div>
  );
}

function OrderSummaryItem({ item }) {
  const unavailable = item.quantity === 0;

  return (
    <div
      className={`border-border-subtle flex items-center gap-4 border-b p-5 last:border-b-0 ${unavailable ? 'opacity-60' : ''}`}
    >
      <div className="bg-surface-container-low h-20 w-16 shrink-0 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-technical-data text-text-muted">NO IMAGE</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link to={`/products/${item.slug}`} className="group inline-block">
          <p className="font-label-caps text-primary group-hover:text-text-muted transition-colors duration-300">
            {item.name}
          </p>
        </Link>
        {item.color && (
          <p className="font-technical-data text-secondary mt-1">
            COLOR: {item.color.toUpperCase()}
          </p>
        )}
        {item.size && (
          <p className="font-technical-data text-secondary">SIZE: {item.size.toUpperCase()}</p>
        )}

        {unavailable ? (
          <p className="font-technical-data text-error mt-2">CURRENTLY UNAVAILABLE</p>
        ) : (
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="font-technical-data text-text-muted">QTY: {item.quantity}</span>
            <span className="font-technical-data text-primary">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-technical-data text-secondary">{label}</span>
      <span className="font-technical-data text-tertiary-container">{value}</span>
    </div>
  );
}

export function UnavailableItemsNotice() {
  return (
    <div className="border-border-subtle bg-surface-container-low mt-6 border p-5">
      <p className="font-label-caps text-primary">STOCK UPDATED</p>
      <p className="font-technical-data text-secondary mt-2 leading-5">
        Some items in your bag are no longer available. Please review your bag before placing the
        order.
      </p>
      <TextButton
        as={Link}
        to="/cart"
        variant="muted"
        icon="arrow_back"
        iconPosition="left"
        animateIcon
        underline={false}
        className="mt-4"
      >
        REVIEW BAG
      </TextButton>
    </div>
  );
}

export function EmptyCheckout() {
  return (
    <div className="bg-surface px-margin-mobile flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <p className="font-headline-lg-mobile text-primary md:font-headline-lg mb-4">
          YOUR BAG IS EMPTY
        </p>
        <p className="font-body-md text-text-muted">
          Add products to your bag before continuing to checkout.
        </p>
        <Link
          to="/products"
          className="border-primary font-label-caps text-primary hover:bg-primary hover:text-on-primary mt-6 inline-flex items-center gap-2 border px-5 py-3 transition-colors"
        >
          EXPLORE COLLECTIONS
        </Link>
      </div>
    </div>
  );
}
