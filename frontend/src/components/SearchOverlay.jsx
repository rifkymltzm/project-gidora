import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PRODUCTS_DATA from "../data/products";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // =========================================================
  // BODY SCROLL LOCK
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // =========================================================
  // AUTO FOCUS
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timer);
  }, [open]);

  // =========================================================
  // ESCAPE KEY
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // =========================================================
  // SEARCH
  // =========================================================

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return PRODUCTS_DATA.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.gender,
        product.color,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
        .join(" ");

      return searchableText.includes(normalizedQuery);
    }).slice(0, 8);
  }, [query]);

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  // =========================================================
  // CLEAR
  // =========================================================

  const handleClear = () => {
    setQuery("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  if (!open) {
    return null;
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <button
        type="button"
        aria-label="Close search"
        onClick={handleClose}
        className="
          absolute
          inset-0
          h-full
          w-full
          cursor-default
          animate-[fadeIn_300ms_ease-out]
          bg-primary/25
          backdrop-blur-[3px]
        "
      />

      {/* =====================================================
          SEARCH PANEL
      ===================================================== */}

      <div
        className="
          absolute
          left-0
          top-0
          w-full
          border-b
          border-border-subtle
          bg-surface
          shadow-[0_20px_60px_rgba(0,0,0,0.10)]
          animate-[searchPanelIn_400ms_cubic-bezier(0.22,1,0.36,1)]
        "
      >
        <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex h-20 items-center justify-between border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[21px] text-text-muted">
                search
              </span>

              <span className="font-label-caps text-[10px] tracking-[0.16em] text-text-muted">
                SEARCH
              </span>
            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close search"
              className="
                group
                flex
                h-9
                w-9
                items-center
                justify-center
                border
                border-border-subtle
                text-text-muted
                transition-all
                duration-300
                hover:border-primary
                hover:bg-primary
                hover:text-on-primary
                cursor-pointer
              "
            >
              <span
                className="
                  material-symbols-outlined
                  text-[18px]
                  transition-transform
                  duration-300
                  group-hover:rotate-90
                "
              >
                close
              </span>
            </button>
          </div>

          {/* =================================================
              SEARCH INPUT
          ================================================= */}

          <div
            className="
              flex
              items-center
              border-b
              border-primary
              py-5
            "
          >
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SEARCH PRODUCTS"
              aria-label="Search products"
              className="
                min-w-0
                flex-1
                appearance-none
                bg-transparent
                font-technical-data
                text-[16px]
                uppercase
                tracking-wide
                text-primary
                outline-none
                placeholder:text-text-muted
                [&::-webkit-search-cancel-button]:appearance-none
                [&::-webkit-search-decoration]:appearance-none
                [&::-ms-clear]:hidden
              "
            />

            {/* CLEAR TEXT */}

            <div
              className={`
                overflow-hidden
                transition-all
                duration-300
                ease-out
                ${hasQuery ? "ml-4 w-auto opacity-100" : "ml-0 w-0 opacity-0"}
              `}
            >
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                tabIndex={hasQuery ? 0 : -1}
                className="
                  cursor-pointer
                  whitespace-nowrap
                  font-label-caps
                  text-[10px]
                  tracking-[0.14em]
                  text-text-muted
                  transition-colors
                  duration-300
                  hover:text-primary
                "
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* =================================================
              RESULTS
          ================================================= */}

          <div className="max-h-[65vh] overflow-y-auto py-6">
            {!hasQuery ? (
              <div
                className="
                  py-10
                  text-center
                  animate-[contentFadeIn_400ms_ease-out]
                "
              >
                <p className="font-label-caps text-[10px] tracking-[0.16em] text-text-muted">
                  SEARCH THE COLLECTION
                </p>

                <p className="mt-2 font-body-md text-text-muted">
                  Find products by name, category, gender, or color.
                </p>
              </div>
            ) : results.length > 0 ? (
              <div
                key={query}
                className="animate-[contentFadeIn_300ms_ease-out]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-label-caps text-[10px] tracking-[0.14em] text-text-muted">
                    SEARCH RESULTS
                  </span>

                  <span className="font-technical-data text-[10px] uppercase text-text-muted">
                    {String(results.length).padStart(2, "0")} FOUND
                  </span>
                </div>

                <div className="grid grid-cols-1 border-y border-border-subtle sm:grid-cols-2">
                  {results.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      onClick={handleClose}
                      style={{
                        animationDelay: `${index * 45}ms`,
                      }}
                      className="
                        group
                        flex
                        animate-[searchResultIn_400ms_cubic-bezier(0.22,1,0.36,1)_both]
                        gap-4
                        border-b
                        border-border-subtle
                        p-3
                        transition-colors
                        duration-300
                        hover:bg-surface-container-low
                        sm:nth-[odd]:border-r
                        cursor-pointer
                      "
                    >
                      {/* IMAGE */}

                      <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-border-subtle bg-surface-container-low">
                        {product.images?.primary && (
                          <img
                            src={product.images.primary}
                            alt={product.name}
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-500
                              ease-out
                              group-hover:scale-105
                            "
                          />
                        )}
                      </div>

                      {/* INFO */}

                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <h3
                          className="
                            truncate
                            font-technical-data
                            text-[11px]
                            font-medium
                            uppercase
                            tracking-wide
                            text-primary
                            transition-colors
                            duration-300
                            group-hover:underline
                          "
                        >
                          {product.name}
                        </h3>

                        {product.category && (
                          <p className="mt-1 font-technical-data text-[10px] uppercase tracking-wide text-text-muted">
                            {product.category}
                          </p>
                        )}

                        <p className="mt-2 font-technical-data text-[11px] text-primary">
                          {product.price}
                        </p>
                      </div>

                      {/* ARROW */}

                      <div className="flex items-center">
                        <span
                          className="
                            material-symbols-outlined
                            text-[17px]
                            text-text-muted
                            transition-all
                            duration-300
                            group-hover:translate-x-1
                            group-hover:text-primary
                          "
                        >
                          arrow_forward
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div
                key="no-results"
                className="
                  border-y
                  border-border-subtle
                  py-12
                  text-center
                  animate-[contentFadeIn_300ms_ease-out]
                "
              >
                <p className="font-label-caps text-[10px] tracking-[0.16em] text-text-muted">
                  NO RESULTS
                </p>

                <p className="mt-2 font-body-md text-text-muted">
                  No products found for "{query}".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          LOCAL ANIMATIONS
      ===================================================== */}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes searchPanelIn {
            from {
              opacity: 0;
              transform: translateY(-24px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes contentFadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes searchResultIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
