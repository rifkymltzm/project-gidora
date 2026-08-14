import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

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

// Mock data representatif bertema GIDORA
const DUMMY_PRODUCTS = [
  {
    id: "1",
    name: "GIDORA TECH JACKET",
    category: "Outerwear",
    price: "Rp 2.490.000",
    badge: "NEW",
    primaryImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrK70SeRpttvLfFY6OS8tB2kSjsghl_Awee3nQRsOZZas_gqsy0o7E4zg-giY8b6N_mtC6DGFsp34i-o-P3lKMwYDwwoGEl57d-RvsH_CbArmRxvnSELFk6grK1JlnB2PcsQuinmp9rKrWD3PoE8queZ5OuIdTGKOOk1sQ8cSVYtmhrmG06N3bvoMfDOXxokM_uAuQPw0vJ0QQN4mNLWdV0Yt0KeHmCid9kyigLDovs8Yj4ImV8ytt",
    secondaryImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzXeEDVTuM8sgNa1wQFzfTp7eOM4CihYuqq4XKhNAC3p2-J81fQ246suvWQzpuwYImSkT2DNn5aE6Y26ur-nLV_vCUfrb6sS7J5p51EnMzsia6mj5sLVbFIgd5fS37cjPua2rYqHhcarGwVgorhfN1NkjERzfaLsPzzPiGw48usLqjY-_KQ7TAQ1Ws0R_AqQYLGdO4tlDUVyzj7L0NbrRv5Vo7O-MNtFPJK-VoCHSGQQKXDJJUIXB",
  },
  {
    id: "2",
    name: "UTILITY VEST 02",
    category: "Outerwear",
    price: "Rp 1.850.000",
    badge: "NEW",
    primaryImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEglTZ-cSi88SHwrcVxPBsusumyj8Xr-PJICIHAdlfdhI_FA-U1eZZCVmeTxExjYrTGTRk9L6mfOsiPQT2eTzjt4_veVOStF7fu4nSXRZ91NXyBUH15CJpzqlFoK9CARgsLBJ1SbkK7y8vrTXEAb8j0W06MdojVAQ6zTNJbvEWicTY6E3rUE_QlKkDbRGujWN3lMYly0_G4K5IEqxWwb-OSeSusuQmLvRfuxxCo2PDe4QC2gMIZ8eY",
    secondaryImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3GhnAT0GVyJ9ALyTd1Saiw6QKXeZVC4P1SfHMsaDXwwGg2LsXNH3uwXvslMH-naEH9pCpQGZianFrp6cz_lqGdnH8aaNfi6QNZpCACW4RfhilAGC4HfplqRxyzLhIDWQWKi5Nf6XlU06bI8Y3bXcIBP_aIhNhxWqZVg1EpK3OGFJaRQXiJjVyjd2xcPbsENn6rAhUsc99-AUlcIMPyY3xMJmTn6ImFF9CdVJgFKe-VEC_mGi9LUX7",
  },
  {
    id: "3",
    name: "ARTICULATED CARGO",
    category: "Pants",
    price: "Rp 1.950.000",
    badge: "",
    primaryImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC_vZj9McjnSCC7tm8gTHEgAw0mhkiRdnDfAEziDc1Fcr_6nrm98XFfIRnB0JmzVZ5IxnvhH1cn20GkYEtikxMpiBfumjFDPA-CFfRIrwNiCfphlL21z_2-7OeE-ycN9KQOiQmW0GWtUq3hGGQDJAKo4c_4YqtLylPbgoMiYLzf-dxEj0Mk41NFUfja2pomiRYzKjDEbuKMnffoAay5FYHMyX_OXnUxXHbZUgQ8eQiR3cmM-C7boDuW",
    secondaryImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2O-CjtrKGHjzBF8bg0LQNEoNvDnOb3pNmtM5aBV3-eyMKwkwXRiqDIVXcW7Wyro_Meo62wHgS_opF1Rpz4NqP8v63la3QrffGDNIdkzCtvPdFdBsxilZBsP1Ipm0KGHEjt4xFfDqfl9D49BtFZyZP8ZGJjWYqJW1z0HHxpAdw2s0nXgZjJ86QnjMK5CIquIRpueJJ0x7g-_sHnzYpad_p-qSK8KaEU2WYVXd0qH-eDgcw1M0FrnzE",
  },
  {
    id: "4",
    name: "SLING SYSTEM 01",
    category: "Accessories",
    price: "Rp 950.000",
    badge: "",
    primaryImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbD4-AagZid0aWWpVFo78EmFJQ2Vv8oUdgunfmDBJWmEQ7wrchuA_hyAt5-QNeZBXVXGQbO2bCONq576Uc6bAP0nejhFr00B_ekJUWknjuI3rvuvMCNmEsHrq9ls3QeWy1TlA1l9U6GtuOptXjatFsYNEcw9_Gp1bblxRA3IiTBUb2WUVbZ2LYVNGJnJDrXY04qUN-jVy9lFgVwZh-VOeBLWdm7f7UA-StftttdPRQewbSCrb29_oD",
    secondaryImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApZYjQKy40QS8CtqcB4mzS1EgJzm8fh8pDGTTwiPWxiCTegEwNtNBUkLNrtQXvbnHkZ_gkkK2nNG3my2IBhR9xknL7h5-4qZFgedBlOod5haouN4b3T6nU0FshIGPv5bi-vftrcXRBJd0g29fioMg22jdT0BcgxHtV1WmI_FtMRlhL2CxRVyP47DKcItqM9L-6DLJkx-PWVZrrgAEgdboE9PVSN7CJcStpefaayf00NETTnSgZVFRD",
  },
];

