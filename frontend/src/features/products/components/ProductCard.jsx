import { Link } from 'react-router-dom';

import { formatPrice } from '@/utils/formatPrice';

export default function ProductCard({ slug, name, price, category, images, badge }) {
  const { primary: primaryImage, detail: detailImage } = images ?? {};

  return (
    <Link
      to={`/products/${slug}`}
      className="group bg-surface relative flex h-full w-full cursor-pointer flex-col"
    >
      <div className="border-border-subtle bg-surface-container-low relative aspect-[3/4] w-full overflow-hidden border">
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
          <div className="border-border-subtle bg-surface font-label-caps text-primary absolute top-2 left-2 border px-2 py-1">
            {badge}
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col px-3 py-3 md:px-4 md:py-4">
        <h3 className="font-technical-data group-hover:text-text-muted truncate font-medium uppercase transition-colors duration-200">
          {name}
        </h3>

        {category && <p className="font-label-caps text-text-muted mt-1">{category}</p>}

        <p className="font-technical-data text-primary mt-auto pt-3">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}
