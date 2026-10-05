import { useMemo, useState, useEffect } from 'react';

export default function AdminCustomers({ customers = [], orders: propsOrders }) {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState(propsOrders || []);

  // Ambil data orders dari localStorage jika props orders tidak dikirim/kosong
  useEffect(() => {
    if (!propsOrders || propsOrders.length === 0) {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
        setOrders(savedOrders);
      } catch (err) {
        console.error('Gagal memuat data orders dari localStorage:', err);
      }
    } else {
      setOrders(propsOrders);
    }
  }, [propsOrders]);

  // Hitung total belanja & jumlah order per customer secara dinamis dari data orders
  const enrichedCustomers = useMemo(() => {
    const baseCustomers =
      customers.length > 0
        ? customers
        : Array.from(
            new Map(
              orders.filter((o) => o.customer?.email).map((o) => [o.customer.email, o.customer]),
            ).values(),
          );

    return baseCustomers.map((cust) => {
      const customerOrders = orders.filter(
        (o) =>
          o.customer?.email?.toLowerCase() === cust.email?.toLowerCase() ||
          o.customer?.fullName?.toLowerCase() === cust.fullName?.toLowerCase(),
      );

      const totalSpent = customerOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

      return {
        ...cust,
        id: cust.id || cust.email,
        totalOrders: customerOrders.length,
        totalSpent,
        recentOrders: customerOrders,
      };
    });
  }, [customers, orders]);

  // Filter pencarian berdasarkan nama, email, atau telepon
  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrichedCustomers.filter((cust) => {
      return (
        !query ||
        cust.fullName?.toLowerCase().includes(query) ||
        cust.email?.toLowerCase().includes(query) ||
        cust.phone?.toLowerCase().includes(query)
      );
    });
  }, [enrichedCustomers, search]);

  const hasFilters = search.trim().length > 0;

  return (
    <div className="animate-page-enter w-full space-y-6">
      {/* HEADER */}
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-label-caps text-text-muted flex items-center gap-2">
            <span>MANAGEMENT</span>
            <span className="text-border-subtle">/</span>
            <span>CUSTOMERS</span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <h1 className="font-headline-lg-mobile text-primary md:font-headline-display">
              CUSTOMERS
            </h1>

            <span className="border-border-subtle bg-surface-container-low font-technical-data text-text-muted border px-2 py-1">
              {filteredCustomers.length} / {enrichedCustomers.length}
            </span>
          </div>

          <p className="font-body-md text-text-muted mt-3">
            Manage registered buyer profiles, contact details, and lifetime order history.
          </p>
        </div>
      </header>

      {/* SEARCH BAR SECTION */}
      <section className="border-border-subtle bg-surface-container-lowest relative z-30 mb-6 border p-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 !text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH BY NAME, EMAIL, OR PHONE..."
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

          {hasFilters && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="border-border-subtle font-label-caps text-text-muted hover:text-primary hover:border-primary inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 border px-4 transition-colors"
            >
              <span className="material-symbols-outlined !text-[15px]">restart_alt</span>
              RESET
            </button>
          )}
        </div>
      </section>

      {/* TABLE HEADER COUNT */}
      <div className="mb-3 flex items-center justify-between">
        <p className="font-label-caps text-text-muted">CUSTOMER DIRECTORY</p>
        <p className="font-technical-data text-text-muted">{filteredCustomers.length} RESULTS</p>
      </div>

      {/* DESKTOP TABLE */}
      <section className="border-border-subtle bg-surface-container-lowest relative z-10 hidden border md:block">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr>
              {[
                ['CUSTOMER NAME', 'text-left'],
                ['CONTACT INFO', 'text-left'],
                ['TOTAL ORDERS', 'text-left'],
                ['LIFETIME SPENT', 'text-left'],
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
            {filteredCustomers.map((customer) => (
              <CustomerRow
                key={customer.email || customer.id}
                customer={customer}
                onViewDetail={() => setSelectedCustomer(customer)}
              />
            ))}
          </tbody>
        </table>
      </section>

      {/* MOBILE CARDS */}
      <section className="space-y-3 md:hidden">
        {filteredCustomers.map((customer) => (
          <MobileCustomerCard
            key={customer.email || customer.id}
            customer={customer}
            onViewDetail={() => setSelectedCustomer(customer)}
          />
        ))}
      </section>

      {/* EMPTY STATE */}
      {filteredCustomers.length === 0 && <EmptyState onReset={() => setSearch('')} />}

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   DESKTOP TABLE ROW
========================================================= */
function CustomerRow({ customer, onViewDetail }) {
  return (
    <tr className="border-border-subtle hover:bg-surface-container-low border-b last:border-0">
      <td className="font-technical-data text-primary px-5 py-4 font-medium">
        {customer.fullName || 'Anonymous Customer'}
      </td>
      <td className="px-4 py-4">
        <p className="font-technical-data text-primary">{customer.email || '-'}</p>
        <p className="font-technical-data text-text-muted mt-0.5">{customer.phone || '-'}</p>
      </td>
      <td className="font-technical-data text-text-muted px-4 py-4">
        {customer.totalOrders} <span className="text-xs">Orders</span>
      </td>
      <td className="font-technical-data text-primary px-4 py-4 font-medium">
        Rp {customer.totalSpent.toLocaleString('id-ID')}
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-center gap-2">
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
   MOBILE CUSTOMER CARD
========================================================= */
function MobileCustomerCard({ customer, onViewDetail }) {
  return (
    <article className="border-border-subtle bg-surface-container-lowest space-y-4 border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-technical-data text-primary font-medium">
            {customer.fullName || 'Anonymous Customer'}
          </p>
          <p className="font-technical-data text-text-muted mt-0.5 text-xs">
            {customer.email || '-'}
          </p>
        </div>
        <span className="border-border-subtle bg-surface-container-low font-technical-data text-primary border px-2 py-1 text-xs">
          {customer.totalOrders} Orders
        </span>
      </div>

      <div className="border-border-subtle grid grid-cols-2 gap-3 border-t pt-3">
        <div>
          <p className="font-label text-text-muted">PHONE</p>
          <p className="font-technical-data text-primary mt-0.5 truncate">
            {customer.phone || '-'}
          </p>
        </div>
        <div>
          <p className="font-label text-text-muted">LIFETIME SPENT</p>
          <p className="font-technical-data text-primary mt-0.5">
            Rp {customer.totalSpent.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="border-border-subtle flex justify-center border-t pt-3">
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
   EMPTY STATE
========================================================= */
function EmptyState({ onReset }) {
  return (
    <div className="border-border-subtle bg-surface-container-lowest border px-6 py-20 text-center">
      <span className="material-symbols-outlined text-text-muted !text-[32px]">group_off</span>
      <p className="font-label-caps text-primary mt-4">NO CUSTOMERS FOUND</p>
      <p className="font-body-md text-text-muted mt-2">Try changing your search keywords.</p>
      <button
        type="button"
        onClick={onReset}
        className="border-border-subtle font-label-caps text-primary hover:border-primary mt-5 cursor-pointer border px-4 py-2.5 transition-colors"
      >
        RESET SEARCH
      </button>
    </div>
  );
}

/* =========================================================
   CUSTOMER DETAIL MODAL
========================================================= */
function CustomerDetailModal({ customer, onClose }) {
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
        {/* MODAL HEADER */}
        <div className="border-border-subtle bg-surface-container-lowest flex shrink-0 items-center justify-between border-b p-5">
          <div>
            <p className="font-label-caps text-text-muted">CUSTOMER PROFILE</p>
            <h2 className="font-headline-lg text-primary mt-1">{customer.fullName}</h2>
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

        {/* MODAL BODY */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* PROFILE SUMMARY INFO */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border-border-subtle space-y-2 border p-4">
              <p className="font-label-caps text-primary">CONTACT INFORMATION</p>
              <p className="font-technical-data text-primary">Email: {customer.email || '-'}</p>
              <p className="font-technical-data text-text-muted">Phone: {customer.phone || '-'}</p>
            </div>

            <div className="border-border-subtle space-y-2 border p-4">
              <p className="font-label-caps text-primary">SHIPPING ADDRESS</p>
              <p className="font-technical-data text-primary">
                {customer.address || 'No address recorded'}
              </p>
              <p className="font-technical-data text-text-muted">
                {[customer.city, customer.province, customer.postalCode]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </p>
            </div>
          </div>

          {/* ORDER HISTORY LIST */}
          <div className="border-border-subtle border">
            <div className="border-border-subtle bg-surface-container-low font-label-caps text-text-muted border-b px-4 py-3">
              ORDER HISTORY ({customer.recentOrders?.length || 0})
            </div>
            <div className="divide-border-subtle max-h-60 divide-y overflow-y-auto">
              {customer.recentOrders && customer.recentOrders.length > 0 ? (
                customer.recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="font-technical-data flex items-center justify-between p-4 text-sm"
                  >
                    <div>
                      <p className="text-primary font-medium">{ord.id}</p>
                      <p className="text-text-muted text-xs">
                        {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-medium">
                        Rp {(ord.total || 0).toLocaleString('id-ID')}
                      </p>
                      <span className="text-text-muted border-border-subtle border px-1.5 py-0.5 text-xs uppercase">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="font-technical-data text-text-muted p-4 text-center">
                  No orders recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
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
