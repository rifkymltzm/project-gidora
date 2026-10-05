import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button';

import { formatPrice } from '@/utils/formatPrice';
import { getProductInfo } from '../data/productOptions';

const COLOR_CLASSES = {
  black: 'bg-black',
  white: 'bg-white',
  olive: 'bg-[#5c604e]',
  navy: 'bg-[#1e293b]',
  beige: 'bg-[#d6c7ae]',
  gray: 'bg-[#9a9a96]',
  pink: 'bg-[#d9a6b0]',
};

export default function ProductInfo({
  product,
  colors = [],
  selectedColor,
  selectedSize,
  activeAccordion,
  onColorChange,
  onSizeChange,
  onAccordionToggle,
  onAddToCart,
}) {
  const [quantity, setQuantity] = useState(1);

  const sizes = useMemo(() => {
    return [
      ...new Set(
        (product.variants ?? [])
          .filter((variant) => {
            if (!selectedColor) return true;

            return variant.colorId === selectedColor.id;
          })
          .map((variant) => variant.size),
      ),
    ];
  }, [product.variants, selectedColor]);

  /*
   * Variant aktif hanya ada kalau warna + size sudah dipilih.
   */
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;

    return (
      product.variants?.find(
        (variant) => variant.colorId === selectedColor.id && variant.size === selectedSize,
      ) ?? null
    );
  }, [product.variants, selectedColor, selectedSize]);

  const hasSelectedVariant = Boolean(selectedVariant);
  const variantStock = selectedVariant?.stock ?? 0;
  const isOutOfStock = hasSelectedVariant && variantStock <= 0;

  /*
   * SKU:
   * - belum pilih variant => SKU product utama
   * - sudah pilih variant => SKU variant
   */
  const displaySku = selectedVariant?.sku ?? product.sku;

  const productInfo = getProductInfo(product.category);

  /*
   * Reset quantity kalau variant berubah.
   */
  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

  /*
   * Kalau stock lebih kecil dari quantity sekarang,
   * quantity diturunkan otomatis.
   */
  useEffect(() => {
    if (variantStock > 0 && quantity > variantStock) {
      setQuantity(variantStock);
    }
  }, [variantStock, quantity]);

  const handleSizeChange = (size) => {
    onSizeChange(size);
  };

  const handleQuantityChange = (value) => {
    if (!hasSelectedVariant || isOutOfStock) return;

    const nextQuantity = Math.max(1, Math.min(value, variantStock));

    setQuantity(nextQuantity);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    onAddToCart({
      product,
      color: selectedColor,
      size: selectedSize,
      quantity,
      variant: selectedVariant,
    });
  };

  return (
    <div className="flex flex-col pt-8 pl-0 lg:col-span-6 lg:pt-0 lg:pl-8">
      {/* Product Header */}

      <div className="mb-8">
        <p className="font-label-caps text-text-muted mb-2">GIDORA</p>

        <h1 className="font-headline-lg-mobile text-primary md:font-headline-display mb-4">
          {product.name}
        </h1>

        <div className="border-border-subtle mb-6 flex items-center gap-2 border-y py-4 font-semibold">
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
            local_atm
          </span>

          <p className="font-technical-data text-primary text-xl md:text-2xl">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* SKU */}

        <p className="font-input text-text-muted mt-5 text-xs tracking-wider uppercase">
          <strong className="text-primary">SKU :</strong> {displaySku}
        </p>

        {/* Material */}

        {product.material && (
          <p className="font-input text-text-muted pt-4 text-xs leading-6 tracking-wider uppercase">
            <strong className="text-primary">Material :</strong> {product.material}
          </p>
        )}

        {/* Description */}

        <p className="font-input text-text-muted mt-3">{product.description}</p>
      </div>

      {/* Color */}

      {colors.length > 0 && (
        <ColorSelector colors={colors} selectedColor={selectedColor} onChange={onColorChange} />
      )}

      {/* Size */}

      {sizes.length > 0 && (
        <SizeSelector sizes={sizes} selectedSize={selectedSize} onChange={handleSizeChange} />
      )}

      {/* Quantity */}

      {hasSelectedVariant && !isOutOfStock && (
        <QuantitySelector
          quantity={quantity}
          stock={variantStock}
          onChange={handleQuantityChange}
        />
      )}

      {/* Actions */}

      <ProductActions
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onAddToCart={handleAddToCart}
      />

      {/* Accordion */}

      <div className="border-border-subtle border-t">
        <AccordionItem
          id="shipping"
          label="SHIPPING & RETURNS"
          content={productInfo.shipping}
          open={activeAccordion === 'shipping'}
          onToggle={() => onAccordionToggle('shipping')}
        />

        <AccordionItem
          id="care"
          label="CARE"
          content={productInfo.care}
          open={activeAccordion === 'care'}
          onToggle={() => onAccordionToggle('care')}
        />
      </div>
    </div>
  );
}

/* =========================================================
   COLOR
========================================================= */

