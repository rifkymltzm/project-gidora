import { useEffect, useRef, useState } from 'react';
import { SORT_OPTIONS } from '../utils/productFilters';

export default function ProductToolbar({
  productCount,
  activeFilterCount,
  onOpenFilters,
  sortBy,
  onSortChange,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const selectedSort = SORT_OPTIONS.find(([value]) => value === sortBy) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!isSortOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (!sortRef.current?.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortOpen]);

  const handleSortSelect = (value) => {
    onSortChange(value);
    setIsSortOpen(false);
  };

  return (
    <div className="border-border-subtle bg-surface/95 sticky top-16 z-40 w-full border-y backdrop-blur-md md:top-18">
      <div className="px-margin-mobile md:px-margin-desktop mx-auto flex max-w-7xl items-center justify-between py-3 md:py-4">
        <button
          type="button"
          onClick={onOpenFilters}
          className="group font-label-caps text-text-muted hover:text-primary flex cursor-pointer items-center gap-2.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-90">
            tune
          </span>

          <span>
            FILTER
            {activeFilterCount > 0 && (
              <span className="text-primary ml-1">
                ({String(activeFilterCount).padStart(2, '0')})
              </span>
            )}
          </span>
        </button>

        <span className="font-technical-data text-text-muted hidden md:block">
          {String(productCount).padStart(2, '0')} PRODUCTS
        </span>

        <div ref={sortRef} className="relative">
          <button
            type="button"
            onClick={() => setIsSortOpen((open) => !open)}
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
            className={`group flex cursor-pointer items-center gap-2 border-b py-1 text-left transition-colors ${
              isSortOpen ? 'border-primary' : 'hover:border-primary border-transparent'
            }`}
          >
            <span className="font-label-caps text-text-muted hidden sm:block">SORT:</span>

            <span className="font-label-caps text-primary font-medium uppercase">
              {selectedSort[1]}
            </span>

            <span
              className={`material-symbols-outlined text-text-muted text-[16px] transition-transform duration-200 ${
                isSortOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {isSortOpen && (
            <div
              className="border-text-muted bg-surface absolute top-[calc(100%+10px)] right-0 z-50 min-w-[210px] overflow-hidden border shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
              role="listbox"
              aria-label="Sort products"
            >
              <div className="border-border-subtle bg-surface-container-low border-b px-4 py-3">
                <span className="font-label-caps text-text-muted">SORT PRODUCTS</span>
              </div>

              <div className="py-1">
                {SORT_OPTIONS.map(([value, label]) => {
                  const selected = value === sortBy;

                  return (
                    <button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSortSelect(value)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-6 px-4 py-3 text-left transition-colors ${
                        selected
                          ? 'bg-surface-container-high text-primary'
                          : 'text-text-muted hover:bg-surface-container-low hover:text-primary'
                      }`}
                    >
                      <span
                        className={`font-label-caps tracking-wide uppercase ${
                          selected ? 'text-primary font-medium' : 'text-text-muted'
                        }`}
                      >
                        {label}
                      </span>

                      {selected && (
                        <span className="material-symbols-outlined text-[15px]">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
