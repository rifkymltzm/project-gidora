import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import PRODUCTS_DATA from '@/features/products/data/products';
import { searchProducts } from '@/features/products/utils/productSearch';
import { formatPrice } from '@/utils/formatPrice';

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const results = useMemo(() => {
    return searchProducts(PRODUCTS_DATA, query, 8);
  }, [query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleClear = () => {
    setQuery('');

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
      <button
        type="button"
        aria-label="Close search"
        onClick={handleClose}
        className="bg-primary/25 absolute inset-0 h-full w-full animate-[fadeIn_300ms_ease-out] cursor-default backdrop-blur-[3px]"
      />

      <div className="border-border-subtle bg-surface absolute top-0 left-0 w-full animate-[searchPanelIn_400ms_cubic-bezier(0.22,1,0.36,1)] border-b shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
        <div className="px-margin-mobile md:px-margin-desktop mx-auto max-w-7xl">
          <div className="border-border-subtle flex h-20 items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-text-muted text-[21px]">search</span>

              <span className="font-label-caps text-text-muted text-[11px] tracking-[0.16em]">
                SEARCH
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close search"
              className="group border-border-subtle text-text-muted hover:border-primary hover:bg-primary hover:text-on-primary flex h-9 w-9 cursor-pointer items-center justify-center border transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-90">
                close
              </span>
            </button>
          </div>

          <div className="border-primary flex items-center border-b py-4">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SEARCH PRODUCTS"
              aria-label="Search products"
              className="font-technical-data text-primary placeholder:text-text-muted min-w-0 flex-1 appearance-none bg-transparent text-[13px] tracking-wide outline-none [&::-ms-clear]:hidden [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />

            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                hasQuery ? 'ml-4 w-auto opacity-100' : 'ml-0 w-0 opacity-0'
              }`}
            >
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                tabIndex={hasQuery ? 0 : -1}
                className="font-label-caps text-text-muted hover:text-primary cursor-pointer text-[10px] tracking-[0.14em] whitespace-nowrap transition-colors duration-300"
              >
                CLEAR
              </button>
            </div>
          </div>

          <div data-lenis-prevent className="max-h-[65vh] overflow-y-auto py-6">
            {!hasQuery ? (
              <div className="animate-[contentFadeIn_400ms_ease-out] py-10 text-center">
                <p className="font-label-caps text-text-muted text-[12px] tracking-[0.16em]">
                  SEARCH THE COLLECTION
                </p>

                <p className="font-input text-text-muted mt-2">
                  Find products by name, category, gender, color, or SKU.
                </p>
              </div>
            ) : results.length > 0 ? (
              <div key={query} className="animate-[contentFadeIn_300ms_ease-out]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-label-caps text-text-muted text-[10px] tracking-[0.14em]">
                    SEARCH RESULTS
                  </span>

                  <span className="font-technical-data text-text-muted text-[10px] uppercase">
                    {String(results.length).padStart(2, '0')} FOUND
                  </span>
                </div>

                <div className="border-border-subtle grid grid-cols-1 border-y sm:grid-cols-2">
                  {results.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      onClick={handleClose}
                      style={{
                        animationDelay: `${index * 45}ms`,
                      }}
                      className="group border-border-subtle hover:bg-surface-container-low flex animate-[searchResultIn_400ms_cubic-bezier(0.22,1,0.36,1)_both] cursor-pointer gap-4 border-b p-3 transition-colors duration-300 sm:nth-[odd]:border-r"
                    >
                      <div className="border-border-subtle bg-surface-container-low relative h-20 w-16 shrink-0 overflow-hidden border">
                        {product.images?.primary && (
                          <img
                            src={product.images.primary}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <h3 className="font-technical-data text-primary truncate text-[11px] font-medium tracking-wide uppercase transition-colors duration-300 group-hover:underline">
                          {product.name}
                        </h3>

                        {product.category && (
                          <p className="font-technical-data text-text-muted mt-1 text-[10px] tracking-wide uppercase">
                            {product.category}
                          </p>
                        )}

                        <p className="font-technical-data text-primary mt-2 text-[11px]">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <span className="material-symbols-outlined text-text-muted group-hover:text-primary !text-[17px] transition-all duration-300 group-hover:translate-x-1">
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
                className="border-border-subtle animate-[contentFadeIn_300ms_ease-out] border-y py-12 text-center"
              >
                <p className="font-label-caps text-text-muted text-[10px] tracking-[0.16em]">
                  NO RESULTS
                </p>

                <p className="font-body-md text-text-muted mt-2">
                  No products found for "{query}".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
