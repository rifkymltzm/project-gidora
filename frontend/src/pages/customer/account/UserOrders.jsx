import { useMemo, useState } from 'react';

import AccountLayout from '../../../layouts/AccountLayout';
import Select from '../../../components/ui/Select';
import TextButton from '../../../components/ui/TextButton';

const initialOrders = [
  {
    id: 'ORD-2026-00124',
    date: '2026-08-24',
    status: 'delivered',
    items: [
      {
        id: 1,
        name: 'Essential Oversized Shirt',
        variant: 'Black / M',
        quantity: 1,
        price: 549000,
        image: null,
      },
      {
        id: 2,
        name: 'Relaxed Trousers',
        variant: 'Charcoal / M',
        quantity: 1,
        price: 699000,
        image: null,
      },
    ],
    shipping: 25000,
  },
  {
    id: 'ORD-2026-00117',
    date: '2026-08-16',
    status: 'shipped',
    items: [
      {
        id: 3,
        name: 'Heavyweight Basic Tee',
        variant: 'White / L',
        quantity: 2,
        price: 329000,
        image: null,
      },
    ],
    shipping: 25000,
  },
  {
    id: 'ORD-2026-00098',
    date: '2026-08-04',
    status: 'processing',
    items: [
      {
        id: 4,
        name: 'Structured Overshirt',
        variant: 'Olive / M',
        quantity: 1,
        price: 789000,
        image: null,
      },
    ],
    shipping: 0,
  },
  {
    id: 'ORD-2026-00071',
    date: '2026-07-21',
    status: 'cancelled',
    items: [
      {
        id: 5,
        name: 'Classic Oxford Shirt',
        variant: 'Blue / M',
        quantity: 1,
        price: 649000,
        image: null,
      },
    ],
    shipping: 25000,
  },
];

const filters = [
  { value: 'all', label: 'ALL' },
  { value: 'processing', label: 'PROCESSING' },
  { value: 'shipped', label: 'SHIPPED' },
  { value: 'delivered', label: 'DELIVERED' },
  { value: 'cancelled', label: 'CANCELLED' },
];

const statusConfig = {
  processing: {
    label: 'PROCESSING',
    icon: 'schedule',
  },
  shipped: {
    label: 'SHIPPED',
    icon: 'local_shipping',
  },
  delivered: {
    label: 'DELIVERED',
    icon: 'check_circle',
  },
  cancelled: {
    label: 'CANCELLED',
    icon: 'cancel',
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));

const getOrderTotal = (order) =>
  order.items.reduce((total, item) => total + item.price * item.quantity, 0) + order.shipping;

const getItemCount = (order) => order.items.reduce((total, item) => total + item.quantity, 0);

