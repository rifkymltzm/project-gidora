import { useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import PRODUCTS_DATA from "../data/products";

const images = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const IMAGE_MAP = Object.fromEntries(
  Object.entries(images).map(([path, image]) => [path.split("/").pop(), image]),
);

const getImage = (filename) => IMAGE_MAP[filename];

const categories = [
  {
    name: "MEN",
    subtitle: "Explore System",
    link: "/products?gender=men",
    image: "category_man.webp",
  },
  {
    name: "WOMEN",
    subtitle: "Explore System",
    link: "/products?gender=women",
    image: "category_woman.webp",
  },
  {
    name: "ACCESSORIES",
    subtitle: "Explore Gear",
    link: "/products?category=accessories",
    image: "category_accessories.webp",
  },
];

const NEW_ARRIVALS = PRODUCTS_DATA.filter(
  (product) => product.badge?.toUpperCase() === "NEW",
).slice(0, 4);

const ArrowIcon = () => (
  <span
    className="material-symbols-outlined ml-1 transition-transform duration-300 group-hover:translate-x-1"
    style={{ fontSize: "15px" }}
  >
    arrow_forward
  </span>
);

export default function Home() {
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleSubmitNewsletter = (event) => {
    event.preventDefault();
    setNewsletterSubmitted(true);
  };

  return (
    <main className="bg-surface text-primary">
      {/* =========================================================
         HERO
      ========================================================= */}

      <section
        id="home-hero"
        className="relative h-[100svh] w-full overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getImage("hero_1_16x9.webp")})`,
          }}
        />

        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        <div className="relative z-10 flex h-full w-full items-center justify-center px-margin-mobile md:px-margin-desktop">
          <div className="flex max-w-2xl flex-col items-center text-center">
            <p className="font-label-caps tracking-[0.22em] text-white/85">
              NEW COLLECTION
            </p>

            <h1 className="mt-2 font-headline-display text-[52px] font-medium leading-none tracking-[0.1em] text-white md:text-[68px] lg:text-[76px]">
              GIDORA
            </h1>

            <p className="mt-4 font-body-lg text-[16px] tracking-[0.08em] text-white/85 md:text-[17px]">
              DESIGNED FOR MOVEMENT
            </p>

            <Link
              to="/products"
              className="group mt-7 inline-flex items-center border-b border-white/80 pb-1 font-label-caps text-white transition-all duration-300 hover:border-white hover:text-white/80"
            >
              SHOP COLLECTION
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
         CATEGORIES
      ========================================================= */}

      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="CATEGORY" title="THE SYSTEM" count="03 / 03" />

          <div className="grid grid-cols-1 gap-px border border-border-subtle bg-border-subtle md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative block aspect-[2/3] overflow-hidden bg-surface"
              >
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{
                    backgroundImage: `url(${getImage(category.image)})`,
                  }}
                />

                <div className="absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-black/15" />

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-headline-lg-mobile text-white md:font-headline-lg">
                        {category.name}
                      </h3>

                      <p className="mt-1 font-label-caps text-white/75">
                        {category.subtitle}
                      </p>
                    </div>

                    <ArrowIcon />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
         NEW ARRIVALS
      ========================================================= */}

      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between border-b border-border-subtle pb-4">
            <div>
              <p className="font-label-caps tracking-[0.2em] text-text-muted">
                GIDORA / 02
              </p>

              <h2 className="mt-1 font-headline-lg-mobile text-primary md:font-headline-lg">
                NEW ARRIVALS
              </h2>
            </div>

            <Link
              to="/products"
              className="group hidden items-center font-label-caps text-text-muted transition-colors hover:text-primary sm:inline-flex"
            >
              VIEW ALL
              <ArrowIcon />
            </Link>
          </div>

          {NEW_ARRIVALS.length > 0 ? (
            <div className="grid grid-cols-2 gap-px border border-border-subtle bg-border-subtle md:grid-cols-4">
              {NEW_ARRIVALS.map((product) => (
                <div key={product.id} className="bg-surface">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    badge={product.badge}
                    images={product.images}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center border-y border-border-subtle">
              <div className="text-center">
                <p className="font-label-caps text-text-muted">
                  NO NEW ARRIVALS
                </p>

                <p className="mt-2 font-body-md text-text-muted">
                  Belum ada produk terbaru saat ini.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Link
              to="/products"
              className="group inline-flex items-center border-b border-primary pb-1 font-label-caps text-primary"
            >
              VIEW ALL
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
         EDITORIAL
      ========================================================= */}

      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-gutter">
          <div className="relative h-[60vh] min-h-[420px] overflow-hidden border border-border-subtle bg-surface-container-low md:col-span-7 md:h-[78vh]">
            <img
              src={getImage("fabric_4x3.webp")}
              alt="Technical fabric research texture"
              className="absolute inset-0 h-full w-full object-cover object-bottom-right transition-transform duration-700 hover:scale-[1.02]"
              loading="lazy"
            />

            <div className="absolute left-5 top-5 border border-white/40 bg-black/20 px-3 py-1.5 backdrop-blur-sm">
              <span className="font-technical-data text-white">
                SYSTEM / 01
              </span>
            </div>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <p className="mb-4 font-label-caps tracking-[0.2em] text-text-muted">
              GIDORA / 01
            </p>

            <h2 className="font-headline-lg-mobile leading-[0.95] text-primary md:font-headline-lg">
              THE EVERYDAY
              <br />
              SYSTEM
            </h2>

            <p className="mt-6 max-w-md font-body-md text-text-muted">
              Essential pieces designed around movement, utility, and everyday
              life. Engineered with advanced technical fabrics for maximum
              performance in urban environments.
            </p>

            <div className="mt-6 font-technical-data uppercase tracking-wider text-text-muted">
              URBAN / TECHNICAL / DAILY
            </div>

            <Link
              to="/about"
              className="group mt-8 inline-flex items-center border-b border-primary pb-1 font-label-caps text-primary transition-colors hover:border-text-muted hover:text-text-muted"
            >
              READ EDITORIAL
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
         NEWSLETTER
      ========================================================= */}

      <section className="w-full border-t border-border-subtle bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-label-caps tracking-[0.2em] text-text-muted">
            GIDORA ARCHIVE
          </p>

          <h2 className="mt-2 font-headline-lg-mobile text-primary md:font-headline-lg">
            STAY IN THE LOOP
          </h2>

          <p className="mx-auto mt-3 max-w-lg font-body-md text-text-muted">
            New systems, technical research, limited releases, and selected
            archives.
          </p>

          {!newsletterSubmitted ? (
            <form
              onSubmit={handleSubmitNewsletter}
              className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                required
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-none border-0 border-b border-border-subtle bg-transparent px-0 py-3 font-technical-data uppercase text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-0"
              />

              <button
                type="submit"
                className="group inline-flex items-center justify-center rounded-none border border-primary bg-primary px-6 py-3 font-label-caps text-on-primary transition-all duration-300 hover:bg-transparent hover:text-primary"
              >
                JOIN
                <ArrowIcon />
              </button>
            </form>
          ) : (
            <div className="mx-auto mt-8 border-y border-border-subtle py-4">
              <p className="font-label-caps text-secondary">
                ✓ YOU'RE ON THE LIST
              </p>

              <p className="mt-1 font-technical-data text-text-muted">
                Thank you for joining the GIDORA archive.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ label, title, count }) {
  return (
    <div className="mb-8 flex items-end justify-between border-b border-border-subtle pb-4">
      <div>
        <p className="font-label-caps tracking-[0.2em] text-text-muted">
          {label}
        </p>

        <h2 className="mt-1 font-headline-lg-mobile text-primary md:font-headline-lg">
          {title}
        </h2>
      </div>

      {count && (
        <span className="hidden font-technical-data text-text-muted sm:block">
          {count}
        </span>
      )}
    </div>
  );
}
