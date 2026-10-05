import { Link, useParams } from 'react-router-dom';

import Button from '@/components/ui/Button';

import { getOrder } from '@/features/order/orderService';
import { formatPrice } from '@/utils/formatPrice';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const order = getOrder(orderId);

  if (!order) {
    return <OrderNotFound />;
  }

  const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);

  // Fungsi helper untuk teks dinamis berdasarkan status (tanpa ubah warna)
  const getHeaderConfig = (status) => {
    const normalizedStatus = status?.toLowerCase() || '';

    switch (normalizedStatus) {
      case 'pending payment':
      case 'waiting for payment':
        return {
          pretitle: 'PAYMENT REQUIRED',
          title: 'COMPLETE YOUR PAYMENT',
          description:
            'Your order has been created. Please complete the payment process before the time limit expires.',
          accentClass: 'text-warning-muted',
        };
      case 'failed':
      case 'cancelled':
        return {
          pretitle: 'ORDER FAILED',
          title: 'ORDER WAS NOT SUCCESSFUL',
          description:
            'Unfortunately, this order could not be completed or has been cancelled. Please try placing a new order.',
          accentClass: 'text-error', // Menggunakan warna error bawaan theme (--color-error)
        };
      case 'success':
      case 'completed':
      default:
        return {
          pretitle: 'ORDER CONFIRMED',
          title: 'THANK YOU FOR YOUR ORDER',
          description:
            'Your order has been successfully placed. We have received your order details and will process it shortly.',
          accentClass: 'text-tertiary-container', // Warna default yang solid
        };
    }
  };

  const headerContent = getHeaderConfig(order.status);

  return (
    <main className="bg-surface min-h-[100svh] pt-16 md:pt-18">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14">
        {/* Header Dinamis tanpa ganti warna */}
        <header className="border-border-subtle border-b pb-8">
          <p className="font-technical-data text-text-muted font-semibold">
            {headerContent.pretitle}
          </p>

          <h1
            className={`font-headline-lg-mobile md:font-headline-display mt-3 ${headerContent.accentClass}`}
          >
            {headerContent.title}
          </h1>

          <p className="font-body-md text-text-muted mt-4 max-w-xl">{headerContent.description}</p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Kolom Kiri: Produk & Total */}
          <section className="lg:col-span-7">
            <div className="border-border-subtle bg-surface-container-lowest border">
              <OrderHeader order={order} />

              <div data-lenis-prevent className="max-h-[283px] overflow-y-auto overscroll-contain">
                {order.items.map((item) => (
                  <OrderItem key={item.cartItemKey} item={item} />
                ))}
              </div>

              <OrderTotals order={order} totalItems={totalItems} />
            </div>
          </section>

          {/* Kolom Kanan: Shipping Details + Order Actions */}
          <aside className="flex flex-col gap-6 lg:col-span-5">
            <ShippingDetails order={order} />
            <OrderActions />
          </aside>
        </div>
      </div>
    </main>
  );
}

