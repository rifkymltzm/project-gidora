import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center border-y border-border-subtle">
        <div className="px-4 text-center">
          <p className="mb-3 font-label-caps text-text-muted">NO RESULTS</p>

          <p className="font-body-md text-text-muted">
            Tidak ada produk yang cocok dengan filter yang dipilih.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          category={product.category}
          price={product.price}
          badge={product.badge}
          images={product.images}
        />
      ))}
    </div>
  );
}
