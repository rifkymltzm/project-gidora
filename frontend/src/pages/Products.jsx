import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import ProductFilterDrawer from '../features/products/components/ProductFilterDrawer';
import ProductGrid from '../features/products/components/ProductGrid';
import ProductToolbar from '../features/products/components/ProductToolbar';
import PRODUCTS_DATA from '../features/products/data/products';

import {
  DEFAULT_FILTERS,
  getActiveFilterCount,
  getFilteredProducts,
  normalizeValue,
} from '../features/products/utils/productFilters';

const INITIAL_LIMIT = 8;
const LOAD_MORE_AMOUNT = 4;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));

  const [sortBy, setSortBy] = useState('featured');
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams));
    setLimit(INITIAL_LIMIT);
  }, [searchParams]);

  const filteredProducts = useMemo(
    () => getFilteredProducts(PRODUCTS_DATA, filters, sortBy),
    [filters, sortBy],
  );

  const visibleProducts = filteredProducts.slice(0, limit);
  const activeFilterCount = getActiveFilterCount(filters);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setLimit(INITIAL_LIMIT);

    const params = new URLSearchParams(searchParams);

    updateParam(params, 'category', newFilters.category);
    updateParam(params, 'gender', newFilters.gender);

    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setLimit(INITIAL_LIMIT);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortBy('featured');
    setLimit(INITIAL_LIMIT);
    setSearchParams({});
  };

  const handleLoadMore = () => {
    setLimit((current) => current + LOAD_MORE_AMOUNT);
  };

  return (
    <div className="bg-surface min-h-[70vh] w-full">
      {/* HEADER */}

      <header className="px-margin-mobile md:px-margin-desktop mx-auto flex max-w-7xl flex-col gap-4 pt-26 pb-10 md:flex-row md:items-end md:justify-between md:pt-30 md:pb-14">
        <div>
          <p className="font-label-caps text-text-muted mb-3 tracking-[0.18em]">
            GIDORA / COLLECTION
          </p>

          <h1 className="font-headline-display text-primary uppercase">SHOP</h1>
        </div>

        <div className="font-technical-data text-text-muted">
          {String(filteredProducts.length).padStart(2, '0')} PRODUCTS
        </div>
      </header>

      {/* TOOLBAR */}

      <ProductToolbar
        productCount={filteredProducts.length}
        activeFilterCount={activeFilterCount}
        onOpenFilters={() => setIsFilterOpen(true)}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* PRODUCTS */}

      <section className="px-margin-mobile md:px-margin-desktop mx-auto max-w-7xl py-8 md:py-12">
        <ProductGrid products={visibleProducts} />

        {/* EMPTY STATE */}

        {filteredProducts.length === 0 && (
          <div className="border-border-subtle flex min-h-[280px] flex-col items-center justify-center border-y">
            <p className="font-label-caps text-text-muted">NO PRODUCTS FOUND</p>

            <p className="font-body-md text-text-muted mt-2 text-center">
              Tidak ada produk yang sesuai dengan filter saat ini.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="border-primary font-label-caps text-primary hover:bg-primary hover:text-on-primary mt-6 border px-6 py-3 transition-colors duration-300"
            >
              RESET FILTERS
            </button>
          </div>
        )}

        {/* LOAD MORE */}

        {visibleProducts.length < filteredProducts.length && (
          <div className="py-section-gap flex w-full justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="bg-primary font-label-caps text-on-primary hover:bg-surface-tint w-full max-w-xs cursor-pointer px-12 py-4 transition-colors duration-300"
            >
              LOAD MORE
            </button>
          </div>
        )}
      </section>

      {/* FILTER DRAWER */}

      <ProductFilterDrawer
        open={isFilterOpen}
        filters={filters}
        onApply={handleApplyFilters}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}

function getFiltersFromSearchParams(searchParams) {
  return {
    ...DEFAULT_FILTERS,
    category: getUrlFilter(searchParams, 'category'),
    gender: getUrlFilter(searchParams, 'gender'),
  };
}

function getUrlFilter(searchParams, key) {
  const value = searchParams.get(key);
  return value ? normalizeValue(value) : 'all';
}

function updateParam(params, key, value) {
  if (value === 'all') {
    params.delete(key);
    return;
  }

  params.set(key, value);
}
