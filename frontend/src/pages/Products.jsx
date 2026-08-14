import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import PRODUCTS_DATA from "../data/products";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Pagination
  const [limit, setLimit] = useState(8);

  // Sync category with URL
  useEffect(() => {
    const urlCategory = searchParams.get("category");

    if (urlCategory) {
      setCategoryFilter(urlCategory.toLowerCase());
    } else {
      setCategoryFilter("all");
    }
  }, [searchParams]);

  // Handle category filter
  const handleCategoryChange = (e) => {
    const value = e.target.value.toLowerCase();

    setCategoryFilter(value);

    const newParams = new URLSearchParams(searchParams);

    if (value === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", value);
    }

    setSearchParams(newParams);
  };

  // Filter & Sort
  const filteredProducts = PRODUCTS_DATA.filter((product) => {
    // Category / Gender
    if (categoryFilter !== "all") {
      const matchCategory = product.category?.toLowerCase() === categoryFilter;

      const matchGender = product.gender?.toLowerCase() === categoryFilter;

      const matchTechnical =
        categoryFilter === "technical" &&
        product.category?.toLowerCase() === "outerwear";

      if (!matchCategory && !matchGender && !matchTechnical) {
        return false;
      }
    }

    // Size
    if (
      sizeFilter !== "all" &&
      !product.sizes?.includes(sizeFilter.toLowerCase())
    ) {
      return false;
    }

    // Color
    if (
      colorFilter !== "all" &&
      product.color?.toLowerCase() !== colorFilter.toLowerCase()
    ) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "price_low") {
      return a.priceNum - b.priceNum;
    }

    if (sortBy === "price_high") {
      return b.priceNum - a.priceNum;
    }

    if (sortBy === "newest") {
      if (a.badge === "NEW" && b.badge !== "NEW") return -1;
      if (a.badge !== "NEW" && b.badge === "NEW") return 1;

      return a.id.localeCompare(b.id);
    }

    // Featured
    return a.id.localeCompare(b.id);
  });

  const visibleProducts = filteredProducts.slice(0, limit);

  return (
    <div className="flex-grow w-full bg-surface min-h-[70vh]">
      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <header className="px-margin-mobile md:px-margin-desktop pt-28 md:pt-32 pb-12 md:pb-20 flex flex-col md:flex-row justify-between items-baseline gap-4 max-w-7xl mx-auto">
        <h1 className="font-headline-display text-primary uppercase">Shop</h1>

        <span className="font-technical-data text-text-muted">
          {filteredProducts.length} PRODUCTS
        </span>
      </header>

      {/* =========================================
          FILTER BAR
      ========================================= */}
      <div className="w-full border-y border-border-subtle bg-surface sticky top-20 z-40 px-margin-mobile md:px-margin-desktop py-4">
        <div className="mx-auto max-w-7xl w-full flex flex-wrap items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {/* Category */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-label-caps text-text-muted">Category:</span>

              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="bg-transparent border-none font-technical-data text-primary focus:ring-0 p-0 cursor-pointer uppercase text-xs"
              >
                <option value="all">All</option>
                <option value="outerwear">Outerwear</option>
                <option value="pants">Pants</option>
                <option value="shirts">Shirts</option>
                <option value="accessories">Accessories</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>

            {/* Size */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-label-caps text-text-muted">Size:</span>

              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="bg-transparent border-none font-technical-data text-primary focus:ring-0 p-0 cursor-pointer uppercase text-xs"
              >
                <option value="all">All</option>
                <option value="xs">XS</option>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
              </select>
            </div>

            {/* Color */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-label-caps text-text-muted">Color:</span>

              <select
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="bg-transparent border-none font-technical-data text-primary focus:ring-0 p-0 cursor-pointer uppercase text-xs"
              >
                <option value="all">All</option>
                <option value="black">Black</option>
                <option value="navy">Navy</option>
                <option value="olive">Olive</option>
                <option value="beige">Beige</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <span className="font-label-caps text-text-muted">Sort By:</span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none font-technical-data text-primary focus:ring-0 p-0 cursor-pointer uppercase text-xs"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================
          PRODUCT GRID
      ========================================= */}
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop py-8">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border-subtle border border-border-subtle w-full">
            {visibleProducts.map((product) => (
              <div key={product.id} className="bg-surface">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  badge={product.badge}
                  images={product.images}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-border-subtle bg-surface">
            <p className="font-body-md text-text-muted">
              Tidak ada produk yang cocok dengan filter yang dipilih.
            </p>
          </div>
        )}

        {/* Load More */}
        {visibleProducts.length < filteredProducts.length && (
          <div className="w-full flex justify-center py-section-gap">
            <button
              onClick={() => setLimit((prev) => prev + 4)}
              className="bg-primary text-on-primary font-label-caps px-12 py-4 rounded-none hover:bg-surface-tint transition-colors w-full max-w-xs"
            >
              LOAD MORE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