function OrderHeader({ order }) {
  return (
    <div className="border-border-subtle border-b p-6 md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Kolom Kiri: Dibikin 2 kolom kecil lagi secara horizontal */}
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <div>
            <p className="font-label-caps text-tertiary-container text-[12px]">ORDER NUMBER</p>
            <p className="font-technical-data text-secondary mt-1">{order.id}</p>
          </div>
          <div className="bg-border-subtle hidden h-8 w-[1px] sm:block" />{' '}
          {/* Garis vertikal pemisah */}
          <div>
            <p className="font-label-caps text-tertiary-container text-[12px]">PAYMENT METHOD</p>
            <p className="font-technical-data text-secondary mt-1">
              {order.paymentMethod.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <span className="border-primary font-label-caps text-tertiary-container inline-block border px-3 py-1">
            {order.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderTotals({ order, totalItems }) {
  return (
    <div className="border-border-subtle border-t p-6 md:p-7">
      <div className="space-y-2">
        <SummaryRow label={`TOTAL ITEMS ( ${totalItems} )`} value={formatPrice(order.subtotal)} />

        <SummaryRow
          label={`SHIPPING — ${order.shipping.label}`}
          value={formatPrice(order.shipping.price)}
        />
      </div>

      <div className="border-border-subtle mt-7 border-t pt-5">
        <div className="flex items-end justify-between gap-4">
          <span className="font-technical-data text-tertiary-container font-bold">TOTAL</span>

          <span className="font-technical-data text-tertiary-container text-[15px] font-bold">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderItem({ item }) {
  const productId = item.slug;

  const variantDetails = [
    item.color && `COLOR : ${item.color.toUpperCase()}`,
    item.size && `SIZE : ${item.size.toUpperCase()}`,
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    <div className="border-border-subtle flex gap-4 border-b p-5 last:border-b-0">
      {/* Gambar Produk dengan ukuran proporsional (h-24 w-20) */}
      <div className="bg-surface-container-low border-border-subtle h-24 w-20 shrink-0 overflow-hidden border">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-1 text-center">
            <span className="font-technical-data text-text-muted text-[10px]">NO IMAGE</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <Link to={`/products/${productId}`} className="group">
            <p className="font-label-caps text-primary group-hover:text-text-muted text-[12px] transition-colors">
              {item.name}
            </p>
          </Link>
        </div>

        <div className="font-technical-data text-secondary mt-2 space-y-0.5 text-[12px]">
          {variantDetails && <p>{variantDetails}</p>}
          {item.sku && (
            <p>
              <span className="text-tertiary-container">SKU :</span> {item.sku.toUpperCase()}
            </p>
          )}
        </div>

        <div className="border-border-subtle mt-2 flex items-center justify-between border-t border-dashed pt-2">
          <span className="font-technical-data text-secondary">
            <span className="text-tertiary-container">QTY:</span> {item.quantity}
          </span>
          <span className="font-technical-data text-tertiary-container font-semibold">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ShippingDetails({ order }) {
  const { customer, shipping } = order;

  const fullAddress = [
    customer.address,
    customer.village && `Kel. ${customer.village}`,
    customer.district && `Kec. ${customer.district}`,
    customer.city,
    customer.province,
    customer.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="border-border-subtle bg-surface-container-lowest border">
      <div className="border-border-subtle border-b p-6 md:p-7">
        <h2 className="font-headline-lg-mobile text-tertiary-container md:font-headline-lg">
          SHIPPING DETAILS
        </h2>
      </div>

      <div className="space-y-6 p-6 md:p-7">
        {/* Contact Information */}
        <div className="flex flex-col gap-1">
          <p className="font-label-caps text-tertiary-container text-[12px]">CONTACT</p>
          <p className="font-input text-secondary mt-1 font-medium">{customer.fullName}</p>
          <p className="font-input text-secondary text-sm">{customer.email}</p>
          <p className="font-input text-secondary text-sm">{customer.phone}</p>
        </div>

        {/* Delivery Address */}
        <div className="border-border-subtle border-t pt-6">
          <p className="font-label-caps text-tertiary-container text-[12px]">DELIVERY ADDRESS</p>
          <p className="font-input text-secondary mt-2 leading-relaxed">{fullAddress}</p>
        </div>

        {/* Shipping Method */}
        <div className="border-border-subtle border-t pt-6">
          <p className="font-label-caps text-tertiary-container text-[12px]">SHIPPING METHOD</p>
          <p className="font-technical-data text-secondary mt-2 font-semibold">{shipping.label}</p>
          {shipping.description && (
            <p className="font-input text-text-muted mt-0.5 text-sm">{shipping.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        as={Link}
        to="/"
        variant="primary"
        icon="home"
        iconPosition="left"
        size="lg"
        className="w-full justify-center"
      >
        BACK TO HOME
      </Button>

      <Button
        as={Link}
        to="/products"
        variant="secondary"
        icon="shopping_bag"
        size="lg"
        className="w-full justify-center"
      >
        CONTINUE SHOPPING
      </Button>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-label-caps text-secondary">{label}</span>

      <span className="font-technical-data text-tertiary-container">{value}</span>
    </div>
  );
}

function OrderNotFound() {
  return (
    <main className="bg-surface px-margin-mobile flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <p className="font-headline-lg-mobile text-tertiary-container md:font-headline-lg">
          ORDER NOT FOUND
        </p>

        <p className="font-body-md text-text-muted mt-3 mb-4">
          This order may no longer be available.
        </p>

        <Button as={Link} to="/products" variant="secondary" icon="shopping_bag_speed" size="lg">
          CONTINUE SHOPPING
        </Button>
      </div>
    </main>
  );
}
