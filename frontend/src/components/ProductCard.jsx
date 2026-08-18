import { Link } from "react-router-dom";

export default function ProductCard({
  id,
  name,
  price,
  category,
  images,
  badge,
}) {
  const { primary: primaryImage, detail: detailImage } = images ?? {};

  return (
    <Link
      to={`/products/${id}`}
      className="group relative flex h-full w-full cursor-pointer flex-col bg-surface"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-border-subtle bg-surface-container-low">
        {primaryImage && (
          <img
            src={primaryImage}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500 ease-in-out group-hover:opacity-0"
            loading="lazy"
          />
        )}

        {detailImage && (
          <img
            src={detailImage}
            alt={`${name} detail`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {badge && (
          <div className="absolute left-2 top-2 border border-border-subtle bg-surface px-2 py-1 font-label-caps text-primary">
            {badge}
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col px-3 py-3 md:px-4 md:py-4">
        <h3 className="truncate font-technical-data font-medium uppercase transition-colors duration-200 group-hover:text-text-muted">
          {name}
        </h3>

        {category && (
          <p className="mt-1 font-label-caps text-text-muted">{category}</p>
        )}

        <p className="mt-auto pt-3 font-technical-data text-primary">{price}</p>
      </div>
    </Link>
  );
}
