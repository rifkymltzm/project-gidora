import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useCart } from "../contexts/CartContext";
import PRODUCTS_DATA from "../data/products";

const COLOR_CLASSES = {
  black: "bg-black",
  white: "bg-white",
  olive: "bg-[#5c604e]",
  navy: "bg-[#1e293b]",
  beige: "bg-[#d6c7ae]",
  grey: "bg-[#9a9a96]",
  gray: "bg-[#9a9a96]",
  pink: "bg-[#d9a6b0]",
};

const ACCORDION_ITEMS = [
  {
    id: "details",
    label: "DETAILS",
    content: "Detailed description of the product goes here.",
  },
  {
    id: "material",
    label: "MATERIAL",
    content: "Material specifications and tech details.",
  },
  {
    id: "sizeFit",
    label: "SIZE & FIT",
    content: "Guidance on sizing and fit.",
  },
  {
    id: "shipping",
    label: "SHIPPING & RETURNS",
    content: "Shipping costs and return policy.",
  },
  {
    id: "care",
    label: "CARE",
    content: "Care instructions for the product.",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = PRODUCTS_DATA.find((item) => item.id === id);

  const { addToCart } = useCart();

  const galleryRef = useRef(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeAccordion, setActiveAccordion] = useState(null);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    return [
      product.images?.primary,
      product.images?.detail,
      ...(product.images?.secondary ?? []),
    ].filter(Boolean);
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product?.color) return [];

    return Array.isArray(product.color) ? product.color : [product.color];
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSize(product?.sizes?.[0] ?? "");
    setSelectedColor(availableColors[0] ?? "");
    setActiveAccordion(null);

    galleryRef.current?.scrollTo({
      left: 0,
      behavior: "auto",
    });
  }, [product, availableColors]);

  if (!product) {
    return <ProductNotFound />;
  }

  const activeImage = galleryImages[activeImageIndex];

  const goToImage = (index) => {
    if (!galleryImages.length) return;

    setActiveImageIndex((index + galleryImages.length) % galleryImages.length);
  };

  const handleMobileScroll = (event) => {
    if (galleryImages.length <= 1) return;

    const container = event.currentTarget;
    const slide = container.firstElementChild;

    if (!slide) return;

    const slideWidth = slide.getBoundingClientRect().width;

    if (!slideWidth) return;

    const index = Math.round(container.scrollLeft / slideWidth);

    setActiveImageIndex(Math.max(0, Math.min(index, galleryImages.length - 1)));
  };

  const goToMobileImage = (index) => {
    if (!galleryImages.length) return;

    const normalizedIndex =
      (index + galleryImages.length) % galleryImages.length;

    const container = galleryRef.current;
    const slide = container?.children[normalizedIndex];

    if (!container || !slide) return;

    container.scrollTo({
      left: slide.offsetLeft,
      behavior: "smooth",
    });

    setActiveImageIndex(normalizedIndex);
  };

  const toggleAccordion = (accordionId) => {
    setActiveAccordion((current) =>
      current === accordionId ? null : accordionId,
    );
  };

  return (
    <div className="min-h-[70vh] w-full flex-grow bg-surface">
      <main className="mx-auto max-w-screen-2xl px-margin-mobile pb-20 pt-28 md:px-margin-desktop md:pt-32">
        {/* =========================================================
           MOBILE BACK NAVIGATION
        ========================================================= */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 font-technical-data uppercase tracking-wide text-text-muted transition-colors duration-300 hover:text-primary md:hidden"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px", lineHeight: 1 }}
          >
            arrow_back
          </span>
          Previous Page
        </button>

        <Breadcrumb product={product} />

        {/* =========================================================
           PRODUCT LAYOUT
        ========================================================= */}

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <ProductGallery
            product={product}
            images={galleryImages}
            activeImage={activeImage}
            activeImageIndex={activeImageIndex}
            mobileCarouselRef={galleryRef}
            onGoToImage={goToImage}
            onMobileScroll={handleMobileScroll}
            onMobileNavigate={goToMobileImage}
          />

          <ProductInfo
            product={product}
            colors={availableColors}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            activeAccordion={activeAccordion}
            onColorChange={setSelectedColor}
            onSizeChange={setSelectedSize}
            onAccordionToggle={toggleAccordion}
            onAddToCart={addToCart}
          />
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   BREADCRUMB
========================================================= */

function Breadcrumb({ product }) {
  const category = encodeURIComponent(product.category.toLowerCase());

  return (
    <div className="mb-8 hidden items-center gap-2 md:flex">
      <Link
        to="/products"
        className="font-technical-data uppercase tracking-wide text-text-muted transition-colors duration-300 hover:text-primary"
      >
        Collections
      </Link>

      <span
        className="material-symbols-outlined text-text-muted"
        style={{ fontSize: "14px" }}
      >
        chevron_right
      </span>

      <Link
        to={`/products?category=${category}`}
        className="font-technical-data uppercase tracking-wide text-primary transition-colors duration-300 hover:text-text-muted"
      >
        {product.category}
      </Link>

      <span
        className="material-symbols-outlined text-text-muted"
        style={{ fontSize: "14px" }}
      >
        chevron_right
      </span>

      <span className="truncate font-technical-data uppercase tracking-wide text-text-muted">
        {product.name}
      </span>
    </div>
  );
}