const categories = [
  {
    name: "MEN",
    subtitle: "Explore System",
    link: "/products?category=men",
    image: "category_man.webp",
  },
  {
    name: "WOMEN",
    subtitle: "Explore System",
    link: "/products?category=women",
    image: "category_woman.webp",
  },
  {
    name: "ACCESSORIES",
    subtitle: "Explore Gear",
    link: "/products?category=accessories",
    image: "category_accessories.webp",
  },
];

export default function Home() {
  const handleSubmitNewsletter = (e) => {
    e.preventDefault();
    alert("Terima kasih telah berlangganan.");
  };

  return (
    <main className="bg-surface text-primary">
      {/* =========================================================
    1. HERO
    Source image: 1264 x 848
    Ratio: ~1.49:1
========================================================= */}
      <section
        id="home-hero"
        className="relative min-h-[78vh] w-full overflow-hidden pt-20 md:h-[85vh] md:min-h-0"
      >
        {/* Background Image */}
        <div
          className="
      absolute
      inset-0
      bg-cover
      bg-center
      bg-no-repeat
      md:bg-[center_5%]
    "
          style={{
            backgroundImage: `url(${getImage("poster_man1.webp")})`,
          }}
        />

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Bottom Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        {/* Hero Content */}
        <div
          className="
      relative
      z-10
      flex
      min-h-[calc(78vh-5rem)]
      w-full
      items-center
      justify-center
      px-margin-mobile
      md:min-h-0
      md:h-full
      md:px-margin-desktop
    "
        >
          <div className="flex max-w-2xl flex-col items-center text-center">
            {/* Label */}
            <p className="font-label-caps tracking-[0.22em] text-white/85">
              NEW COLLECTION
            </p>

            {/* Headline */}
            <h1
              className="
          mt-2
          font-headline-display
          text-[52px]
          font-medium
          leading-none
          tracking-[0.1em]
          text-white
          md:text-[68px]
          lg:text-[76px]
        "
            >
              GIDORA
            </h1>

            {/* Subtitle */}
            <p
              className="
          mt-4
          font-body-lg
          text-[16px]
          tracking-[0.08em]
          text-white/85
          md:text-[17px]
        "
            >
              DESIGNED FOR MOVEMENT
            </p>

            {/* Editorial CTA */}
            <Link
              to="/products"
              className="
          group
          mt-7
          inline-flex
          items-center
          border-b
          border-white/80
          pb-1
          font-label-caps
          text-white
          transition-all
          duration-300
          hover:border-white
          hover:text-white/80
        "
            >
              SHOP COLLECTION
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
      </section>

      {/* =========================================================
          2. CATEGORY SYSTEM
          Source image: 848 x 1264
          Ratio: ~2:3
      ========================================================= */}
      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between border-b border-border-subtle pb-4">
            <div>
              <p className="font-label-caps tracking-[0.2em] text-text-muted">
                CATEGORY
              </p>

              <h2 className="mt-1 font-headline-lg text-primary">THE SYSTEM</h2>
            </div>

            <span className="hidden font-technical-data text-text-muted sm:block">
              03 / 03
            </span>
          </div>

          <div className="grid grid-cols-1 gap-[1px] border border-border-subtle bg-border-subtle md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative block aspect-[2/3] overflow-hidden bg-surface"
              >
                {/* Image */}
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{
                    backgroundImage: `url(${getImage(category.image)})`,
                  }}
                />

                {/* Subtle image overlay */}
                <div className="absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-black/15" />

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                {/* Category Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-headline-lg text-white">
                        {category.name}
                      </h3>

                      <p className="mt-1 font-label-caps text-white/75">
                        {category.subtitle}
                      </p>
                    </div>

                    <span className="material-symbols-outlined text-white transition-transform duration-300 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          3. NEW ARRIVALS
      ========================================================= */}
      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between border-b border-border-subtle pb-4">
            <div>
              <p className="font-label-caps tracking-[0.2em] text-text-muted">
                GIDORA / 02
              </p>

              <h2 className="mt-1 font-headline-lg text-primary">
                NEW ARRIVALS
              </h2>
            </div>

            <Link
              to="/products"
              className="group hidden items-center font-label-caps text-text-muted transition-colors hover:text-primary sm:inline-flex"
            >
              VIEW ALL
              <span className="material-symbols-outlined ml-1 text-[15px] transition-transform duration-300 group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-[1px] border border-border-subtle bg-border-subtle md:grid-cols-4">
            {DUMMY_PRODUCTS.map((product) => (
              <div key={product.id} className="bg-surface">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  badge={product.badge}
                  primaryImage={product.primaryImage}
                  secondaryImage={product.secondaryImage}
                />
              </div>
            ))}
          </div>

          {/* Mobile View All */}
          <div className="mt-6 sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center border-b border-primary pb-1 font-label-caps text-primary"
            >
              VIEW ALL
              <span className="material-symbols-outlined ml-1 text-[15px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. EDITORIAL
      ========================================================= */}
      <section className="w-full bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-gutter">
          {/* Image */}
          <div className="relative h-[60vh] min-h-[480px] overflow-hidden border border-border-subtle bg-surface-container-low md:col-span-7 md:h-[78vh]">
            <img
              src={getImage("fabric.webp")}
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

          {/* Editorial Content */}
          <div className="md:col-span-4 md:col-start-9">
            <p className="mb-4 font-label-caps tracking-[0.2em] text-text-muted">
              GIDORA / 01
            </p>

            <h2 className="font-headline-lg leading-[0.95] text-primary">
              THE EVERYDAY
              <br />
              SYSTEM
            </h2>

            <p className="mt-6 max-w-md font-body-md leading-relaxed text-text-muted">
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
              <span className="material-symbols-outlined ml-1 text-[15px] transition-transform duration-300 group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. NEWSLETTER / ARCHIVE
      ========================================================= */}
      <section className="w-full border-t border-border-subtle bg-surface px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-label-caps tracking-[0.2em] text-text-muted">
            GIDORA ARCHIVE
          </p>

          <h2 className="mt-2 font-headline-lg text-primary">
            STAY IN THE LOOP
          </h2>

          <p className="mx-auto mt-3 max-w-lg font-body-md text-text-muted">
            New systems, technical research, limited releases, and selected
            archives.
          </p>

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
              <span className="material-symbols-outlined ml-1 text-[15px] transition-transform duration-300 group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
