import { Link } from 'react-router-dom';

import AdminStatCard from '@/features/admin/components/AdminStatCard';
import { getAdminProducts, getProductStats } from '@/features/admin/services/adminProductService';

import { getOrders } from '@/features/order/orderService';
import { formatPrice } from '@/utils/formatPrice';

export default function AdminDashboard() {
  const products = getAdminProducts();
  const stats = getProductStats();
  const orders = getOrders();

  const revenue = orders.reduce((total, order) => total + Number(order.total || 0), 0);

  return (
    // Diubah menggunakan w-full & space-y-8 agar selaras dengan halaman admin lainnya
    <div className="animate-page-enter w-full space-y-8">
      <header className="mb-10">
        <p className="font-label-caps text-text-muted">CONTROL CENTER</p>

        <h1 className="font-headline-lg-mobile text-primary md:font-headline-display mt-3">
          DASHBOARD
        </h1>

        <p className="font-body-md text-text-muted mt-3 max-w-xl">
          Manage GIDORA products, orders, and customer data.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminStatCard label="PRODUCTS" value={stats.total} icon="inventory_2" />

        <AdminStatCard label="NEW PRODUCTS" value={stats.newProducts} icon="new_releases" />

        <AdminStatCard label="ORDERS" value={orders.length} icon="receipt_long" />

        <AdminStatCard label="REVENUE" value={formatPrice(revenue)} icon="payments" />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 lg:grid-cols-2">
        {/* PRODUCTS LIST */}
        <div className="border-border-subtle bg-surface-container-lowest min-w-0 border">
          <div className="border-border-subtle flex items-center justify-between border-b p-4 sm:p-6">
            <h2 className="font-headline-lg-mobile text-primary">PRODUCTS</h2>

            <Link
              to="/admin/products"
              className="font-label-caps text-text-muted hover:text-primary text-xs sm:text-sm"
            >
              VIEW ALL
            </Link>
          </div>

          <div>
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="border-border-subtle flex items-center justify-between gap-3 border-b p-4 last:border-b-0 sm:p-5"
              >
                {/* Bagian Kiri: Gambar & Info Produk */}
                <div className="flex min-w-0 flex-1 items-center gap-3 pr-2 sm:gap-4">
                  <img
                    src={product.images.primary}
                    alt={product.name}
                    className="h-12 w-10 shrink-0 object-cover sm:h-14 sm:w-12"
                  />

                  {/* Menggunakan flex-1 dan min-w-0 agar teks nama produk bisa turun baris (wrap) jika panjang */}
                  <div className="min-w-0 flex-1">
                    <p className="font-label-caps text-primary line-clamp-2 text-xs break-words sm:text-sm">
                      {product.name}
                    </p>

                    <p className="font-technical-data text-text-muted mt-1 truncate">
                      {product.category}
                    </p>
                  </div>
                </div>

                {/* Bagian Kanan: Harga */}
                <span className="font-technical-data text-primary shrink-0 text-xs sm:text-sm">
                  {formatPrice(product.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ORDERS LIST */}
        <div className="border-border-subtle bg-surface-container-lowest min-w-0 border">
          <div className="border-border-subtle flex items-center justify-between border-b p-4 sm:p-6">
            <h2 className="font-headline-lg-mobile text-primary">RECENT ORDERS</h2>

            <Link
              to="/admin/orders"
              className="font-label-caps text-text-muted hover:text-primary text-xs sm:text-sm"
            >
              VIEW ALL
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-label-caps text-text-muted">NO ORDERS YET</p>
            </div>
          ) : (
            orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                /* Diubah jadi flex-col di mobile, berubah jadi flex-row di layar sm (tablet/desktop) */
                className="border-border-subtle hover:bg-surface-container-low flex min-w-0 flex-col justify-between gap-2 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <div className="min-w-0">
                  <p className="font-technical-data text-primary truncate">{order.id}</p>

                  <p className="font-technical-data text-text-muted mt-0.5 truncate sm:mt-1">
                    {order.customer.fullName}
                  </p>
                </div>

                <div className="border-border-subtle flex shrink-0 items-center justify-between border-t pt-2 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0">
                  <p className="font-technical-data text-primary text-xs sm:text-sm">
                    {formatPrice(order.total)}
                  </p>

                  <p className="font-label-caps text-text-muted mt-0.5 text-[10px] sm:mt-1 sm:text-xs">
                    {order.status}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