/* =========================================================
   PRODUCT INFO
========================================================= */

function ProductInfo({
  product,
  colors,
  selectedColor,
  selectedSize,
  activeAccordion,
  onColorChange,
  onSizeChange,
  onAccordionToggle,
  onAddToCart,
}) {
  return (
    <div className="flex flex-col pl-0 pt-8 lg:col-span-6 lg:pl-8 lg:pt-0">
      {/* Product Header */}
      <div className="mb-8">
        <p className="mb-2 font-label-caps text-text-muted">GIDORA</p>

        <h1 className="mb-4 font-headline-lg-mobile text-primary md:font-headline-display">
          {product.name}
        </h1>

        <p className="mb-6 font-body-lg">{product.price}</p>

        <p className="border-t border-border-subtle pt-6 font-body-md text-text-muted">
          Essential pieces designed around movement, utility, and everyday life.
          Engineered with advanced technical fabrics for maximum performance in
          urban environments.
        </p>
      </div>

      {/* Color */}
      {colors.length > 0 && (
        <ColorSelector
          colors={colors}
          selectedColor={selectedColor}
          onChange={onColorChange}
        />
      )}

      {/* Size */}
      {product.sizes?.length > 0 && (
        <SizeSelector
          sizes={product.sizes}
          selectedSize={selectedSize}
          onChange={onSizeChange}
        />
      )}

      {/* Actions */}
      <ProductActions
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        onAddToCart={() =>
          onAddToCart({
            product,
            color: selectedColor,
            size: selectedSize,
          })
        }
      />

      {/* Accordion */}
      <div className="border-t border-border-subtle">
        {ACCORDION_ITEMS.map((item) => (
          <AccordionItem
            key={item.id}
            {...item}
            open={activeAccordion === item.id}
            onToggle={() => onAccordionToggle(item.id)}
          />
        ))}
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
      <p className="mb-3 font-label-caps">
        COLOR:
        <span className="ml-2 text-text-muted">
          {String(selectedColor).toUpperCase()}
        </span>
      </p>

      <div className="flex gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor === color;

          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              aria-label={`Select ${color}`}
              aria-pressed={isSelected}
              className={`h-8 w-8 cursor-pointer rounded-none border transition-all duration-300 hover:scale-105 ${
                isSelected ? "scale-105 border-primary" : "border-border-subtle"
              } ${getColorClass(color)}`}
            />
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
    <div className="mb-10">
      <div className="mb-3 flex justify-between">
        <p className="font-label-caps">SIZE</p>

        <button
          type="button"
          className="font-label-caps text-text-muted underline transition-colors duration-300 hover:text-primary"
        >
          SIZE GUIDE
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              aria-pressed={isSelected}
              className={`cursor-pointer rounded-none border py-3 text-center font-technical-data transition-all duration-300 ${
                isSelected
                  ? "border-primary bg-surface-container-low text-primary"
                  : "border-border-subtle text-text-muted hover:border-primary"
              }`}
            >
              {size.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   ACTIONS
========================================================= */

function ProductActions({ product, selectedColor, selectedSize, onAddToCart }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;

    const timeout = window.setTimeout(() => {
      setAdded(false);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [added]);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      return;
    }

    if (product.color && !selectedColor) {
      return;
    }

    onAddToCart();
    setAdded(true);
  };

  return (
    <div className="mb-12 flex flex-col gap-4 md:flex-row">
      <button
        type="button"
        onClick={handleAddToCart}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-none py-4 font-label-caps tracking-widest transition-colors duration-300 ${
          added
            ? "bg-secondary text-on-secondary"
            : "bg-primary text-on-primary hover:bg-surface-tint"
        }`}
      >
        {added && (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            check
          </span>
        )}

        {added ? "ADDED TO BAG" : "ADD TO BAG"}
      </button>

      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-border-subtle py-4 font-label-caps tracking-widest transition-colors duration-300 hover:border-primary hover:bg-surface-container-low"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "16px" }}
        >
          favorite
        </span>
        WISHLIST
      </button>
    </div>
  );
}

/* =========================================================
   PRODUCT GALLERY
========================================================= */

function ProductGallery({
  product,
  images,
  activeImage,
  activeImageIndex,
  mobileCarouselRef,
  onGoToImage,
  onMobileScroll,
  onMobileNavigate,
}) {
  return (
    <div className="lg:col-span-6">
      {/* Desktop */}
      <div className="hidden md:flex md:flex-row md:gap-4">
        <div className="no-scrollbar flex w-24 shrink-0 flex-col gap-4 overflow-y-auto">
          {images.map((image, index) => (
            <GalleryThumbnail
              key={`${image}-${index}`}
              image={image}
              productName={product.name}
              index={index}
              active={index === activeImageIndex}
              onClick={() => onGoToImage(index)}
            />
          ))}
        </div>

        <div className="group relative aspect-square min-w-0 flex-1 overflow-hidden border border-border-subtle bg-surface-container-low">
          {activeImage && (
            <img
              key={activeImage}
              src={activeImage}
              alt={product.name}
              className="absolute inset-0 h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
          )}

          {images.length > 1 && (
            <>
              <GalleryButton
                direction="previous"
                onClick={() => onGoToImage(activeImageIndex - 1)}
              />

              <GalleryButton
                direction="next"
                onClick={() => onGoToImage(activeImageIndex + 1)}
              />

              <GalleryCounter
                current={activeImageIndex + 1}
                total={images.length}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div
          ref={mobileCarouselRef}
          onScroll={onMobileScroll}
          className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="w-full shrink-0 snap-center"
            >
              <div className="relative aspect-square w-full overflow-hidden border border-border-subtle bg-surface-container-low">
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <MobileGalleryControls
            count={images.length}
            activeIndex={activeImageIndex}
            onPrevious={() => onMobileNavigate(activeImageIndex - 1)}
            onNext={() => onMobileNavigate(activeImageIndex + 1)}
            onSelect={onMobileNavigate}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   GALLERY THUMBNAIL
========================================================= */

function GalleryThumbnail({ image, productName, index, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View image ${index + 1}`}
      aria-current={active ? "true" : undefined}
      className={`group relative aspect-square w-full shrink-0 cursor-pointer overflow-hidden border bg-surface-container-low transition-colors duration-300 ${
        active ? "border-primary" : "border-border-subtle hover:border-primary"
      }`}
    >
      <img
        src={image}
        alt={`${productName} ${index + 1}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
    </button>
  );
}

/* =========================================================
   GALLERY COUNTER
========================================================= */

function GalleryCounter({ current, total }) {
  return (
    <div className="absolute bottom-4 right-4 z-10 border border-border-subtle bg-surface/90 px-3 py-2 backdrop-blur-sm">
      <span className="font-technical-data text-primary">
        {String(current).padStart(2, "0")}
      </span>

      <span className="mx-1 font-technical-data text-text-muted">/</span>

      <span className="font-technical-data text-text-muted">
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

/* =========================================================
   GALLERY BUTTON
========================================================= */

function GalleryButton({ direction, onClick }) {
  const isPrevious = direction === "previous";
  const icon = isPrevious ? "chevron_left" : "chevron_right";
  const position = isPrevious ? "left-4" : "right-4";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${direction} image`}
      className={`absolute ${position} top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center border border-border-subtle bg-surface/90 text-primary opacity-0 backdrop-blur-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-on-primary group-hover:opacity-100`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        {icon}
      </span>
    </button>
  );
}

/* =========================================================
   MOBILE GALLERY CONTROLS
========================================================= */

function MobileGalleryControls({
  count,
  activeIndex,
  onPrevious,
  onNext,
  onSelect,
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <MobileGalleryButton
        icon="chevron_left"
        label="Previous image"
        onClick={onPrevious}
      />

      <div className="flex items-center gap-1.5">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Go to image ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className="flex cursor-pointer items-center justify-center p-1"
          >
            <span
              className={`block h-1 transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-border-subtle"
              }`}
            />
          </button>
        ))}
      </div>

      <MobileGalleryButton
        icon="chevron_right"
        label="Next image"
        onClick={onNext}
      />
    </div>
  );
}

function MobileGalleryButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border-subtle text-primary transition-colors duration-300 hover:border-primary hover:bg-surface-container-low"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {icon}
      </span>
    </button>
  );
}

/* =========================================================
   ACCORDION
========================================================= */

function AccordionItem({ label, content, open, onToggle }) {
  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between py-5"
      >
        <span className="font-label-caps tracking-widest transition-colors duration-300 group-hover:text-text-muted">
          {label}
        </span>

        <span
          className="material-symbols-outlined"
          style={{ fontSize: "18px" }}
        >
          {open ? "remove" : "add"}
        </span>
      </button>

      {open && (
        <div className="px-1 pb-5 font-body-md text-text-muted">{content}</div>
      )}
    </div>
  );
}

/* =========================================================
   NOT FOUND
========================================================= */

function ProductNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-margin-mobile">
      <div className="text-center">
        <p className="mb-4 font-headline-lg-mobile text-primary md:font-headline-lg">
          PRODUCT NOT FOUND
        </p>

        <p className="font-body-md text-text-muted">
          Produk yang Anda cari tidak tersedia.
        </p>

        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 border border-primary px-5 py-3 font-label-caps text-primary transition-colors duration-300 hover:bg-primary hover:text-on-primary"
        >
          BACK TO COLLECTIONS
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getColorClass(color) {
  return (
    COLOR_CLASSES[String(color).trim().toLowerCase()] ??
    "bg-surface-container-high"
  );
}
