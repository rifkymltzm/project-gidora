export default function ProductGallery({
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
      {/* =====================================================
         DESKTOP
      ===================================================== */}

      <div className="hidden md:flex md:items-start md:gap-4">
        {/* Thumbnails */}

        <div className="relative min-h-0">
          <div
            data-lenis-prevent
            className="no-scrollbar h-[calc(100vh-180px)] max-h-[calc(100vh-180px)] w-[88px] shrink-0 overflow-y-auto overscroll-contain lg:w-[96px]"
          >
            <div className="flex flex-col gap-4">
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
          </div>

          {images.length > 4 && (
            <div className="from-surface pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t to-transparent" />
          )}
        </div>

        {/* Main Image */}

        <div className="group border-border-subtle bg-surface-container-low relative aspect-square min-w-0 flex-1 overflow-hidden border">
          {activeImage && (
            <img
              src={activeImage}
              alt={product.name}
              className="block h-full w-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
          )}

          {images.length > 1 && (
            <>
              <GalleryButton
                direction="previous"
                onClick={() => onGoToImage(activeImageIndex - 1)}
              />

              <GalleryButton direction="next" onClick={() => onGoToImage(activeImageIndex + 1)} />

              <GalleryCounter current={activeImageIndex + 1} total={images.length} />
            </>
          )}
        </div>
      </div>

      {/* =====================================================
         MOBILE
      ===================================================== */}

      <div className="md:hidden">
        <div
          ref={mobileCarouselRef}
          onScroll={onMobileScroll}
          className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="w-full shrink-0 snap-center">
              <div className="border-border-subtle bg-surface-container-low relative aspect-square w-full overflow-hidden border">
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="block h-full w-full object-contain object-center"
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
      aria-current={active ? 'true' : undefined}
      className={`group bg-surface-container-low relative aspect-square w-full shrink-0 cursor-pointer overflow-hidden border transition-colors duration-300 ${
        active ? 'border-primary' : 'border-border-subtle hover:border-primary'
      } `}
    >
      <img
        src={image}
        alt={`${productName} ${index + 1}`}
        className="block h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
    </button>
  );
}

/* =========================================================
   GALLERY COUNTER
========================================================= */

function GalleryCounter({ current, total }) {
  return (
    <div className="border-border-subtle bg-surface/90 absolute right-4 bottom-4 z-10 border px-3 py-2 backdrop-blur-sm">
      <span className="font-technical-data text-primary">{String(current).padStart(2, '0')}</span>

      <span className="font-technical-data text-text-muted mx-1">/</span>

      <span className="font-technical-data text-text-muted">{String(total).padStart(2, '0')}</span>
    </div>
  );
}

/* =========================================================
   GALLERY BUTTON
========================================================= */

function GalleryButton({ direction, onClick }) {
  const isPrevious = direction === 'previous';
  const icon = isPrevious ? 'chevron_left' : 'chevron_right';
  const position = isPrevious ? 'left-4' : 'right-4';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${direction} image`}
      className={`absolute ${position} border-border-subtle bg-surface/90 text-primary hover:border-primary hover:bg-primary hover:text-on-primary top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center border opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
        {icon}
      </span>
    </button>
  );
}

/* =========================================================
   MOBILE GALLERY CONTROLS
========================================================= */

function MobileGalleryControls({ count, activeIndex, onPrevious, onNext, onSelect }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <MobileGalleryButton icon="chevron_left" label="Previous image" onClick={onPrevious} />

      <div className="flex items-center gap-1.5">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Go to image ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className="flex cursor-pointer items-center justify-center p-1"
          >
            <span
              className={`block h-1 transition-all duration-300 ${
                index === activeIndex ? 'bg-primary w-6' : 'bg-border-subtle w-2'
              }`}
            />
          </button>
        ))}
      </div>

      <MobileGalleryButton icon="chevron_right" label="Next image" onClick={onNext} />
    </div>
  );
}

/* =========================================================
   MOBILE GALLERY BUTTON
========================================================= */

function MobileGalleryButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="border-border-subtle text-primary hover:border-primary hover:bg-surface-container-low flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors duration-300"
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
        {icon}
      </span>
    </button>
  );
}
