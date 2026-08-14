import { Link } from "react-router-dom";

export default function ProductCard({
  id,
  name,
  price,
  category,
  images = [],
  primaryImage,
  secondaryImage,
  badge,
}) {
  // Mendukung format data baru: images[]
  // sekaligus format lama: primaryImage / secondaryImage
  const productImages =
    images.length > 0 ? images : [primaryImage, secondaryImage].filter(Boolean);

  const primary = productImages[0];
  const secondary = productImages[1];

  return (
    <Link
      to={`/products/${id}`}
      className="group relative flex h-full w-full flex-col bg-surface cursor-pointer"
    >
      {/* Image Wrapper */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface-container-low border border-border-subtle">
        {/* Primary Image */}
        {primary && (
          <img
            src={primary}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out opacity-100 group-hover:opacity-0"
            loading="lazy"
          />
        )}

        {/* Secondary Image */}
        {secondary && (
          <img
            src={secondary}
            alt={`${name} Detail`}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute top-2 left-2 border border-border-subtle bg-surface px-2 py-1 font-label-caps text-[10px] tracking-wider text-primary">
            {badge}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-grow flex-col p-4">
        <h3 className="font-technical-data text-technical-data font-bold uppercase truncate group-hover:underline">
          {name}
        </h3>

        {category && (
          <p className="mt-1 font-technical-data text-text-muted text-[11px] uppercase tracking-wider">
            {category}
          </p>
        )}

        <p className="mt-auto pt-2 font-technical-data text-technical-data text-primary">
          {price}
        </p>
      </div>
    </Link>
  );
}