function ColorSelector({ colors, selectedColor, onChange }) {
  return (
    <div className="mb-8">
      <p className="font-label-caps mb-3">
        COLOR:
        <span className="text-text-muted ml-2">
          {selectedColor?.name?.toUpperCase() ?? 'SELECT COLOR'}
        </span>
      </p>

      <div className="flex gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id;

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onChange(color)}
              aria-label={`Select ${color.name}`}
              aria-pressed={isSelected}
              className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border transition-colors duration-300 ${
                isSelected ? 'border-primary' : 'border-border-subtle'
              } ${getColorClass(color.name)}`}
            >
              {isSelected && (
                <span
                  className={`material-symbols-outlined ${
                    color.name.toLowerCase() === 'white' ? 'text-black' : 'text-white'
                  }`}
                  style={{
                    fontSize: '15px',
                    lineHeight: 1,
                    fontWeight: 700,
                  }}
                >
                  check
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   SIZE
========================================================= */

function SizeSelector({ sizes, selectedSize, onChange }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex justify-between">
        <p className="font-label-caps">SIZE</p>

        <button
          type="button"
          className="font-label-caps text-text-muted hover:text-primary underline transition-colors duration-300"
        >
          SIZE GUIDE
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2 md:grid-cols-13">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;

          return (
            <Button
              key={size}
              type="button"
              variant={isSelected ? 'selected' : 'secondary'}
              size="sm"
              onClick={() => onChange(size)}
              aria-pressed={isSelected}
            >
              {size.toUpperCase()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   QUANTITY
========================================================= */

function QuantitySelector({ quantity, stock, onChange }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-label-caps">QUANTITY</p>

        <p className="font-technical-data text-text-muted text-xs">{stock} AVAILABLE</p>
      </div>

      <div className="border-tertiary-fixed-dim flex w-fit items-center border-b">
        <button
          type="button"
          onClick={() => onChange(quantity - 1)}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="text-text-muted hover:text-primary flex h-10 w-10 cursor-pointer items-center justify-center transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="material-symbols-outlined !text-[18px]" aria-hidden="true">
            remove
          </span>
        </button>

        <div
          className="font-technical-data text-secondary flex h-10 min-w-12 items-center justify-center text-base"
          aria-live="polite"
        >
          {quantity}
        </div>

        <button
          type="button"
          onClick={() => onChange(quantity + 1)}
          disabled={quantity >= stock}
          aria-label="Increase quantity"
          className="text-text-muted hover:text-primary flex h-10 w-10 cursor-pointer items-center justify-center transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="material-symbols-outlined !text-[18px]" aria-hidden="true">
            add
          </span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   ACTIONS
========================================================= */

function ProductActions({ selectedColor, selectedSize, selectedVariant, quantity, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (!added) return;

    const timeout = window.setTimeout(() => {
      setAdded(false);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [added]);

  const hasSelectedVariant = Boolean(selectedVariant);
  const isOutOfStock = hasSelectedVariant && selectedVariant.stock <= 0;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize || !selectedVariant) {
      return;
    }

    if (selectedVariant.stock <= 0) {
      return;
    }

    onAddToCart();
    setAdded(true);
  };

  let buttonLabel = 'SELECT VARIANT';

  if (hasSelectedVariant && isOutOfStock) {
    buttonLabel = 'OUT OF STOCK';
  } else if (hasSelectedVariant && added) {
    buttonLabel = `ADDED ${quantity} TO BAG`;
  } else if (hasSelectedVariant) {
    buttonLabel = 'ADD TO BAG';
  }

  const isDisabled = !hasSelectedVariant || isOutOfStock;

  return (
    <div className="mb-12 flex flex-col gap-4 md:flex-row">
      <Button
        type="button"
        variant="primary"
        size="full"
        onClick={handleAddToCart}
        disabled={isDisabled}
        icon={!hasSelectedVariant || isOutOfStock ? 'block' : added ? 'check' : 'shopping_bag'}
        iconPosition={hasSelectedVariant ? 'right' : 'left'}
      >
        {buttonLabel}
      </Button>

      <Button
        type="button"
        variant={wishlisted ? 'soft' : 'outline'}
        size="full"
        onClick={() => setWishlisted((prev) => !prev)}
        icon="favorite"
        iconPosition="left"
        iconFilled={wishlisted}
        aria-pressed={wishlisted}
      >
        {wishlisted ? 'WISHLISTED' : 'WISHLIST'}
      </Button>
    </div>
  );
}

/* =========================================================
   ACCORDION
========================================================= */

function AccordionItem({ label, content, open, onToggle }) {
  return (
    <div className="border-border-subtle border-b">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between py-5"
      >
        <span className="font-label-caps group-hover:text-text-muted tracking-widest transition-colors duration-300">
          {label}
        </span>

        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          {open ? 'remove' : 'add'}
        </span>
      </button>

      {open && <div className="font-input text-text-muted px-1 pb-5">{content}</div>}
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getColorClass(color) {
  return COLOR_CLASSES[String(color).trim().toLowerCase()] ?? 'bg-surface-container-high';
}
