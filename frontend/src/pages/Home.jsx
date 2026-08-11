export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-light">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          {/* Content */}
          <div>
            <span className="inline-block rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-dark">
              New Collection
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-brand-dark sm:text-5xl lg:text-6xl">
              Discover Something
              <span className="block">You’ll Love.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-slate">
              Discover quality products designed to make your everyday life
              better. Simple, stylish, and made for you.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-xl bg-brand-yellow px-6 py-3 font-semibold text-brand-dark transition hover:bg-yellow-400">
                Shop Now
              </button>

              <button className="rounded-xl border border-brand-slate px-6 py-3 font-semibold text-brand-slate transition hover:bg-brand-dark hover:text-white">
                Explore Products
              </button>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="flex justify-center">
            <div className="flex h-80 w-full max-w-md items-center justify-center rounded-3xl bg-brand-dark">
              <span className="text-lg font-medium text-brand-yellow">
                Hero Image
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-semibold text-brand-yellow">Featured</p>

              <h2 className="mt-2 text-3xl font-bold text-brand-dark">
                Featured Products
              </h2>
            </div>

            <button className="hidden font-semibold text-brand-slate hover:text-brand-dark sm:block">
              View All →
            </button>
          </div>

          {/* Products */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((product) => (
              <div
                key={product}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-64 items-center justify-center bg-brand-light">
                  <span className="text-brand-slate">Product Image</span>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-brand-dark">
                    Product Name
                  </h3>

                  <p className="mt-2 font-bold text-brand-slate">Rp 299.000</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-brand-light">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="font-semibold text-brand-yellow">Categories</p>

            <h2 className="mt-2 text-3xl font-bold text-brand-dark">
              Shop by Category
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["Fashion", "Electronics", "Lifestyle", "Accessories"].map(
              (category) => (
                <div
                  key={category}
                  className="group cursor-pointer rounded-2xl bg-white p-8 text-center transition hover:bg-brand-dark"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow">
                    <span className="font-bold text-brand-dark">
                      {category.charAt(0)}
                    </span>
                  </div>

                  <h3 className="mt-5 font-semibold text-brand-dark group-hover:text-white">
                    {category}
                  </h3>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="font-semibold text-brand-yellow">Why Us</p>

            <h2 className="mt-2 text-3xl font-bold text-brand-dark">
              Why Shop With Us?
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
                🚚
              </div>

              <h3 className="mt-5 font-bold text-brand-dark">Fast Delivery</h3>

              <p className="mt-2 text-brand-slate">
                Get your products delivered quickly and safely.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
                🔒
              </div>

              <h3 className="mt-5 font-bold text-brand-dark">Secure Payment</h3>

              <p className="mt-2 text-brand-slate">
                Your transactions are protected and secure.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
                ⭐
              </div>

              <h3 className="mt-5 font-bold text-brand-dark">
                Quality Products
              </h3>

              <p className="mt-2 text-brand-slate">
                Carefully selected products you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Start Shopping?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-300">
            Explore our collection and find something that fits your style.
          </p>

          <button className="mt-8 rounded-xl bg-brand-yellow px-8 py-3 font-semibold text-brand-dark transition hover:bg-yellow-400">
            Shop Now
          </button>
        </div>
      </section>
    </div>
  );
}
