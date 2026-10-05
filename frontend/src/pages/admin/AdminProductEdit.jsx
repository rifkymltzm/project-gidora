import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getAdminProduct } from '@/features/admin/services/adminProductService';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_GENDERS,
  getSizeTypeByCategory,
} from '@/features/products/data/productOptions';

import { formatPrice } from '@/utils/formatPrice';

const COLOR_OPTIONS = ['black', 'white', 'gray', 'navy', 'olive', 'beige', 'pink'];

const ERROR_COLOR = '#B42318';

export default function AdminProductEdit() {
  const { sku } = useParams();
  const navigate = useNavigate();

  const product = useMemo(() => getAdminProduct(sku), [sku]);

  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState(null);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    if (!product) return;

    setForm({
      name: product.name ?? '',
      price: product.price ?? '',
      category: product.category ?? 'Outerwear',
      gender: product.gender ?? 'unisex',
      badge: product.badge ?? '',
      stock: product.stock ?? '',
      description: product.description ?? '',
      material: product.material ?? '',
    });

    setColors(product.color ?? []);
    setSizes(product.sizes ?? []);
  }, [product]);

  useEffect(() => {
    if (!saved) return;

    const timeout = window.setTimeout(() => {
      setSaved(false);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [saved]);

  if (!product || !form) {
    return <ProductNotFound />;
  }

  const sizeType = getSizeTypeByCategory(form.category);
  const sizeOptions = sizeType?.sizes ?? [];

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleColor = (color) => {
    setColors((current) =>
      current.includes(color) ? current.filter((item) => item !== color) : [...current, color],
    );
  };

  const toggleSize = (size) => {
    setSizes((current) =>
      current.includes(size) ? current.filter((item) => item !== size) : [...current, size],
    );
  };

  const handleCategoryChange = (category) => {
    updateField('category', category);
    setSizes([]);
  };

  const handleSave = (event) => {
    event.preventDefault();

    const payload = {
      id: product.id,
      sku: product.sku,
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      gender: form.gender,
      badge: form.badge.trim(),
      stock: Number(form.stock),
      color: colors,
      sizes,
      description: form.description.trim(),
      material: form.material.trim(),
    };

    console.log('UPDATE PRODUCT:', payload);

    // Dummy sementara.
    // Nanti diganti dengan API PATCH Django.
    setSaved(true);
  };

  return (
    <div className="animate-page-enter w-full space-y-6">
      {/* HEADER */}

      <header className="mb-8">
        <Link
          to="/admin/products"
          className="font-label-caps text-text-muted hover:text-primary inline-flex cursor-pointer items-center gap-2 transition-colors duration-200"
        >
          <span className="material-symbols-outlined !text-[16px]">arrow_back</span>
          BACK TO PRODUCTS
        </Link>

        <div className="mt-6">
          <p className="font-label-caps text-text-muted">PRODUCT / EDIT</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-headline-lg-mobile text-primary md:font-headline-display">
              EDIT PRODUCT
            </h1>

            <span className="border-border-subtle bg-surface-container-low font-technical-data text-text-muted border px-2 py-1">
              {product.sku}
            </span>
          </div>
        </div>
      </header>

      {/* SUCCESS */}

      {saved && (
        <div className="border-primary bg-primary text-on-primary mb-6 border px-4 py-4 md:px-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined !text-[18px]">check_circle</span>

            <span className="font-label-caps">PRODUCT SAVED SUCCESSFULLY</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT */}

          <div className="min-w-0 space-y-6 lg:col-span-8">
            {/* GENERAL INFORMATION */}

            <section className="border-border-subtle bg-surface-container-lowest border">
              <SectionHeader title="GENERAL INFORMATION" description="Core product information" />

              <div className="space-y-6 p-5 sm:p-6 md:p-7">
                <Field
                  label="PRODUCT NAME"
                  value={form.name}
                  onChange={(value) => updateField('name', value)}
                  required
                />

                <Field
                  label="MATERIAL"
                  value={form.material}
                  onChange={(value) => updateField('material', value)}
                  placeholder="e.g. 100% Heavyweight Combed Cotton"
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Field label="PRODUCT SKU" value={product.sku} disabled />

                  <Field
                    label="PRICE"
                    type="number"
                    value={form.price}
                    onChange={(value) => updateField('price', value)}
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <SelectField
                    label="CATEGORY"
                    value={form.category}
                    onChange={handleCategoryChange}
                    options={PRODUCT_CATEGORIES}
                  />

                  <SelectField
                    label="GENDER"
                    value={form.gender}
                    onChange={(value) => updateField('gender', value)}
                    options={PRODUCT_GENDERS}
                  />
                </div>

                <Field
                  label="INITIAL STOCK"
                  type="number"
                  value={form.stock}
                  onChange={(value) => updateField('stock', value)}
                  min="0"
                  required
                />

                <Field
                  label="BADGE"
                  value={form.badge}
                  onChange={(value) => updateField('badge', value)}
                  placeholder="e.g. NEW"
                />

                <Field
                  label="DESCRIPTION"
                  value={form.description}
                  onChange={(value) => updateField('description', value)}
                  placeholder="Describe the product..."
                  multiline
                />
              </div>
            </section>

            {/* VARIANTS */}

            <section className="border-border-subtle bg-surface-container-lowest border">
              <SectionHeader title="VARIANTS" description="Available colors and sizes" />

              <div className="space-y-7 p-5 sm:p-6 md:p-7">
                <OptionGroup
                  label="COLORS"
                  options={COLOR_OPTIONS}
                  selected={colors}
                  onToggle={toggleColor}
                />

                <div className="bg-border-subtle h-px" />

                <div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="font-label-caps text-text-muted">SIZES</p>

                      <p className="font-technical-data text-text-muted mt-1">
                        {sizeType?.description}
                      </p>
                    </div>

                    <span className="font-technical-data text-text-muted">
                      {sizes.length} SELECTED
                    </span>
                  </div>

                  <div className="mt-3">
                    <OptionGroup
                      label=""
                      options={sizeOptions}
                      selected={sizes}
                      onToggle={toggleSize}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* IMAGES */}

            <section className="border-border-subtle bg-surface-container-lowest border">
              <SectionHeader title="PRODUCT IMAGES" description="Current product imagery" />

              <div className="p-5 sm:p-6 md:p-7">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  <ImagePreview label="PRIMARY" src={product.images?.primary} />

                  <ImagePreview label="DETAIL" src={product.images?.detail} />

                  {(product.images?.secondary ?? []).map((image, index) => (
                    <ImagePreview
                      key={`${image}-${index}`}
                      label={`SECONDARY ${index + 1}`}
                      src={image}
                    />
                  ))}
                </div>

                <div className="border-border-subtle bg-surface-container-low mt-5 border px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-text-muted mt-0.5 !text-[17px]">
                      info
                    </span>

                    <p className="font-technical-data text-text-muted">
                      Image upload will be connected to the backend later.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}

          <aside className="min-w-0 lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* PREVIEW */}

              <section className="border-border-subtle bg-surface-container-lowest border">
                <SectionHeader title="PREVIEW" description="Customer-facing appearance" />

                <div>
                  <div className="bg-surface-container-low">
                    {product.images?.primary ? (
                      <img
                        src={product.images.primary}
                        alt={form.name}
                        className="aspect-[3/4] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] items-center justify-center">
                        <span className="material-symbols-outlined text-text-muted !text-[32px]">
                          image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="font-label-caps text-primary">
                      {form.name || 'UNTITLED PRODUCT'}
                    </p>

                    <p className="font-technical-data text-text-muted mt-2 uppercase">
                      {form.category} / {form.gender}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <p className="font-technical-data text-primary">
                        {form.price ? formatPrice(form.price) : 'Rp 0'}
                      </p>

                      {form.badge && (
                        <span className="border-border-subtle bg-surface-container-low font-label-caps text-text-muted border px-2 py-1">
                          {form.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* PRODUCT INFO */}

              <section className="border-border-subtle bg-surface-container-lowest border">
                <SectionHeader title="PRODUCT INFO" description="Current catalog data" />

                <div className="p-5 sm:p-6">
                  <SummaryRow label="CATEGORY" value={form.category} />

                  <SummaryRow label="GENDER" value={form.gender} />

                  <SummaryRow label="STOCK" value={`${form.stock || 0} UNITS`} />

                  <SummaryRow
                    label="COLORS"
                    value={colors.length > 0 ? colors.join(' / ') : 'NOT SET'}
                  />

                  <SummaryRow label="SIZE TYPE" value={sizeType?.label ?? 'CUSTOM'} />

                  <SummaryRow
                    label="SIZES"
                    value={sizes.length > 0 ? sizes.join(' / ') : 'NOT SET'}
                    last
                  />
                </div>
              </section>

              {/* ACTIONS */}

              <section className="border-border-subtle bg-surface-container-lowest border p-5 sm:p-6">
                <button
                  type="submit"
                  className="bg-primary font-label-caps text-on-primary hover:bg-surface-tint focus:ring-primary focus:ring-offset-surface flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 px-5 py-3.5 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <span className="material-symbols-outlined !text-[17px]">save</span>
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="border-border-subtle font-label-caps text-text-muted hover:border-primary hover:text-primary focus:ring-primary focus:ring-offset-surface mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center border px-5 py-3.5 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  CANCEL
                </button>
              </section>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ title, description }) {
  return (
    <div className="border-border-subtle border-b px-5 py-4 sm:px-6 sm:py-5 md:px-7">
      <h2 className="font-label-caps text-primary">{title}</h2>

      {description && <p className="font-technical-data text-text-muted mt-1">{description}</p>}
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  disabled = false,
  min,
  required = false,
  multiline = false,
}) {
  const className = `
    mt-2
    w-full
    border
    border-border-subtle
    bg-surface
    px-3
    font-technical-data
    text-primary
    outline-none
    transition-colors
    duration-200
    placeholder:text-text-muted
    hover:border-outline
    focus:border-primary
    focus:ring-1
    focus:ring-primary
    disabled:cursor-not-allowed
    disabled:bg-surface-container-low
    disabled:text-text-muted
  `;

  return (
    <label className="block">
      <span className="font-label-caps text-text-muted">
        {label}

        {required && (
          <span className="ml-1" style={{ color: ERROR_COLOR }}>
            *
          </span>
        )}
      </span>

      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          rows={5}
          className={`${className} min-h-32 resize-y py-3`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          required={required}
          className={`${className} h-11`}
        />
      )}
    </label>
  );
}

/* =========================================================
   CUSTOM SELECT
========================================================= */

function SelectField({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option === value);

  return (
    <div className="relative">
      <span className="font-label-caps text-text-muted">{label}</span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`bg-surface mt-2 flex h-11 w-full cursor-pointer items-center justify-between border px-3 text-left transition-colors duration-200 outline-none ${
          open ? 'border-primary' : 'border-border-subtle hover:border-outline'
        } `}
      >
        <span className="font-technical-data text-primary uppercase">
          {selected ?? 'SELECT OPTION'}
        </span>

        <span
          className={`material-symbols-outlined text-text-muted !text-[18px] transition-transform duration-200 ${open ? 'rotate-180' : ''} `}
        >
          expand_more
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={`Close ${label} dropdown`}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            role="listbox"
            className="border-border-subtle bg-surface-container-lowest absolute top-[78px] right-0 left-0 z-20 overflow-hidden border py-1 shadow-lg"
          >
            {options.map((option) => {
              const active = option === value;

              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`font-technical-data flex min-h-11 w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left uppercase transition-colors duration-150 ${
                    active
                      ? 'bg-surface-container text-primary'
                      : 'text-text-muted hover:bg-surface-container-low hover:text-primary'
                  } `}
                >
                  <span>{option}</span>

                  {active && <span className="material-symbols-outlined !text-[17px]">check</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   OPTION GROUP
========================================================= */

function OptionGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      {label && <p className="font-label-caps text-text-muted">{label}</p>}

      <div className={`${label ? 'mt-3' : ''} flex flex-wrap gap-2`}>
        {options.map((option) => {
          const active = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className="font-technical-data inline-flex min-h-10 cursor-pointer items-center gap-2 border px-3 py-2 uppercase transition-colors duration-150"
              style={{
                borderColor: active ? 'var(--color-primary)' : undefined,
                backgroundColor: active ? 'var(--color-primary)' : undefined,
                color: active ? 'var(--color-on-primary)' : undefined,
              }}
            >
              {active && <span className="material-symbols-outlined !text-[15px]">check</span>}

              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   IMAGE PREVIEW
========================================================= */

function ImagePreview({ label, src }) {
  return (
    <div className="min-w-0">
      <div className="bg-surface-container-low aspect-[3/4] overflow-hidden">
        {src ? (
          <img src={src} alt={label} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="material-symbols-outlined text-text-muted !text-[28px]">image</span>
          </div>
        )}
      </div>

      <p className="font-label-caps text-text-muted mt-2 truncate">{label}</p>
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function SummaryRow({ label, value, last = false }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3 ${!last ? 'border-border-subtle border-b' : ''} `}
    >
      <span className="font-label text-text-muted shrink-0">{label}</span>

      <span className="font-technical-data text-primary min-w-0 text-right uppercase">{value}</span>
    </div>
  );
}

/* =========================================================
   NOT FOUND
========================================================= */

function ProductNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <span className="material-symbols-outlined text-text-muted !text-[36px]">inventory_2</span>

      <h1 className="font-headline-lg text-primary mt-4">PRODUCT NOT FOUND</h1>

      <p className="font-body-md text-text-muted mt-2 max-w-md">
        The requested product does not exist.
      </p>

      <Link
        to="/admin/products"
        className="border-primary font-label-caps text-primary hover:bg-primary hover:text-on-primary mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center border px-5 py-3 transition-colors duration-200"
      >
        BACK TO PRODUCTS
      </Link>
    </div>
  );
}
