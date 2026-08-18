import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductFilterDrawer from "../components/ProductFilterDrawer";
import ProductGrid from "../components/ProductGrid";
import ProductToolbar from "../components/ProductToolbar";
import PRODUCTS_DATA from "../data/products";

import {
  DEFAULT_FILTERS,
  getActiveFilterCount,
  getFilteredProducts,
  normalizeValue,
} from "../utilities/productFilters";

const INITIAL_LIMIT = 8;
const LOAD_MORE_AMOUNT = 4;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() =>
    getFiltersFromSearchParams(searchParams),
  );

  const [sortBy, setSortBy] = useState("featured");
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

    updateParam(params, "category", newFilters.category);
    updateParam(params, "gender", newFilters.gender);

    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setLimit(INITIAL_LIMIT);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortBy("featured");
    setLimit(INITIAL_LIMIT);
    setSearchParams({});
  };

  const handleLoadMore = () => {
    setLimit((current) => current + LOAD_MORE_AMOUNT);
  };

  return (
    <div className="min-h-[70vh] w-full bg-surface">
      {/* HEADER */}

      <header className="mx-auto flex max-w-7xl flex-col gap-4 px-margin-mobile pb-10 pt-28 md:flex-row md:items-end md:justify-between md:px-margin-desktop md:pb-14 md:pt-32">
        <div>
          <p className="mb-3 font-label-caps tracking-[0.18em] text-text-muted">
            GIDORA / COLLECTION
          </p>

          <h1 className="font-headline-display uppercase text-primary">SHOP</h1>
        </div>

        <div className="font-technical-data text-text-muted">
          {String(filteredProducts.length).padStart(2, "0")} PRODUCTS
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

      <section className="mx-auto max-w-7xl px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        <ProductGrid products={visibleProducts} />

        {/* EMPTY STATE */}

        {filteredProducts.length === 0 && (
          <div className="flex min-h-[280px] flex-col items-center justify-center border-y border-border-subtle">
            <p className="font-label-caps text-text-muted">NO PRODUCTS FOUND</p>

            <p className="mt-2 text-center font-body-md text-text-muted">
              Tidak ada produk yang sesuai dengan filter saat ini.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 border border-primary px-6 py-3 font-label-caps text-primary transition-colors duration-300 hover:bg-primary hover:text-on-primary"
            >
              RESET FILTERS
            </button>
          </div>
        )}

        {/* LOAD MORE */}

        {visibleProducts.length < filteredProducts.length && (
          <div className="flex w-full justify-center py-section-gap">
            <button
              type="button"
              onClick={handleLoadMore}
              className="w-full max-w-xs bg-primary px-12 py-4 font-label-caps text-on-primary transition-colors duration-300 hover:bg-surface-tint"
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
    category: getUrlFilter(searchParams, "category"),
    gender: getUrlFilter(searchParams, "gender"),
  };
}

function getUrlFilter(searchParams, key) {
  const value = searchParams.get(key);
  return value ? normalizeValue(value) : "all";
}

function updateParam(params, key, value) {
  if (value === "all") {
    params.delete(key);
    return;
  }

  params.set(key, value);
}
