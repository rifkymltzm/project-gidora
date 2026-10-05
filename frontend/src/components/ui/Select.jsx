import { useEffect, useRef, useState } from 'react';

export default function Select({
  id,
  value,
  options = [],
  onChange,
  disabled = false,
  placeholder = 'SELECT',
  error = false,
  className = '',
  ...props
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const selected = options.find((option) => {
    const optionValue = typeof option === 'string' ? option : option.value;

    return optionValue === value;
  });

  const selectedLabel = typeof selected === 'string' ? selected : (selected?.label ?? placeholder);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`font-input relative flex h-11 w-full items-center justify-between border-0 border-b bg-transparent px-0 text-left uppercase transition-colors duration-200 outline-none ${
          error
            ? 'border-error'
            : disabled
              ? 'border-border-subtle'
              : 'border-border-subtle hover:border-outline focus:border-primary'
        } ${
          disabled ? 'text-text-muted cursor-default' : 'text-tertiary-container cursor-pointer'
        }`}
        {...props}
      >
        <span className={`font-technical-data ${!value ? 'text-secondary/45' : 'text-secondary'}`}>
          {selectedLabel}
        </span>

        {!disabled && (
          <span
            className={`material-symbols-outlined text-text-muted !text-[18px] transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          >
            expand_more
          </span>
        )}
      </button>

      {open && (
        <div
          data-lenis-prevent
          role="listbox"
          aria-labelledby={id}
          // PERBAIKAN DI SINI: Ditambahkan max-h-60 (atau max-h-72) dan overflow-y-auto
          className="border-border-subtle bg-surface-container-lowest absolute top-[calc(100%+4px)] right-0 left-0 z-30 max-h-60 overflow-x-hidden overflow-y-auto overscroll-contain border shadow-lg"
        >
          {options.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value;

            const optionLabel = typeof option === 'string' ? option : option.label;

            const active = optionValue === value;

            return (
              <button
                key={optionValue}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
                className={`font-technical-data flex min-h-11 w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left uppercase transition-colors duration-150 ${
                  active
                    ? 'bg-surface-container text-tertiary-container'
                    : 'text-text-muted hover:bg-surface-container-low hover:text-tertiary-container'
                }`}
              >
                <span>{optionLabel}</span>

                {active && (
                  <span className="material-symbols-outlined !text-[17px]" aria-hidden="true">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
