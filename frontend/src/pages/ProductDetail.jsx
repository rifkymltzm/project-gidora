import { useParams } from "react-router-dom";
import { useState } from "react";
import PRODUCTS_DATA from "../data/products";

export default function ProductDetail() {
  const { id } = useParams();

  // Cari produk berdasarkan ID
  const product = PRODUCTS_DATA.find((item) => item.id === id);

  // Semua hooks harus dipanggil sebelum conditional return
  const images = product?.images || [];

  const [activeImage, setActiveImage] = useState(images[0] || "");
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.color || "");
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (section) => {
    setActiveAccordion((current) => (current === section ? null : section));
  };

  // Jika produk tidak ditemukan
  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <p className="font-headline-lg text-primary mb-4">
            PRODUCT NOT FOUND
          </p>

          <p className="font-body-md text-text-muted">
            Produk yang Anda cari tidak tersedia.
          </p>
        </div>
      </div>
    );
  }

  // Warna yang tersedia untuk produk
  const availableColors = [product.color].filter(Boolean);

  return (
    <div className="flex-grow w-full bg-surface min-h-[70vh]">
      {/* =====================================================
          PRODUCT DETAIL
      ===================================================== */}
      <main className="pt-28 md:pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* =================================================
              GALLERY
          ================================================= */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* THUMBNAILS */}
              <div
                className="
                  order-2 md:order-1
                  flex flex-row md:flex-col
                  gap-3 md:gap-4
                  overflow-x-auto md:overflow-y-auto
                  no-scrollbar
                  w-full md:w-24
                  shrink-0
                "
              >
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    aria-label={`View image ${index + 1}`}
                    className={`
                      relative
                      shrink-0
                      w-20 md:w-full
                      aspect-[3/4]
                      overflow-hidden
                      border
                      transition-colors
                      ${
                        activeImage === image
                          ? "border-primary"
                          : "border-border-subtle hover:border-primary"
                      }
                    `}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* MAIN IMAGE */}
              <div
                className="
                  order-1 md:order-2
                  relative
                  w-full
                  aspect-[3/4]
                  md:aspect-auto
                  md:h-[819px]
                  bg-surface-container-low
                  border border-border-subtle
                  overflow-hidden
                "
              >
                {activeImage && (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                    "
                  />
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}
          <div className="lg:col-span-4 flex flex-col pt-8 lg:pt-0 pl-0 lg:pl-8">
            {/* Product Header */}
            <div className="mb-8">
              <p className="font-label-caps text-text-muted mb-2 tracking-widest uppercase">
                GIDORA
              </p>

              <h1 className="font-headline-display text-primary font-medium mb-4">
                {product.name.toUpperCase()}
              </h1>

              <p className="font-body-lg mb-6">{product.price}</p>

              <p className="font-body-md text-text-muted border-t border-border-subtle pt-6">
                Essential pieces designed around movement, utility, and everyday
                life. Engineered with advanced technical fabrics for maximum
                performance in urban environments.
              </p>
            </div>

            {/* =================================================
                COLOR
            ================================================= */}
            <div className="mb-8">
              <p className="font-label-caps mb-3">
                COLOR:
                <span className="text-text-muted ml-2">
                  {selectedColor.toUpperCase()}
                </span>
              </p>

              <div className="flex gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() => setSelectedColor(color)}
                    className={`
                      w-8 h-8
                      rounded-none
                      border
                      ${
                        color === "black"
                          ? "bg-black"
                          : color === "olive"
                            ? "bg-[#5c604e]"
                            : color === "navy"
                              ? "bg-[#1e293b]"
                              : color === "beige"
                                ? "bg-[#d6c7ae]"
                                : "bg-surface-container-high"
                      }
                      ${
                        selectedColor === color
                          ? "border-primary"
                          : "border-border-subtle"
                      }
                    `}
                  />
                ))}
              </div>
            </div>

            {/* =================================================
                SIZE
            ================================================= */}
            <div className="mb-10">
              <div className="flex justify-between mb-3">
                <p className="font-label-caps">SIZE</p>

                <a
                  href="#"
                  className="font-label-caps underline text-text-muted hover:text-primary"
                >
                  SIZE GUIDE
                </a>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`
                      py-3
                      border
                      transition-colors
                      font-technical-data
                      text-center
                      rounded-none
                      ${
                        selectedSize === size
                          ? "border-primary bg-surface-container-low text-primary"
                          : "border-border-subtle text-text-muted hover:border-primary"
                      }
                    `}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================
                CTA
            ================================================= */}
            <div className="flex flex-col gap-4 mb-12">
              <button
                type="button"
                className="
                  w-full
                  bg-primary
                  text-on-primary
                  py-4
                  font-label-caps
                  tracking-widest
                  hover:bg-surface-tint
                  transition-colors
                  rounded-none
                "
              >
                ADD TO BAG
              </button>

              <button
                type="button"
                className="
                  w-full
                  py-4
                  font-label-caps
                  tracking-widest
                  border border-border-subtle
                  hover:border-primary
                  transition-colors
                  flex items-center justify-center gap-2
                  rounded-none
                "
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

            {/* =================================================
                ACCORDION
            ================================================= */}
            <div className="border-t border-border-subtle">
              {/* DETAILS */}
              <div className="border-b border-border-subtle">
                <button
                  type="button"
                  className="w-full py-5 flex justify-between items-center group"
                  onClick={() => toggleAccordion("details")}
                >
                  <span className="font-label-caps tracking-widest group-hover:text-text-muted transition-colors">
                    DETAILS
                  </span>

                  <span className="material-symbols-outlined">
                    {activeAccordion === "details" ? "remove" : "add"}
                  </span>
                </button>

                {activeAccordion === "details" && (
                  <div className="p-4 font-body-md text-text-muted">
                    Detailed description of the product goes here.
                  </div>
                )}
              </div>

              {/* MATERIAL */}
              <div className="border-b border-border-subtle">
                <button
                  type="button"
                  className="w-full py-5 flex justify-between items-center group"
                  onClick={() => toggleAccordion("material")}
                >
                  <span className="font-label-caps tracking-widest group-hover:text-text-muted transition-colors">
                    MATERIAL
                  </span>

                  <span className="material-symbols-outlined">
                    {activeAccordion === "material" ? "remove" : "add"}
                  </span>
                </button>

                {activeAccordion === "material" && (
                  <div className="p-4 font-body-md text-text-muted">
                    Material specifications and tech details.
                  </div>
                )}
              </div>

              {/* SIZE & FIT */}
              <div className="border-b border-border-subtle">
                <button
                  type="button"
                  className="w-full py-5 flex justify-between items-center group"
                  onClick={() => toggleAccordion("sizeFit")}
                >
                  <span className="font-label-caps tracking-widest group-hover:text-text-muted transition-colors">
                    SIZE & FIT
                  </span>

                  <span className="material-symbols-outlined">
                    {activeAccordion === "sizeFit" ? "remove" : "add"}
                  </span>
                </button>

                {activeAccordion === "sizeFit" && (
                  <div className="p-4 font-body-md text-text-muted">
                    Guidance on sizing and fit.
                  </div>
                )}
              </div>

              {/* SHIPPING & RETURNS */}
              <div className="border-b border-border-subtle">
                <button
                  type="button"
                  className="w-full py-5 flex justify-between items-center group"
                  onClick={() => toggleAccordion("shipping")}
                >
                  <span className="font-label-caps tracking-widest group-hover:text-text-muted transition-colors">
                    SHIPPING & RETURNS
                  </span>

                  <span className="material-symbols-outlined">
                    {activeAccordion === "shipping" ? "remove" : "add"}
                  </span>
                </button>

                {activeAccordion === "shipping" && (
                  <div className="p-4 font-body-md text-text-muted">
                    Shipping costs and return policy.
                  </div>
                )}
              </div>

              {/* CARE */}
              <div className="border-b border-border-subtle">
                <button
                  type="button"
                  className="w-full py-5 flex justify-between items-center group"
                  onClick={() => toggleAccordion("care")}
                >
                  <span className="font-label-caps tracking-widest group-hover:text-text-muted transition-colors">
                    CARE
                  </span>

                  <span className="material-symbols-outlined">
                    {activeAccordion === "care" ? "remove" : "add"}
                  </span>
                </button>

                {activeAccordion === "care" && (
                  <div className="p-4 font-body-md text-text-muted">
                    Care instructions for the product.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
