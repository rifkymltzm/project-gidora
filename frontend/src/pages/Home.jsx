import { useState } from 'react';
import { Link } from 'react-router-dom';

import ProductCard from '@/features/products/components/ProductCard';
import PRODUCTS_DATA from '@/features/products/data/products';

import { getAsset } from '@/utils/assets';

const categories = [
  {
    name: 'MEN',
    subtitle: 'Explore System',
    link: '/products?gender=men',
    image: 'category_man.webp',
  },
  {
    name: 'WOMEN',
    subtitle: 'Explore System',
    link: '/products?gender=women',
    image: 'category_woman.webp',
  },
  {
    name: 'ACCESSORIES',
    subtitle: 'Explore Gear',
    link: '/products?category=accessories',
    image: 'category_accessories.webp',
  },
];

const NEW_ARRIVALS = PRODUCTS_DATA.filter(
  (product) => product.badge?.toUpperCase() === 'NEW',
).slice(0, 4);

const ArrowIcon = () => (
  <span
    className="material-symbols-outlined text-secondary ml-1 opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100"
    style={{ fontSize: '15px' }}
  >
    arrow_forward
  </span>
);

export default function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleSubmitNewsletter = (event) => {
    event.preventDefault();

    const email = newsletterEmail.trim();

    if (!email) {
      setNewsletterError('EMAIL ADDRESS IS REQUIRED');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterError('ENTER A VALID EMAIL ADDRESS');
      return;
    }

    setNewsletterError('');
    setNewsletterSubmitted(true);
  };

  const handleEmailChange = (event) => {
    setNewsletterEmail(event.target.value);

    if (newsletterError) {
      setNewsletterError('');
    }
  };

  return (
    <main className="bg-surface text-primary">
      {/* =========================================================
         HERO
      ========================================================= */}

      <section id="home-hero" className="relative h-[100svh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getAsset('hero_1_16x9.webp')})`,
          }}
        />

        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        <div className="px-margin-mobile md:px-margin-desktop relative z-10 flex h-full w-full items-center justify-center">
          <div className="flex max-w-2xl flex-col items-center text-center">
            <p className="font-label-caps tracking-[0.22em] text-white/85">NEW COLLECTION</p>

            <h1 className="font-headline-display mt-2 text-[52px] leading-none font-medium tracking-[0.1em] text-white md:text-[68px] lg:text-[76px]">
              GIDORA
            </h1>

            <p className="font-body-lg mt-4 text-[16px] tracking-[0.08em] text-white/85 md:text-[17px]">
              DESIGNED FOR MOVEMENT
            </p>

            <Link
              to="/products"
              className="group font-label-caps text-on-primary/95 hover:text-on-primary/75 relative mt-7 inline-flex items-center pb-1 transition-colors"
            >
              SHOP COLLECTION
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-white/85 transition-transform duration-500 group-hover:scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
         CATEGORIES
      ========================================================= */}

      <section className="bg-surface px-margin-mobile py-section-gap md:px-margin-desktop w-full">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="CATEGORY" title="THE SYSTEM" count="03 / 03" />

          <div className="border-border-subtle bg-border-subtle grid grid-cols-1 gap-px border md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group bg-surface relative block aspect-[2/3] overflow-hidden"
              >
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{
                    backgroundImage: `url(${getAsset(category.image)})`,
                  }}
                />

                <div className="absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-black/15" />

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-headline-lg-mobile md:font-headline-lg text-white">
                        {category.name}
                      </h3>

                      <p className="font-label-caps mt-1 text-white/75">{category.subtitle}</p>
                    </div>
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

      <section className="bg-surface px-margin-mobile py-section-gap md:px-margin-desktop w-full">
        <div className="mx-auto max-w-7xl">
          <div className="border-border-subtle mb-8 flex items-end justify-between border-b pb-4">
            <div>
              <p className="font-label-caps text-text-muted tracking-[0.2em]">GIDORA / 02</p>

              <h2 className="font-headline-lg-mobile text-primary md:font-headline-lg mt-1">
                NEW ARRIVALS
              </h2>
            </div>

            <Link
              to="/products"
              className="group font-label-caps text-text-muted hover:text-primary hidden items-center transition-colors sm:inline-flex"
            >
              VIEW ALL
              <ArrowIcon />
            </Link>
          </div>

          {NEW_ARRIVALS.length > 0 ? (
            <div className="border-border-subtle bg-border-subtle grid grid-cols-2 gap-px border md:grid-cols-4">
              {NEW_ARRIVALS.map((product) => (
                <div key={product.id} className="bg-surface">
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
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
            <div className="border-border-subtle flex min-h-[280px] items-center justify-center border-y">
              <div className="text-center">
                <p className="font-label-caps text-text-muted">NO NEW ARRIVALS</p>

                <p className="font-body-md text-text-muted mt-2">
                  Belum ada produk terbaru saat ini.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Link
              to="/products"
              className="group border-primary font-label-caps text-primary inline-flex items-center border-b pb-1"
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

      <section className="bg-surface px-margin-mobile py-section-gap md:px-margin-desktop w-full">
        <div className="md:gap-gutter mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-12">
          <div className="border-border-subtle bg-surface-container-low relative h-[60vh] min-h-[420px] overflow-hidden border md:col-span-7 md:h-[78vh]">
            <img
              src={getAsset('fabric_4x3.webp')}
              alt="Technical fabric research texture"
              className="absolute inset-0 h-full w-full object-cover object-bottom-right transition-transform duration-700 hover:scale-[1.02]"
              loading="lazy"
            />

            <div className="absolute top-5 left-5 border border-white/40 bg-black/20 px-3 py-1.5 backdrop-blur-sm">
              <span className="font-technical-data text-white">SYSTEM / 01</span>
            </div>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <p className="font-label-caps text-text-muted mb-4 tracking-[0.2em]">GIDORA / 01</p>

            <h2 className="font-headline-lg-mobile text-primary md:font-headline-lg leading-[0.95]">
              THE EVERYDAY
              <br />
              SYSTEM
            </h2>

            <p className="font-body-md text-text-muted mt-6 max-w-md">
              Essential pieces designed around movement, utility, and everyday life. Engineered with
              advanced technical fabrics for maximum performance in urban environments.
            </p>

            <div className="font-technical-data text-text-muted mt-6 tracking-wider uppercase">
              URBAN / TECHNICAL / DAILY
            </div>

            <Link
              to="/about"
              className="group font-label-caps text-primary hover:text-text-muted relative mt-8 inline-flex items-center pb-1 transition-colors"
            >
              READ EDITORIAL
              <ArrowIcon />
              <span className="bg-text-muted/85 absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
         NEWSLETTER
      ========================================================= */}

      <section className="border-border-subtle bg-surface px-margin-mobile py-section-gap md:px-margin-desktop w-full border-t">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-label-caps text-text-muted tracking-[0.2em]">GIDORA ARCHIVE</p>

          <h2 className="font-headline-lg-mobile text-primary md:font-headline-lg mt-2">
            STAY IN THE LOOP
          </h2>

          <p className="font-body-md text-text-muted mx-auto mt-3 max-w-lg">
            New systems, technical research, limited releases, and selected archives.
          </p>

          {!newsletterSubmitted ? (
            <form onSubmit={handleSubmitNewsletter} noValidate className="mx-auto mt-8 max-w-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div
                    className={[
                      'relative border-b transition-colors duration-300',
                      newsletterError
                        ? 'border-[#B42318]'
                        : 'border-border-subtle focus-within:border-primary',
                    ].join(' ')}
                  >
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={handleEmailChange}
                      placeholder="EMAIL ADDRESS"
                      aria-label="Email address"
                      aria-invalid={Boolean(newsletterError)}
                      aria-describedby={newsletterError ? 'newsletter-error' : undefined}
                      className="font-technical-data text-primary placeholder:text-text-muted w-full rounded-none border-0 bg-transparent px-0 py-3 pr-8 uppercase outline-none focus:ring-0"
                    />

                    {newsletterEmail && (
                      <span
                        className={[
                          'material-symbols-outlined absolute top-1/2 right-0 -translate-y-1/2 text-[17px]',
                          newsletterError ? 'text-[#B42318]' : 'text-text-muted',
                        ].join(' ')}
                      >
                        {newsletterError ? 'error' : 'check'}
                      </span>
                    )}
                  </div>

                  <div
                    className={[
                      'grid transition-all duration-300',
                      newsletterError
                        ? 'mt-2 grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0',
                    ].join(' ')}
                  >
                    <div className="overflow-hidden">
                      <p
                        id="newsletter-error"
                        role="alert"
                        className="font-technical-data flex items-center gap-1.5 text-left text-[10px] tracking-[0.12em] text-[#B42318] uppercase"
                      >
                        <span className="text-[10px] leading-none">!</span>
                        {newsletterError}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={[
                    'group font-label-caps inline-flex shrink-0 cursor-pointer items-center justify-center rounded-none border px-6 py-3 transition-all duration-300',
                    newsletterError
                      ? 'border-[#B42318] bg-[#B42318] text-white hover:bg-transparent hover:text-[#B42318]'
                      : 'border-primary bg-primary text-on-primary hover:text-primary hover:bg-transparent',
                  ].join(' ')}
                >
                  {newsletterError ? 'RETRY' : 'JOIN'}

                  <span
                    className="material-symbols-outlined ml-1 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ fontSize: '15px' }}
                  >
                    {newsletterError ? 'refresh' : 'arrow_forward'}
                  </span>
                </button>
              </div>

              <div className="font-technical-data text-text-muted mt-4 flex items-center justify-between text-[10px] tracking-[0.14em] uppercase">
                <span>ARCHIVE / ACCESS</span>

                <span>{newsletterEmail.length.toString().padStart(2, '0')} / 254</span>
              </div>
            </form>
          ) : (
            <div className="border-border-subtle mx-auto mt-8 border-y py-4">
              <p className="font-label-caps text-secondary">✓ YOU'RE ON THE LIST</p>

              <p className="font-technical-data text-text-muted mt-1">
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
    <div className="border-border-subtle mb-8 flex items-end justify-between border-b pb-4">
      <div>
        <p className="font-label-caps text-text-muted tracking-[0.2em]">{label}</p>

        <h2 className="font-headline-lg-mobile text-primary md:font-headline-lg mt-1">{title}</h2>
      </div>

      {count && (
        <span className="font-technical-data text-text-muted hidden sm:block">{count}</span>
      )}
    </div>
  );
}
