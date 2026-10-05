import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';

import { getAdminProducts } from '../../features/admin/services/adminProductService';
import { formatPrice } from '@/utils/formatPrice';

export default function AdminProducts() {
  const products = getAdminProducts();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [gender, setGender] = useState('all');
  const [stockProduct, setStockProduct] = useState(null);

  const categories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (category === 'all' || product.category === category) &&
        (gender === 'all' || product.gender === gender)
      );
    });
  }, [products, search, category, gender]);

  const hasFilters = search.trim() || category !== 'all' || gender !== 'all';

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setGender('all');
  };

  return (
    <div className="animate-page-enter w-full space-y-6">
      {/* HEADER */}

      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-label-caps text-text-muted flex items-center gap-2">
            <span>CATALOG</span>
            <span className="text-border-subtle">/</span>
            <span>PRODUCTS</span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <h1 className="font-headline-lg-mobile text-primary md:font-headline-display">
              PRODUCTS
            </h1>

            <span className="border-border-subtle bg-surface-container-low font-technical-data text-text-muted border px-2 py-1">
              {filteredProducts.length} / {products.length}
            </span>
          </div>

          <p className="font-body-md text-text-muted mt-3">
            Manage your product catalog, inventory status and product details.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="bg-primary font-label-caps text-on-primary hover:bg-surface-tint inline-flex h-12 items-center justify-center gap-2 px-5 transition-colors"
        >
          <span className="material-symbols-outlined !text-[17px]">add</span>
          ADD PRODUCT
        </Link>
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
              <p className="font-technical-data text-text-muted">Refine product catalog</p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="font-label-caps text-text-muted hover:text-primary inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined !text-[15px]">restart_alt</span>
              CLEAR
            </button>
          )}
        </div>

        <div className="bg-border-subtle grid gap-px md:grid-cols-4">
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="NAME OR PRODUCT SKU"
                className="border-border-subtle bg-surface font-technical-data text-primary placeholder:text-text-muted focus:border-primary h-11 w-full border pr-10 pl-10 outline-none"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="text-text-muted hover:text-primary absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <span className="material-symbols-outlined !text-[17px]">close</span>
                </button>
              )}
            </div>
          </div>

          <FilterDropdown
            label="CATEGORY"
            value={category}
            onChange={setCategory}
            options={[
              { value: 'all', label: 'ALL CATEGORIES' },
              ...categories.map((item) => ({
                value: item,
                label: item.toUpperCase(),
              })),
            ]}
          />

          <FilterDropdown
            label="GENDER"
            value={gender}
            onChange={setGender}
            options={[
              { value: 'all', label: 'ALL GENDER' },
              { value: 'men', label: 'MEN' },
              { value: 'women', label: 'WOMEN' },
              { value: 'unisex', label: 'UNISEX' },
            ]}
          />
        </div>
      </section>

      {/* TABLE HEADER */}

      <div className="mb-3 flex items-center justify-between">
        <p className="font-label-caps text-text-muted">PRODUCT DIRECTORY</p>
        <p className="font-technical-data text-text-muted">{filteredProducts.length} RESULTS</p>
      </div>

      {/* DESKTOP */}

      <section className="border-border-subtle bg-surface-container-lowest relative z-10 hidden border md:block">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr>
              {[
                ['PRODUCT', 'text-left'],
                ['PRICE', 'text-left'],
                ['CATEGORY', 'text-left'],
                ['GENDER', 'text-left'],
                ['STATUS', 'text-left'],
                ['STOCK', 'text-left'],
                ['ACTION', 'text-center'],
              ].map(([label, align]) => (
                <th
                  key={label}
                  className={`border-border-subtle bg-surface-container-low font-label-caps text-text-muted sticky top-16 z-20 border-b px-4 py-3.5 ${align ?? 'text-left'} `}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onUpdateStock={() => setStockProduct(product)}
              />
            ))}
          </tbody>
        </table>
      </section>

      {/* MOBILE */}

      <section className="space-y-3 md:hidden">
        {filteredProducts.map((product) => (
          <MobileProductCard
            key={product.id}
            product={product}
            onUpdateStock={() => setStockProduct(product)}
          />
        ))}
      </section>

      {/* EMPTY */}

      {filteredProducts.length === 0 && <EmptyState onReset={resetFilters} />}

      {/* MODAL */}

      {stockProduct && (
        <UpdateStockModal product={stockProduct} onClose={() => setStockProduct(null)} />
      )}
    </div>
  );
}