export default function UserOrders() {
  const [orders] = useState(initialOrders);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;

    return orders.filter((order) => order.status === activeFilter);
  }, [orders, activeFilter]);

  const toggleOrder = (id) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  return (
    <AccountLayout
      title="ORDER HISTORY"
      description="View your previous orders and track your latest purchases."
    >
      <section className="py-6 md:py-10">
        {/* TOOLBAR */}
        <div className="border-border-subtle border-b pb-6 sm:pb-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            {/* TITLE */}
            <div className="min-w-0">
              <p className="font-label-caps text-text-muted">YOUR ORDERS</p>

              <p className="font-body-md text-on-surface-variant mt-1.5">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} in your account.
              </p>
            </div>

            {/* FILTER */}
            <div className="w-full sm:w-[240px]">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-label-caps text-on-surface-variant">FILTER ORDERS</span>

                <span className="font-technical-data text-text-muted">
                  {filteredOrders.length} RESULTS
                </span>
              </div>

              <div className="mt-1">
                <Select
                  id="order-status-filter"
                  value={activeFilter}
                  onChange={setActiveFilter}
                  options={filters}
                />
              </div>
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {filteredOrders.length === 0 ? (
          <div className="px-4 py-16 text-center sm:py-20">
            <span
              className="material-symbols-outlined text-text-muted !text-[32px]"
              aria-hidden="true"
            >
              receipt_long
            </span>

            <h2 className="font-headline-lg-mobile text-on-surface mt-4">NO ORDERS FOUND</h2>

            <p className="font-body-md text-on-surface-variant mx-auto mt-2 max-w-sm">
              There are no orders matching the selected status.
            </p>

            {activeFilter !== 'all' && (
              <TextButton
                variant="primary"
                icon="arrow_forward"
                animateIcon
                onClick={() => setActiveFilter('all')}
                className="mt-6"
              >
                VIEW ALL ORDERS
              </TextButton>
            )}
          </div>
        ) : (
          <div className="divide-border-subtle divide-y">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const status = statusConfig[order.status];
              const orderTotal = getOrderTotal(order);
              const itemCount = getItemCount(order);

              return (
                <article key={order.id} className="py-6 sm:py-7 md:py-8">
                  {/* ORDER SUMMARY */}
                  <button
                    type="button"
                    onClick={() => toggleOrder(order.id)}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} order ${order.id}`}
                    className="group w-full cursor-pointer text-left"
                  >
                    {/* MOBILE */}
                    <div className="flex flex-col gap-4 sm:hidden">
                      {/* TOP */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-label text-text-muted">ORDER</p>

                          <p className="font-technical-data text-on-surface mt-1.5 truncate">
                            {order.id}
                          </p>
                        </div>

                        <span
                          className={`material-symbols-outlined text-on-surface shrink-0 !text-[20px] transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        >
                          expand_more
                        </span>
                      </div>

                      {/* BOTTOM */}
                      <div className="flex items-end justify-between gap-4">
                        <div className="flex min-w-0 flex-col gap-2">
                          <span className="font-technical-data text-text-muted">
                            {formatDate(order.date)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-secondary !text-[16px] leading-none"
                              aria-hidden="true"
                            >
                              {status.icon}
                            </span>

                            <span className="font-label-caps text-secondary leading-none">
                              {status.label}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-label text-text-muted">TOTAL</p>

                          <p className="font-technical-data text-on-surface mt-1.5 whitespace-nowrap">
                            {formatCurrency(orderTotal)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden grid-cols-[minmax(0,1fr)_auto] gap-x-10 gap-y-4 sm:grid">
                      {/* ORDER */}
                      <div className="min-w-0">
                        <p className="font-label text-text-muted">ORDER</p>

                        <p className="font-technical-data text-on-surface mt-1.5 truncate">
                          {order.id}
                        </p>
                      </div>

                      {/* TOTAL */}
                      <div className="row-span-2 flex items-end gap-4">
                        <div className="text-right">
                          <p className="font-label text-text-muted">TOTAL</p>

                          <p className="font-technical-data text-on-surface mt-1.5 whitespace-nowrap">
                            {formatCurrency(orderTotal)}
                          </p>
                        </div>

                        <span
                          className={`material-symbols-outlined text-on-surface !text-[20px] transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        >
                          expand_more
                        </span>
                      </div>

                      {/* META */}
                      <div className="flex items-center gap-8">
                        <span className="font-technical-data text-text-muted">
                          {formatDate(order.date)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className="material-symbols-outlined text-secondary !text-[16px] leading-none"
                            aria-hidden="true"
                          >
                            {status.icon}
                          </span>

                          <span className="font-label-caps text-secondary leading-none">
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* EXPANDED CONTENT */}
                  {isExpanded && (
                    <div className="border-border-subtle mt-6 border-t pt-5 sm:mt-8 sm:pt-7">
                      {/* PRODUCTS */}
                      <div>
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="border-border-subtle flex gap-3.5 border-b py-4 first:pt-0 last:border-b-0 sm:gap-5 sm:py-5"
                          >
                            {/* IMAGE */}
                            <div className="bg-surface-container h-[76px] w-[60px] shrink-0 sm:h-24 sm:w-20">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <span
                                    className="material-symbols-outlined text-text-muted !text-[20px]"
                                    aria-hidden="true"
                                  >
                                    image
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* INFO */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                <div className="min-w-0">
                                  <h3 className="font-body-md text-on-surface leading-snug">
                                    {item.name}
                                  </h3>

                                  <p className="font-technical-data text-text-muted mt-1">
                                    {item.variant}
                                  </p>
                                </div>

                                <p className="font-technical-data text-on-surface shrink-0">
                                  {formatCurrency(item.price)}
                                </p>
                              </div>

                              <p className="font-technical-data text-text-muted mt-2">
                                QTY {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* FOOTER */}
                      <div className="border-border-subtle mt-5 border-t pt-5 sm:mt-6 sm:pt-6">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <div className="font-technical-data text-text-muted flex flex-wrap gap-x-6 gap-y-1.5">
                              <span>
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                              </span>

                              <span>
                                Shipping{' '}
                                {order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}
                              </span>
                            </div>

                            <div className="mt-2.5 flex items-baseline gap-3">
                              <span className="font-label text-text-muted">TOTAL</span>

                              <span className="font-technical-data text-on-surface">
                                {formatCurrency(orderTotal)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                            {order.status === 'delivered' && (
                              <TextButton variant="primary" animateUnderline>
                                BUY AGAIN
                              </TextButton>
                            )}

                            <TextButton
                              variant="muted"
                              icon="arrow_forward"
                              iconPosition="right"
                              animateIcon
                              underline={false}
                              className="[&::after]:!bottom-[-1px]"
                            >
                              VIEW DETAILS
                            </TextButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AccountLayout>
  );
}
