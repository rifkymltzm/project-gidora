import { Link } from "react-router-dom";

const images = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const getImage = (filename) => {
  const path = Object.keys(images).find((path) =>
    path.endsWith(`/${filename}`),
  );

  return images[path];
};

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
          1. HERO
      ========================================================= */}
      <section
        id="about-hero"
        className="relative min-h-[78vh] w-full overflow-hidden pt-20 md:h-[85vh] md:min-h-0"
      >
        {/* Background */}
        <div
          className="
            absolute
            inset-0
            bg-cover
            bg-center
            bg-no-repeat
            md:bg-[center_100%]
          "
          style={{
            backgroundImage: `url(${getImage("building.webp")})`,
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Content */}
        <div
          className="
            relative
            z-10
            flex
            min-h-[calc(78vh-5rem)]
            w-full
            items-end
            px-margin-mobile
            pb-12
            md:min-h-0
            md:h-full
            md:px-margin-desktop
            md:pb-16
          "
        >
          <div className="max-w-3xl text-white">
            <p className="font-label-caps tracking-[0.22em] text-white/75">
              ABOUT / 01
            </p>

            <h1
              className="
                mt-3
                max-w-2xl
                font-headline-display
                text-[52px]
                font-medium
                leading-[0.95]
                tracking-[-0.04em]
                md:text-[72px]
                lg:text-[82px]
              "
            >
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
          2. MANIFESTO
      ========================================================= */}
      <section className="w-full border-b border-border-subtle bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-12 md:gap-gutter">
          <div className="md:col-span-3">
            <p className="font-label-caps tracking-[0.2em] text-text-muted">
              GIDORA / 02
            </p>
          </div>

          <div className="md:col-span-8 md:col-start-5">
            <h2
              className="
                font-headline-lg
                max-w-4xl
                text-[32px]
                leading-[1.05]
                md:text-[44px]
                lg:text-[52px]
              "
            >
              WE DESIGN
              <br />
              FOR MOVEMENT.
            </h2>

            <div className="mt-8 max-w-xl space-y-5 font-body-md leading-relaxed text-text-muted">
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
          3. PHILOSOPHY
      ========================================================= */}
      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between border-b border-border-subtle pb-4">
            <div>
              <p className="font-label-caps tracking-[0.2em] text-text-muted">
                SYSTEM / 01
              </p>

              <h2 className="mt-1 font-headline-lg text-primary">
                THE PHILOSOPHY
              </h2>
            </div>

            <span className="hidden font-technical-data text-text-muted sm:block">
              03 / 03
            </span>
          </div>

          <div className="grid grid-cols-1 border border-border-subtle md:grid-cols-3">
            {principles.map((principle, index) => (
              <article
                key={principle.number}
                className={`
                  flex
                  min-h-[280px]
                  flex-col
                  justify-between
                  p-6
                  md:min-h-[340px]
                  md:p-7
                  ${
                    index !== principles.length - 1
                      ? "border-b border-border-subtle md:border-b-0 md:border-r"
                      : ""
                  }
                `}
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
                  <h3 className="font-headline-lg text-primary">
                    {principle.title}
                  </h3>

                  <p className="mt-4 max-w-sm font-body-md leading-relaxed text-text-muted">
                    {principle.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          4. MATERIAL RESEARCH
      ========================================================= */}
      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-12 md:gap-gutter">
          {/* Image */}
          <div className="relative h-[60vh] min-h-[480px] overflow-hidden border border-border-subtle bg-surface-container-low md:col-span-7 md:h-[72vh]">
            <img
              src={getImage("fabric.webp")}
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

          {/* Content */}
          <div className="flex flex-col justify-center md:col-span-4 md:col-start-9">
            <p className="font-label-caps tracking-[0.2em] text-text-muted">
              MATERIAL SYSTEM / 01
            </p>

            <h2 className="mt-2 font-headline-lg leading-[0.95] text-primary">
              TECHNICAL
              <br />
              RESEARCH
            </h2>

            <p className="mt-6 font-body-md leading-relaxed text-text-muted">
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
          5. DAILY SYSTEM
      ========================================================= */}
      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-12 md:items-center md:gap-gutter">
          {/* Content */}
          <div className="md:col-span-4">
            <p className="font-label-caps tracking-[0.2em] text-text-muted">
              SYSTEM / 02
            </p>

            <h2 className="mt-2 font-headline-lg leading-[0.95] text-primary">
              DESIGNED
              <br />
              FOR DAILY USE
            </h2>

            <p className="mt-6 max-w-md font-body-md leading-relaxed text-text-muted">
              From movement through the city to the quiet moments between,
              GIDORA is designed to exist naturally within everyday life.
            </p>

            <div className="mt-6 font-technical-data uppercase tracking-wider text-text-muted">
              URBAN / TECHNICAL / DAILY
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[55vh] min-h-[420px] overflow-hidden border border-border-subtle md:col-span-7 md:col-start-6 md:h-[70vh]">
            <img
              src={getImage("products/backpack5.webp")}
              alt="GIDORA daily system"
              className="absolute inset-0 h-full w-full object-cover object-[center_20%] transition-transform duration-700 hover:scale-[1.02]"
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
          6. CLOSING
      ========================================================= */}
      <section className="w-full border-t border-border-subtle bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-border-subtle pb-8">
            <p className="font-label-caps tracking-[0.2em] text-text-muted">
              GIDORA / SYSTEM 01
            </p>
          </div>

          <div className="py-16 md:py-24">
            <h2
              className="
                max-w-4xl
                font-headline-display
                text-[48px]
                font-medium
                leading-[0.95]
                tracking-[-0.04em]
                text-primary
                md:text-[72px]
                lg:text-[88px]
              "
            >
              DESIGNED
              <br />
              FOR MOVEMENT.
            </h2>

            <div className="mt-8">
              <Link
                to="/products"
                className="
                  group
                  inline-flex
                  items-center
                  border-b
                  border-primary
                  pb-1
                  font-label-caps
                  text-primary
                  transition-colors
                  duration-300
                  hover:border-text-muted
                  hover:text-text-muted
                "
              >
                EXPLORE COLLECTION
                <span
                  className="
                    material-symbols-outlined
                    ml-1
                    text-[15px]
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                >
                  arrow_forward
                </span>
              </Link>
            </div>
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