/* =========================================================
   FILTER DROPDOWN
========================================================= */

function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  return (
    <div className="bg-surface-container-lowest relative p-4">
      <label className="font-label-caps text-text-muted mb-2 block">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`bg-surface font-technical-data flex h-11 w-full cursor-pointer items-center justify-between border px-3 text-left transition-colors outline-none ${
          open || value !== 'all'
            ? 'border-primary text-primary'
            : 'border-border-subtle text-text-muted'
        } `}
      >
        <span>{selected?.label}</span>

        <span
          className={`material-symbols-outlined !text-[18px] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={`Close ${label} dropdown`}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="border-border-subtle bg-surface-container-lowest absolute top-[78px] right-4 left-4 z-20 border py-1 shadow-lg">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`font-technical-data flex w-full cursor-pointer items-center justify-between px-3 py-3 text-left transition-colors ${
                    active
                      ? 'bg-surface-container text-primary'
                      : 'text-text-muted hover:bg-surface-container-low hover:text-primary'
                  } `}
                >
                  {option.label}

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
   PRODUCT ROW
========================================================= */

function ProductRow({ product, onUpdateStock }) {
  return (
    <tr className="border-border-subtle hover:bg-surface-container-low align-center border-b last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-4">
          <img
            src={product.images.primary}
            alt={product.name}
            className="h-16 w-12 shrink-0 object-cover"
          />

          <div className="min-w-0">
            <p className="font-label-caps text-primary truncate">{product.name}</p>

            <p className="font-technical-data text-text-muted mt-1">SKU: {product.sku}</p>
          </div>
        </div>
      </td>

      <td className="font-technical-data text-primary px-4 py-4">{formatPrice(product.price)}</td>

      <td className="font-technical-data text-text-muted px-4 py-4">{product.category}</td>

      <td className="font-technical-data text-text-muted px-4 py-4 uppercase">{product.gender}</td>

      <td className="px-4 py-4">
        <ProductStatus product={product} />
      </td>

      <td className="px-4 py-4">
        <span className="font-technical-data text-primary">
          {product.stock} <span className="font-label text-text-muted">UNITS</span>
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-row items-center justify-center gap-4">
          <Button
            type="button"
            variant="primary"
            iconPosition="right"
            size="sm"
            icon="inventory"
            onClick={onUpdateStock}
          >
            UPDATE STOCK
          </Button>
          <Link
            to={`/admin/products/${product.sku}`}
            className="border-outline text-primary font-label-caps hover:border-primary hover:bg-primary hover:text-on-primary inline-flex h-9 items-center gap-1.5 border bg-transparent px-3"
          >
            <span className="material-symbols-outlined mt-[-1px] !text-[15px]">edit</span>
            EDIT
          </Link>
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function MobileProductCard({ product, onUpdateStock }) {
  return (
    <article className="border-border-subtle bg-surface-container-lowest border">
      <div className="p-4">
        <div className="flex gap-4">
          <img
            src={product.images.primary}
            alt={product.name}
            className="h-24 w-20 shrink-0 object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-label-caps text-primary truncate">{product.name}</p>

                <p className="font-technical-data text-text-muted mt-1">SKU: {product.sku}</p>
              </div>

              <ProductStatus product={product} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Meta label="CATEGORY" value={product.category} />
              <Meta label="GENDER" value={product.gender.toUpperCase()} />
              <Meta label="PRICE" value={formatPrice(product.price)} />
              <Meta label="STOCK" value={`${product.stock} UNITS`} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-border-subtle grid grid-cols-2 border-t">
        <button
          type="button"
          onClick={onUpdateStock}
          className="border-border-subtle font-label-caps text-text-muted hover:bg-surface-container-low hover:text-primary flex items-center justify-center gap-1.5 border-r py-3"
        >
          <span className="material-symbols-outlined !text-[16px]">inventory</span>
          STOCK
        </button>

        <Link
          to={`/admin/products/${product.sku}`}
          className="font-label-caps text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center gap-1.5 py-3"
        >
          <span className="material-symbols-outlined mt-[-1px] !text-[16px]">edit</span>
          EDIT
        </Link>
      </div>
    </article>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="font-label text-text-muted">{label}</p>
      <p className="font-technical-data text-primary mt-1 truncate">{value}</p>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function ProductStatus({ product }) {
  const active = (product.badge || 'ACTIVE') === 'ACTIVE';

  return (
    <span
      className={`font-label-caps inline-flex items-center gap-1.5 border px-2 py-1 ${
        active
          ? 'border-secondary bg-secondary-container text-on-secondary-container'
          : 'border-border-subtle bg-surface-container-low text-text-muted'
      } `}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {product.badge || 'ACTIVE'}
    </span>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({ onReset }) {
  return (
    <div className="border-border-subtle bg-surface-container-lowest border px-6 py-20 text-center">
      <span className="material-symbols-outlined text-text-muted !text-[32px]">search_off</span>

      <p className="font-label-caps text-primary mt-4">NO PRODUCTS FOUND</p>

      <p className="font-body-md text-text-muted mt-2">Try changing your search or filters.</p>

      <button
        type="button"
        onClick={onReset}
        className="border-border-subtle font-label-caps text-primary hover:border-primary mt-5 border px-4 py-2.5"
      >
        RESET FILTERS
      </button>
    </div>
  );
}

/* =========================================================
   UPDATE STOCK MODAL
========================================================= */

function UpdateStockModal({ product, onClose }) {
  const [stock, setStock] = useState(product.stock);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Connect to stock update service here later.
    console.log({
      sku: product.sku,
      stock: Number(stock),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="border-border-subtle bg-surface-container-lowest w-full max-w-md border shadow-2xl"
      >
        <div className="border-border-subtle flex items-start justify-between border-b p-5">
          <div>
            <p className="font-label-caps text-text-muted">INVENTORY MANAGEMENT</p>

            <h2 className="font-headline-lg text-primary mt-2">UPDATE STOCK</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-primary"
            aria-label="Close"
          >
            <span className="material-symbols-outlined !text-[19px]">close</span>
          </button>
        </div>

        <div className="border-border-subtle bg-surface-container-low flex items-center gap-4 border-b p-5">
          <img
            src={product.images.primary}
            alt={product.name}
            className="h-20 w-16 shrink-0 object-cover"
          />

          <div>
            <p className="font-label-caps text-primary">{product.name}</p>

            <p className="font-technical-data text-secondary mt-1">SKU: {product.sku}</p>

            <p className="font-technical-data text-secondary mt-3">
              CURRENT STOCK : <span className="text-tertiary-container">{product.stock} UNITS</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <label htmlFor="stock" className="font-label-caps text-tertiary-container mb-2 block">
              NEW STOCK QUANTITY
            </label>

            <div className="relative">
              <input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="border-border-subtle bg-surface font-technical-data text-tertiary-container focus:border-primary h-14 w-full border px-4 pr-20 text-lg outline-none"
                autoFocus
              />

              <span className="font-label-caps text-text-muted absolute top-1/2 right-4 -translate-y-1/2">
                UNITS
              </span>
            </div>
          </div>

          <div className="border-border-subtle bg-surface-container-low flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="border-border-subtle font-label-caps text-text-muted hover:border-primary hover:text-primary h-11 border px-5"
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="bg-primary font-label-caps text-on-primary hover:bg-surface-tint h-11 px-5"
            >
              SAVE STOCK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
