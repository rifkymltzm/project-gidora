import { useEffect, useRef, useState } from 'react';

export default function ComboBox({
  id,
  value,
  options = [],
  onChange,
  disabled = false,
  placeholder = 'SELECT OR TYPE...',
  error = false,
  className = '',
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Tutup dropdown jika klik di luar komponen
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery(''); // Reset query saat dropdown tertutup
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  // Cari opsi yang sedang dipilih berdasarkan value
  const selected = options.find((option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    return optionValue === value;
  });

  const selectedLabel = typeof selected === 'string' ? selected : (selected?.label ?? '');

  // Filter opsi berdasarkan teks yang diketik di query
  const filteredOptions = options.filter((option) => {
    const optionLabel = typeof option === 'string' ? option : (option.label ?? '');
    return optionLabel.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Container Input / Trigger */}
      <div
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
        className={`font-input relative flex h-11 w-full cursor-pointer items-center justify-between border-0 border-b bg-transparent px-0 text-left uppercase transition-colors duration-200 outline-none ${
          error
            ? 'border-error'
            : disabled
              ? 'border-border-subtle'
              : 'border-border-subtle hover:border-outline focus-within:border-primary'
        } ${disabled ? 'text-text-muted cursor-default' : 'text-tertiary-container'}`}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          disabled={disabled}
          placeholder={selectedLabel || placeholder}
          value={open ? query : selectedLabel}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onBlur={() => {
            if (query.trim() !== '') {
              // Cek apakah query yang diketik mirip/sama dengan salah satu option
              const matchedOption = options.find((opt) => {
                const optLabel = typeof opt === 'string' ? opt : (opt.label ?? '');
                return optLabel.toLowerCase() === query.toLowerCase();
              });

              if (matchedOption) {
                // Jika ketemu, kirim value aslinya
                const matchedValue =
                  typeof matchedOption === 'string' ? matchedOption : matchedOption.value;
                onChange(matchedValue);
              } else {
                // Jika tidak ketemu di list, tetap kirim query (atau biarkan kosong jika harus strict)
                onChange(query);
              }
            }
            setQuery('');
          }}
          className="font-technical-data text-secondary placeholder:text-secondary/45 w-full cursor-pointer bg-transparent uppercase outline-none disabled:cursor-default"
          {...props}
        />
        {!disabled && (
          <span
            className={`material-symbols-outlined text-text-muted ml-2 shrink-0 !text-[18px] transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          >
            expand_more
          </span>
        )}
      </div>

      {/* Dropdown Listbox */}
      {open && (
        <div
          data-lenis-prevent
          role="listbox"
          aria-labelledby={id}
          className="border-border-subtle bg-surface-container-lowest absolute top-[calc(100%+4px)] right-0 left-0 z-30 max-h-60 overflow-x-hidden overflow-y-auto overscroll-contain border shadow-lg"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const active = optionValue === value;

              return (
                <button
                  key={optionValue}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => {
                    onChange(optionValue);
                    setQuery('');
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
            })
          ) : (
            <div className="font-technical-data text-text-muted px-3 py-3 text-center uppercase">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
