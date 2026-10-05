import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { DEFAULT_FILTERS, FILTER_OPTIONS, getActiveFilterCount } from '../utils/productFilters';

export default function ProductFilterDrawer({ open, filters, onApply, onClose }) {
  const [draftFilters, setDraftFilters] = useState(filters);

  // =========================================================
  // SYNC DRAFT FILTERS
  // =========================================================

  useEffect(() => {
    if (open) {
      setDraftFilters(filters);
    }
  }, [open, filters]);

  // =========================================================
  // LOCK BODY SCROLL
  // =========================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // =========================================================
  // ESCAPE TO CLOSE
  // =========================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // =========================================================
  // CLOSED STATE
  // =========================================================

  if (!open) {
    return null;
  }

  const activeCount = getActiveFilterCount(draftFilters);

  // =========================================================
  // FILTER ACTIONS
  // =========================================================

  const updateFilter = (key, value) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(draftFilters);
    onClose();
  };

  // =========================================================
  // DRAWER
  // =========================================================

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="bg-primary/25 absolute inset-0 h-full w-full cursor-default backdrop-blur-[2px]"
      />

      {/* =====================================================
          DRAWER
      ===================================================== */}

      <aside
        className="bg-surface absolute inset-0 flex h-full w-full flex-col shadow-[0_-10px_50px_rgba(0,0,0,0.12)] md:top-0 md:right-0 md:left-auto md:h-full md:w-[440px] md:shadow-[-20px_0_60px_rgba(0,0,0,0.10)]"
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="border-border-subtle shrink-0 border-b px-6 pt-6 pb-5 md:px-8 md:pt-8">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="font-label-caps text-text-muted mb-2">COLLECTION / FILTER</p>

              <h2 className="font-headline-display text-primary text-2xl uppercase md:text-3xl">
                FILTER
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="border-border-subtle text-text-muted hover:border-primary hover:text-primary flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-label-caps text-text-muted">
              {activeCount > 0 ? `${String(activeCount).padStart(2, '0')} ACTIVE` : 'NO FILTERS'}
            </span>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-label-caps text-text-muted hover:text-primary cursor-pointer transition-colors"
              >
                CLEAR ALL
              </button>
            )}
          </div>
        </header>

        {/* ===================================================
            FILTER CONTENT
            NATIVE SCROLL
            LENIS PREVENTED
        =================================================== */}

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain"
        >
          {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
            <FilterSection
              key={key}
              label={capitalize(key)}
              value={draftFilters[key]}
              options={options}
              onChange={(value) => updateFilter(key, value)}
            />
          ))}
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="border-border-subtle bg-surface shrink-0 border-t p-4 md:p-6">
          <button
            type="button"
            onClick={handleApply}
            className="group bg-primary font-label-caps text-on-primary hover:bg-surface-tint flex w-full cursor-pointer items-center justify-center gap-1 px-6 py-4 transition-all duration-300 hover:text-white"
          >
            <span>APPLY FILTERS</span>

            <span
              className="material-symbols-outlined ml-1 !text-[15px] transition-transform duration-300 group-hover:translate-x-1"
              style={{ fontSize: '16px' }}
            >
              arrow_forward
            </span>
          </button>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}

// =============================================================
// FILTER SECTION
// =============================================================

function FilterSection({ label, value, options, onChange }) {
  const selectedLabel = options.find(([optionValue]) => optionValue === value)?.[1] ?? 'All';

  return (
    <section className="border-border-subtle border-b px-6 py-5 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-label-caps text-text-muted">{label}</span>

        <span className="font-label-caps text-primary uppercase">{selectedLabel}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map(([optionValue, optionLabel]) => {
          const selected = optionValue === value;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              className={`font-label-caps min-w-[52px] cursor-pointer border px-4 py-2.5 tracking-wide uppercase transition-all ${
                selected
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-border-subtle bg-surface text-text-muted hover:border-primary hover:text-primary'
              } `}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// =============================================================
// HELPERS
// =============================================================

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
