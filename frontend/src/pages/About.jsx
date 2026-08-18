import { Link } from "react-router-dom";

const images = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const IMAGE_MAP = Object.fromEntries(
  Object.entries(images).map(([path, image]) => [path.split("/").pop(), image]),
);

const getImage = (filename) => IMAGE_MAP[filename];

const principles = [
  {
    number: "01",
    title: "MOVEMENT",
    description:
      "Clothing follows the body. Form exists to move, adapt, and remain comfortable throughout the day.",
  },
  {
    number: "02",
    title: "UTILITY",
    description:
      "Every element has a purpose. Construction, storage, and material are considered as part of the system.",
  },
  {
    number: "03",
    title: "SYSTEM",
    description:
      "Pieces are designed to work together within an everyday wardrobe, without unnecessary complexity.",
  },
];

const materialSpecs = [
  "LIGHTWEIGHT",
  "DURABLE",
  "WATER RESISTANT",
  "URBAN READY",
];

export default function About() {
  return (
    <main className="bg-surface text-primary">
      {/* =========================================================
         HERO
      ========================================================= */}

      <section
        id="about-hero"
        className="relative h-[100svh] w-full overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-[center_100%]"
          style={{
            backgroundImage: `url(${getImage("hero_2_16x9.webp")})`,
          }}
        />

        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="relative z-10 flex h-full w-full items-end px-margin-mobile pb-12 md:px-margin-desktop md:pb-16">
          <div className="max-w-3xl text-white">
            <p className="font-label-caps tracking-[0.22em] text-white/75">
              ABOUT / 01
            </p>

            <h1 className="mt-3 max-w-2xl font-headline-display text-[52px] font-medium leading-[0.95] tracking-[-0.04em] md:text-[72px] lg:text-[82px]">
              THE
              <br />
              SYSTEM
            </h1>

            <p className="mt-6 max-w-md font-body-md leading-relaxed text-white/80 md:text-[16px]">
              Designed around movement, utility, and everyday life.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
         INTRODUCTION
      ========================================================= */}

      <section className="w-full border-b border-border-subtle bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-12 md:gap-gutter">
          <div className="md:col-span-3">
            <p className="font-label-caps tracking-[0.2em] text-text-muted">
              GIDORA / 02
            </p>
          </div>

          <div className="md:col-span-8 md:col-start-5">
            <h2 className="font-headline-lg-mobile leading-[1.05] md:font-headline-lg">
              WE DESIGN
              <br />
              FOR MOVEMENT.
            </h2>

            <div className="mt-8 max-w-xl space-y-5 font-body-md text-text-muted">
              <p>
                GIDORA explores the relationship between clothing, movement, and
                everyday environments.
              </p>

              <p>
                We believe clothing should adapt to the person wearing it — not
                the other way around.
              </p>

              <p>
                Each piece is considered as part of a wider system: functional,
                adaptable, and designed for daily use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         PHILOSOPHY
      ========================================================= */}

      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="SYSTEM / 01"
            title="THE PHILOSOPHY"
            count="03 / 03"
          />

          <div className="grid grid-cols-1 border border-border-subtle md:grid-cols-3">
            {principles.map((principle, index) => (
              <article
                key={principle.number}
                className={`flex min-h-[280px] flex-col justify-between p-5 md:min-h-[340px] md:p-7 ${
                  index < principles.length - 1
                    ? "border-b border-border-subtle md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-technical-data text-text-muted">
                    {principle.number}
                  </span>

                  <span className="font-technical-data text-text-muted">
                    / 03
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-lg-mobile text-primary md:font-headline-lg">
                    {principle.title}
                  </h3>

                  <p className="mt-4 max-w-sm font-body-md text-text-muted">
                    {principle.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
         MATERIAL RESEARCH
      ========================================================= */}

      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-12 md:gap-gutter">
          <div className="relative h-[55vh] min-h-[420px] overflow-hidden border border-border-subtle bg-surface-container-low md:col-span-7 md:h-[72vh]">
            <img
              src={getImage("fabric_4x3.webp")}
              alt="Technical fabric research texture"
              className="absolute inset-0 h-full w-full object-cover object-bottom-right transition-transform duration-700 hover:scale-[1.02]"
              loading="lazy"
            />

            <div className="absolute left-5 top-5 border border-white/40 bg-black/20 px-3 py-1.5 backdrop-blur-sm">
              <span className="font-technical-data text-white">
                RESEARCH / 01
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center md:col-span-4 md:col-start-9">
            <p className="font-label-caps tracking-[0.2em] text-text-muted">
              MATERIAL SYSTEM / 01
            </p>

            <h2 className="mt-2 font-headline-lg-mobile leading-[0.95] md:font-headline-lg">
              TECHNICAL
              <br />
              RESEARCH
            </h2>

            <p className="mt-6 font-body-md text-text-muted">
              Material selection begins with function. Weight, durability,
              weather resistance, and movement are considered before form.
            </p>

            <div className="mt-8 border-t border-border-subtle">
              {materialSpecs.map((spec, index) => (
                <div
                  key={spec}
                  className="flex items-center justify-between border-b border-border-subtle py-3"
                >
                  <span className="font-technical-data text-text-muted">
                    0{index + 1}
                  </span>

                  <span className="font-label-caps text-primary">{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         DAILY SYSTEM
      ========================================================= */}

      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-12 md:items-center md:gap-gutter">
          <div className="md:col-span-4">
            <p className="font-label-caps tracking-[0.2em] text-text-muted">
              SYSTEM / 02
            </p>

            <h2 className="mt-2 font-headline-lg-mobile leading-[0.95] md:font-headline-lg">
              DESIGNED
              <br />
              FOR DAILY USE
            </h2>

            <p className="mt-6 max-w-md font-body-md text-text-muted">
              From movement through the city to the quiet moments between,
              GIDORA is designed to exist naturally within everyday life.
            </p>

            <div className="mt-6 font-technical-data uppercase tracking-wider text-text-muted">
              URBAN / TECHNICAL / DAILY
            </div>
          </div>

          <div className="relative h-[50vh] min-h-[380px] overflow-hidden border border-border-subtle md:col-span-7 md:col-start-6 md:h-[70vh]">
            <img
              src={getImage("model_daily_4x3.webp")}
              alt="GIDORA daily system"
              className="absolute inset-0 h-full w-full object-cover object-[center_20%] transition-transform duration-700 hover:scale-[1.02]"
              loading="lazy"
            />

            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />

            <div className="absolute bottom-5 left-5">
              <span className="font-technical-data text-white">
                DAILY SYSTEM / 01
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         CLOSING
      ========================================================= */}

      <section className="w-full border-t border-border-subtle bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-border-subtle pb-8">
            <p className="font-label-caps tracking-[0.2em] text-text-muted">
              GIDORA / SYSTEM 01
            </p>
          </div>

          <div className="py-16 md:py-24">
            <h2 className="font-headline-display text-[42px] leading-[0.95] tracking-[-0.03em] text-primary sm:text-[52px] md:text-[72px] lg:text-[88px]">
              DESIGNED
              <br />
              FOR MOVEMENT.
            </h2>

            <Link
              to="/products"
              className="group mt-8 inline-flex items-center border-b border-primary pb-1 font-label-caps text-primary transition-colors duration-300 hover:border-text-muted hover:text-text-muted"
            >
              EXPLORE COLLECTION
              <span
                className="material-symbols-outlined ml-1 transition-transform duration-300 group-hover:translate-x-1"
                style={{ fontSize: "15px" }}
              >
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="flex flex-col gap-2 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-technical-data text-text-muted">
              URBAN / TECHNICAL / DAILY
            </span>

            <span className="font-technical-data text-text-muted">
              GIDORA / 01
            </span>
          </div>
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
