import { useMemo, useState } from 'react';
import { getOrders, saveOrders, updateOrderStatus } from '../../features/order/orderService';

export default function AdminOrders() {
  const [orders, setOrders] = useState(() => getOrders());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status pesanan yang tersedia
  const statuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  // Filter dan pencarian data order
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.fullName.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const hasFilters = search.trim() || statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  // Fungsi untuk mengubah status pesanan
  const handleUpdateStatus = (orderId, newStatus) => {
    let updated;
    if (typeof updateOrderStatus === 'function') {
      updated = updateOrderStatus(orderId, newStatus);
    } else {
      updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      if (typeof saveOrders === 'function') {
        saveOrders(updated);
      }
    }

    setOrders(updated);

    // REVISI DI SINI: Ambil data order yang benar-benar baru dari array 'updated'
    if (selectedOrder && selectedOrder.id === orderId) {
      const latestOrder = updated.find((o) => o.id === orderId);
      if (latestOrder) {
        setSelectedOrder(latestOrder);
      }
    }
  };

  return (
    <div className="animate-page-enter w-full space-y-6">
      {/* HEADER */}
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-label-caps text-text-muted flex items-center gap-2">
            <span>MANAGEMENT</span>
            <span className="text-border-subtle">/</span>
            <span>ORDERS</span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <h1 className="font-headline-lg-mobile text-primary md:font-headline-display">
              ORDERS
            </h1>

            <span className="border-border-subtle bg-surface-container-low font-technical-data text-text-muted border px-2 py-1">
              {filteredOrders.length} / {orders.length}
            </span>
          </div>

          <p className="font-body-md text-text-muted mt-3">
            Monitor customer transactions, fulfillment statuses, and shipping destinations.
          </p>
        </div>
      </header>

      {/* FILTERS */}
      <section className="border-border-subtle bg-surface-container-lowest relative z-30 mb-6 border">
        <div className="border-border-subtle flex items-center justify-between border-b px-4 py-3 md:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center">
              <span className="material-symbols-outlined !text-[17px]">filter_list</span>
            </span>
            <div>
              <p className="font-label-caps text-primary">FILTERS</p>
              <p className="font-technical-data text-text-muted">Refine customer orders</p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="font-label-caps text-text-muted hover:text-primary inline-flex cursor-pointer items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined !text-[15px]">restart_alt</span>
              CLEAR
            </button>
          )}
        </div>

        <div className="bg-border-subtle grid gap-px md:grid-cols-3">
          {/* SEARCH */}
          <div className="bg-surface-container-lowest p-4 md:col-span-2">
            <label className="font-label-caps text-text-muted mb-2 block">SEARCH</label>
            <div className="relative">
              <span className="material-symbols-outlined text-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 !text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ORDER ID, CUSTOMER NAME, OR EMAIL"
                className="border-border-subtle bg-surface font-technical-data text-primary placeholder:text-text-muted focus:border-primary h-11 w-full border pr-10 pl-10 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="text-text-muted hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                >
                  <span className="material-symbols-outlined !text-[17px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* STATUS DROPDOWN */}
          <FilterDropdown
            label="STATUS"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'ALL STATUS' },
              ...statuses.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>
      </section>

      {/* TABLE HEADER COUNT */}
      <div className="mb-3 flex items-center justify-between">
        <p className="font-label-caps text-text-muted">TRANSACTION LOG</p>
        <p className="font-technical-data text-text-muted">{filteredOrders.length} RESULTS</p>
      </div>

      {/* DESKTOP TABLE */}
      <section className="border-border-subtle bg-surface-container-lowest relative z-10 hidden border md:block">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr>
              {[
                ['ORDER ID', 'text-left'],
                ['CUSTOMER', 'text-left'],
                ['DATE', 'text-left'],
                ['QUANTITY', 'text-left'],
                ['TOTAL', 'text-left'],
                ['STATUS', 'text-left'],
                ['ACTION', 'text-center'],
              ].map(([label, align]) => (
                <th
                  key={label}
                  className={`border-border-subtle bg-surface-container-low font-label-caps text-text-muted sticky top-16 z-20 border-b px-4 py-3.5 ${
                    align ?? 'text-left'
                  }`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <OrderRow key={order.id} order={order} onViewDetail={() => setSelectedOrder(order)} />
            ))}
          </tbody>
        </table>
      </section>

      {/* MOBILE CARDS */}
      <section className="space-y-3 md:hidden">
        {filteredOrders.map((order) => (
          <MobileOrderCard
            key={order.id}
            order={order}
            onViewDetail={() => setSelectedOrder(order)}
          />
        ))}
      </section>

      {/* EMPTY STATE */}
      {filteredOrders.length === 0 && <EmptyState onReset={resetFilters} />}

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

/* =========================================================
   FILTER DROPDOWN COMPONENT
========================================================= */
function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="bg-surface-container-lowest relative p-4">
      <label className="font-label-caps text-text-muted mb-2 block">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((c) => !c)}
        className={`bg-surface font-technical-data flex h-11 w-full cursor-pointer items-center justify-between border px-3 text-left transition-colors outline-none ${
          open || value !== 'all'
            ? 'border-primary text-primary'
            : 'border-border-subtle text-text-muted'
        }`}
      >
        <span>{selected?.label}</span>
        <span
          className={`material-symbols-outlined !text-[18px] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close dropdown"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="border-border-subtle bg-surface-container-lowest absolute top-[78px] right-4 left-4 z-20 border py-1 shadow-lg">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`font-technical-data flex w-full cursor-pointer items-center justify-between px-3 py-3 text-left transition-colors ${
                    active
                      ? 'bg-surface-container text-primary'
                      : 'text-text-muted hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  {opt.label}
                  {active && <span className="material-symbols-outlined !text-[17px]">check</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   DESKTOP TABLE ROW
========================================================= */
function OrderRow({ order, onViewDetail }) {
  const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <tr className="border-border-subtle hover:bg-surface-container-low border-b last:border-0">
      <td className="font-technical-data text-primary px-5 py-4 font-medium">{order.id}</td>
      <td className="px-4 py-4">
        <p className="font-label-caps text-primary">{order.customer.fullName}</p>
        <p className="font-technical-data text-text-muted mt-0.5">{order.customer.email}</p>
      </td>
      <td className="font-technical-data text-text-muted px-4 py-4">{formattedDate}</td>
      <td className="font-technical-data text-text-muted px-4 py-4">
        {totalItemsCount} <span>Items</span>
      </td>
      <td className="font-technical-data text-primary px-4 py-4 font-medium">
        Rp {order.total.toLocaleString('id-ID')}
      </td>
      <td className="px-4 py-4">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onViewDetail}
            className="border-border-subtle font-label-caps text-text-muted hover:border-primary hover:bg-primary hover:text-on-primary inline-flex h-9 cursor-pointer items-center gap-1.5 border px-3 transition-colors"
          >
            <span className="material-symbols-outlined !text-[15px]">visibility</span>
            DETAILS
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE ORDER CARD
========================================================= */
function MobileOrderCard({ order, onViewDetail }) {
  const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="border-border-subtle bg-surface-container-lowest space-y-4 border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-technical-data text-primary font-medium">{order.id}</p>
          <p className="font-label-caps text-text-muted mt-0.5">{order.customer.fullName}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border-border-subtle grid grid-cols-2 gap-3 border-t pt-3">
        <div>
          <p className="font-label text-text-muted">DATE</p>
          <p className="font-technical-data text-primary mt-0.5">{formattedDate}</p>
        </div>
        <div>
          <p className="font-label text-text-muted">TOTAL</p>
          <p className="font-technical-data text-primary mt-0.5">
            Rp {order.total.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="border-border-subtle flex items-center justify-between border-t pt-3">
        <span className="font-technical-data text-text-muted">
          {totalItemsCount} Products purchased
        </span>
        <button
          type="button"
          onClick={onViewDetail}
          className="border-border-subtle font-label-caps text-primary hover:border-primary inline-flex h-9 cursor-pointer items-center gap-1.5 border px-4 transition-colors"
        >
          VIEW DETAILS
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */
function OrderStatusBadge({ status }) {
  const styles = {
    CONFIRMED: 'border-secondary bg-secondary-container text-on-secondary-container',
    PROCESSING: 'border-border-subtle bg-surface-container text-primary',
    SHIPPED: 'border-primary bg-primary text-on-primary',
    DELIVERED: 'border-secondary bg-secondary text-on-secondary',
    CANCELLED: 'border-error bg-error-container text-on-error-container',
  };

  return (
    <span
      className={`font-label-caps inline-flex items-center gap-1.5 border px-2.5 py-1 ${
        styles[status] || 'border-border-subtle bg-surface-container-low text-text-muted'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */
function EmptyState({ onReset }) {
  return (
    <div className="border-border-subtle bg-surface-container-lowest border px-6 py-20 text-center">
      <span className="material-symbols-outlined text-text-muted !text-[32px]">receipt_long</span>
      <p className="font-label-caps text-primary mt-4">NO ORDERS FOUND</p>
      <p className="font-body-md text-text-muted mt-2">
        Try changing your search terms or status filter.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="border-border-subtle font-label-caps text-primary hover:border-primary mt-5 cursor-pointer border px-4 py-2.5 transition-colors"
      >
        RESET FILTERS
      </button>
    </div>
  );
}

/* =========================================================
   ORDER DETAIL MODAL (Safe from header overlap)
========================================================= */
function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const statuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const handleSelectStatus = (newStatus) => {
    setCurrentStatus(newStatus);
    onUpdateStatus(order.id, newStatus);
    setStatusDropdownOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 pt-20 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        data-lenis-prevent
        className="border-border-subtle bg-surface-container-lowest relative my-auto flex max-h-[calc(100vh-7rem)] w-full max-w-2xl flex-col overflow-hidden border shadow-2xl md:max-h-[85vh]"
      >
        {/* MODAL HEADER (STICKY) */}
        <div className="border-border-subtle bg-surface-container-lowest flex shrink-0 items-center justify-between border-b p-5">
          <div>
            <p className="font-label-caps text-text-muted">TRANSACTION DETAILS</p>
            <h2 className="font-headline-lg text-primary mt-1">{order.id}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-primary cursor-pointer p-1 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined !text-[19px]">close</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* CUSTOM STATUS SELECTOR */}
          <div className="border-border-subtle bg-surface-container-low flex flex-col justify-between gap-4 border p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-label-caps text-primary">ORDER STATUS</p>
              <p className="font-technical-data text-text-muted">Update order progression state</p>
            </div>

            <div className="relative w-full sm:w-56">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen((prev) => !prev)}
                className="border-border-subtle bg-surface font-label-caps text-primary hover:border-primary flex h-11 w-full cursor-pointer items-center justify-between border px-4 transition-colors outline-none"
              >
                <span className="flex items-center gap-2">
                  <span className="bg-primary h-2 w-2 rounded-full" />
                  {currentStatus}
                </span>
                <span
                  className={`material-symbols-outlined !text-[18px] transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`}
                >
                  expand_more
                </span>
              </button>

              {statusDropdownOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close status menu"
                    className="fixed inset-0 z-20 cursor-default"
                    onClick={() => setStatusDropdownOpen(false)}
                  />
                  <div className="border-border-subtle bg-surface-container-lowest absolute top-12 right-0 left-0 z-30 border py-1 shadow-xl">
                    {statuses.map((s) => {
                      const active = s === currentStatus;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSelectStatus(s)}
                          className={`font-label-caps flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left transition-colors ${
                            active
                              ? 'bg-surface-container text-primary'
                              : 'text-text-muted hover:bg-surface-container-low hover:text-primary'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-primary' : 'bg-text-muted'}`}
                            />
                            {s}
                          </span>
                          {active && (
                            <span className="material-symbols-outlined !text-[16px]">check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CUSTOMER & SHIPPING INFO */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border-border-subtle space-y-2 border p-4">
              <p className="font-label-caps text-primary">CUSTOMER DATA</p>
              <p className="font-technical-data text-primary font-medium">
                {order.customer.fullName}
              </p>
              <p className="font-technical-data text-text-muted">Email: {order.customer.email}</p>
              <p className="font-technical-data text-text-muted">
                Phone: {order.customer.phone || '-'}
              </p>
            </div>

            <div className="border-border-subtle space-y-2 border p-4">
              <p className="font-label-caps text-primary">SHIPPING DESTINATION</p>
              <p className="font-technical-data text-primary">{order.customer.address || '-'}</p>
              <p className="font-technical-data text-text-muted">
                {order.customer.city || ''}, {order.customer.province || ''}{' '}
                {order.customer.postalCode || ''}
              </p>
              <p className="font-technical-data text-text-muted pt-1">
                Courier: <span className="text-primary">{order.shipping?.label || 'Standard'}</span>
              </p>
            </div>
          </div>

          {/* ORDER ITEMS LIST */}
          <div className="border-border-subtle border">
            <div className="border-border-subtle bg-surface-container-low font-label-caps text-text-muted border-b px-4 py-3">
              PURCHASED ITEMS ({order.items?.length || 0})
            </div>
            <div className="divide-border-subtle divide-y">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || item.title}
                      className="border-border-subtle h-16 w-14 shrink-0 border object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-label-caps text-primary truncate">
                      {item.name || item.title}
                    </p>
                    <p className="font-technical-data text-text-muted mt-1">
                      Size: {item.size || '-'} | Color: {item.color || '-'} | Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="font-technical-data text-primary text-right font-medium">
                    Rp {((item.price || item.price || 0) * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="border-border-subtle bg-surface-container-low space-y-2 border p-4">
            <div className="font-technical-data text-text-muted flex justify-between">
              <span>Subtotal</span>
              <span>
                Rp{' '}
                {order.subtotal?.toLocaleString('id-ID') ||
                  order.total?.toLocaleString('id-ID') ||
                  0}
              </span>
            </div>
            <div className="font-technical-data text-text-muted flex justify-between">
              <span>Shipping Fee ({order.shipping?.label || 'Standard'})</span>
              <span>Rp {order.shipping?.price?.toLocaleString('id-ID') || 0}</span>
            </div>
            <div className="border-border-subtle font-technical-data text-primary flex justify-between border-t pt-2 text-base font-bold">
              <span>Total Payment</span>
              <span>Rp {order.total?.toLocaleString('id-ID') || 0}</span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER (STICKY) */}
        <div className="border-border-subtle bg-surface-container-low flex shrink-0 justify-end border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="border-border-subtle font-label-caps text-primary hover:border-primary bg-surface h-11 cursor-pointer border px-6 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
