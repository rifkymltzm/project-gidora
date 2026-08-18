import { useEffect, useState } from "react";
import {
  DEFAULT_FILTERS,
  FILTER_OPTIONS,
  getActiveFilterCount,
} from "../utilities/productFilters";

export default function ProductFilterDrawer({
  open,
  filters,
  onApply,
  onClose,
}) {
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    if (open) {
      setDraftFilters(filters);
    }
  }, [open, filters]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const activeCount = getActiveFilterCount(draftFilters);

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

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-primary/25 backdrop-blur-[2px]"
      />

      <aside
        className="absolute inset-0 flex h-full w-full flex-col bg-surface shadow-[0_-10px_50px_rgba(0,0,0,0.12)] md:left-auto md:right-0 md:top-0 md:h-full md:w-[440px] md:shadow-[-20px_0_60px_rgba(0,0,0,0.10)]"
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
      >
        <header className="border-b border-border-subtle px-6 pb-5 pt-6 md:px-8 md:pt-8">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="mb-2 font-label-caps text-text-muted">
                COLLECTION / FILTER
              </p>

              <h2 className="font-headline-display text-2xl uppercase text-primary md:text-3xl">
                FILTER
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border-subtle text-text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-label-caps text-text-muted">
              {activeCount > 0
                ? `${String(activeCount).padStart(2, "0")} ACTIVE`
                : "NO FILTERS"}
            </span>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer font-label-caps text-text-muted transition-colors hover:text-primary"
              >
                CLEAR ALL
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
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

        <footer className="border-t border-border-subtle bg-surface p-4 md:p-6">
          <button
            type="button"
            onClick={handleApply}
            className="flex w-full cursor-pointer items-center justify-between bg-primary px-5 py-4 font-label-caps text-on-primary transition-colors hover:bg-surface-tint"
          >
            <span>APPLY FILTERS</span>

            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </footer>
      </aside>
    </div>
  );
}

function FilterSection({ label, value, options, onChange }) {
  const selectedLabel =
    options.find(([optionValue]) => optionValue === value)?.[1] ?? "All";

  return (
    <section className="border-b border-border-subtle px-6 py-5 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-label-caps text-text-muted">{label}</span>

        <span className="font-label-caps uppercase text-primary">
          {selectedLabel}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map(([optionValue, optionLabel]) => {
          const selected = optionValue === value;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              className={`min-w-[52px] cursor-pointer border px-4 py-2.5 font-label-caps uppercase tracking-wide transition-all ${
                selected
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border-subtle bg-surface text-text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
