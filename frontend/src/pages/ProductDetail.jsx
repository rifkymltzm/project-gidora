import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useCart } from '../features/cart/context/CartContext';
import PRODUCTS_DATA from '../features/products/data/products';
import ProductGallery from '../features/products/components/ProductGallery';
import ProductInfo from '../features/products/components/ProductInfo';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = PRODUCTS_DATA.find((item) => item.slug === slug);
  const galleryRef = useRef(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const availableColors = product?.colors ?? [];

  /*
   * Normalize secondary image karena di products.js
   * ada product yang secondary-nya array dan ada yang string.
   */
  const secondaryImages = useMemo(() => {
    if (!product?.images?.secondary) return [];

    return Array.isArray(product.images.secondary)
      ? product.images.secondary
      : [product.images.secondary];
  }, [product]);

  /*
   * Semua image yang tersedia untuk product:
   *
   * 1. Image dari semua variant/color
   * 2. Primary image
   * 3. Detail image
   * 4. Secondary images
   *
   * Duplicate image dibuang supaya image yang sama
   * tidak muncul dua kali di thumbnail/gallery.
   *
   * selectedColor TIDAK menjadi dependency karena
   * daftar gallery harus tetap menampilkan semua image.
   */
  const galleryImages = useMemo(() => {
    if (!product) return [];

    const colorImages = (product.colors ?? []).map((color) => color.image).filter(Boolean);

    const productImages = [
      product.images?.primary,
      product.images?.detail,
      ...secondaryImages,
    ].filter(Boolean);

    return [...colorImages, ...productImages].filter(
      (image, index, array) => array.indexOf(image) === index,
    );
  }, [product, secondaryImages]);

  /*
   * Reset state ketika product berubah.
   */
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSize('');
    setSelectedColor(null);
    setActiveAccordion(null);

    galleryRef.current?.scrollTo({
      left: 0,
      behavior: 'auto',
    });
  }, [product]);

  if (!product) {
    return <ProductNotFound />;
  }

  const activeImage = galleryImages[activeImageIndex];

  /*
   * Navigate gallery image untuk desktop.
   */
  const goToImage = (index) => {
    if (!galleryImages.length) return;

    setActiveImageIndex(normalizeIndex(index, galleryImages.length));
  };

  /*
   * Detect active image berdasarkan posisi scroll
   * pada mobile carousel.
   */
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

  /*
   * Navigate image pada mobile carousel.
   */
  const goToMobileImage = (index) => {
    if (!galleryImages.length) return;

    const normalizedIndex = normalizeIndex(index, galleryImages.length);

    const container = galleryRef.current;
    const slide = container?.children[normalizedIndex];

    if (!container || !slide) return;

    container.scrollTo({
      left: slide.offsetLeft,
      behavior: 'smooth',
    });

    setActiveImageIndex(normalizedIndex);
  };

  /*
   * Change color.
   *
   * Color selector tetap mengubah main image
   * ke image milik color tersebut.
   *
   * Daftar thumbnail/gallery TIDAK berubah.
   */
  const handleColorChange = (color) => {
    setSelectedColor(color);

    const colorImageIndex = galleryImages.indexOf(color.image);

    if (colorImageIndex !== -1) {
      setActiveImageIndex(colorImageIndex);

      /*
       * Scroll mobile carousel ke image color yang dipilih.
       * Desktop tidak membutuhkan scroll karena main image
       * menggunakan activeImageIndex secara langsung.
       */
      const container = galleryRef.current;
      const slide = container?.children[colorImageIndex];

      if (container && slide) {
        container.scrollTo({
          left: slide.offsetLeft,
          behavior: 'smooth',
        });
      }
    }

    /*
     * Kalau size yang sedang dipilih tidak tersedia
     * pada warna baru, reset size.
     */
    const availableSizesForColor = new Set(
      (product.variants ?? [])
        .filter((variant) => variant.colorId === color.id)
        .map((variant) => variant.size),
    );

    if (!availableSizesForColor.has(selectedSize)) {
      setSelectedSize('');
    }
  };

  const toggleAccordion = (accordionId) => {
    setActiveAccordion((current) => (current === accordionId ? null : accordionId));
  };

  return (
    <div className="bg-surface min-h-[70vh] w-full flex-grow">
      <main className="px-margin-mobile md:px-margin-desktop mx-auto max-w-screen-2xl pt-22 pb-20 md:pt-28">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="font-label-caps text-text-muted hover:text-primary mb-6 flex items-center gap-1.5 tracking-wide uppercase transition-colors duration-300 md:hidden"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px', lineHeight: 1 }}>
            arrow_back
          </span>
          Previous Page
        </button>

        <Breadcrumb product={product} />

        <div className="gap-gutter grid grid-cols-1 lg:grid-cols-12">
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
            onColorChange={handleColorChange}
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
        className="font-label-caps text-text-muted hover:text-primary tracking-wide transition-colors duration-300"
      >
        Collections
      </Link>

      <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '14px' }}>
        chevron_right
      </span>

      <Link
        to={`/products?category=${category}`}
        className="font-label-caps text-primary hover:text-text-muted tracking-wide transition-colors duration-300"
      >
        {product.category}
      </Link>

      <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '14px' }}>
        chevron_right
      </span>

      <span className="font-technical-data text-text-muted truncate tracking-wide uppercase">
        {product.name}
      </span>
    </div>
  );
}

/* =========================================================
   NOT FOUND
========================================================= */

function ProductNotFound() {
  return (
    <div className="bg-surface px-margin-mobile flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="font-headline-lg-mobile text-primary md:font-headline-lg mb-4">
          PRODUCT NOT FOUND
        </p>

        <p className="font-body-md text-text-muted">Produk yang Anda cari tidak tersedia.</p>

        <Link
          to="/products"
          className="border-primary font-label-caps text-primary hover:bg-primary hover:text-on-primary mt-6 inline-flex items-center gap-2 border px-5 py-3 transition-colors"
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

function normalizeIndex(index, length) {
  return (index + length) % length;
}
