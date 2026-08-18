import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchOverlay from "../components/SearchOverlay";
import LogoGidora from "../assets/LogoGidora_black.svg";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { totalItems } = useCart();

  const location = useLocation();

  const isHome = location.pathname === "/";
  const isAbout = location.pathname === "/about";
  const hasTransparentHero = isHome || isAbout;

  const isAboutActive = isAbout;
  const isCollectionsActive = location.pathname === "/products";

  const isTransparentTop =
    hasTransparentHero && !isScrolled && !isMobileMenuOpen;

  // =========================================================
  // HERO / SCROLL STATE
  // =========================================================

  useEffect(() => {
    const heroId = isHome ? "home-hero" : isAbout ? "about-hero" : null;

    const hero = heroId ? document.getElementById(heroId) : null;

    const handleScroll = () => {
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;

        setIsScrolled(heroBottom <= 0);
        return;
      }

      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    let resizeObserver;

    if (hero && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        handleScroll();
      });

      resizeObserver.observe(hero);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      resizeObserver?.disconnect();
    };
  }, [isHome, isAbout]);

  // =========================================================
  // CLOSE MOBILE MENU WHEN ROUTE CHANGES
  // =========================================================

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // =========================================================
  // THEMES
  // =========================================================

  const navItemTheme = isTransparentTop
    ? "text-surface-white/75 hover:text-surface-white"
    : "text-text-muted hover:text-primary";

  const actionTheme = isTransparentTop
    ? "text-surface-white/85 hover:text-surface-white hover:bg-white/10"
    : "text-primary hover:bg-surface-container-low";

  // =========================================================
  // SEARCH
  // =========================================================

  const openSearch = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <>
      <header
        className={`
          fixed
          top-0
          left-0
          z-50
          h-20
          w-full
          px-margin-mobile
          md:px-margin-desktop
          transition-[background-color,border-color,backdrop-filter]
          duration-500
          ease-out
          ${
            isTransparentTop
              ? "border-b border-transparent bg-transparent"
              : "border-b border-border-subtle bg-surface/95 backdrop-blur-md"
          }
        `}
      >
        <div className="mx-auto flex h-full w-full items-center justify-between">
          {/* =====================================================
              LEFT: LOGO + MAIN NAVIGATION
          ===================================================== */}

          <div className="flex h-full items-center">
            {/* LOGO */}

            <Link
              to="/"
              className="flex h-full items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <img
                src={LogoGidora}
                alt="GIDORA Logo"
                className={`
                  h-[68px]
                  w-auto
                  object-contain
                  transition-all
                  duration-500
                  ${isTransparentTop ? "brightness-0 invert" : ""}
                `}
              />
            </Link>

            {/* DESKTOP NAVIGATION */}

            <nav className="ml-7 hidden items-center gap-1 md:flex">
              {/* ABOUT */}

              <Link
                to="/about"
                className={`
                  group
                  relative
                  px-3
                  py-2
                  font-nav-item
                  transition-colors
                  duration-300
                  ${navItemTheme}
                `}
              >
                About
                <span
                  className={`
                    absolute
                    bottom-0.5
                    left-3
                    h-px
                    bg-current
                    transition-all
                    duration-300
                    ${
                      isAboutActive
                        ? "w-[calc(100%-1.5rem)]"
                        : "w-0 group-hover:w-[calc(100%-1.5rem)]"
                    }
                  `}
                />
              </Link>

              {/* COLLECTIONS */}

              <Link
                to="/products"
                className={`
                  group
                  relative
                  px-3
                  py-2
                  font-nav-item
                  transition-colors
                  duration-300
                  ${navItemTheme}
                `}
              >
                Collections
                <span
                  className={`
                    absolute
                    bottom-0.5
                    left-3
                    h-px
                    bg-current
                    transition-all
                    duration-300
                    ${
                      isCollectionsActive
                        ? "w-[calc(100%-1.5rem)]"
                        : "w-0 group-hover:w-[calc(100%-1.5rem)]"
                    }
                  `}
                />
              </Link>
            </nav>
          </div>

          {/* =====================================================
              RIGHT: ACTIONS
          ===================================================== */}

          <div className="flex items-center gap-2 md:gap-gutter">
            {/* SEARCH */}

            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              aria-expanded={isSearchOpen}
              className={`
                cursor-pointer
                p-2
                transition-all
                duration-300
                ease-out
                ${actionTheme}
              `}
            >
              <span className="material-symbols-outlined block text-[21px]">
                search
              </span>
            </button>

            {/* SHOPPING BAG */}

            <Link
              to="/cart"
              aria-label={`Shopping bag${totalItems > 0 ? `, ${totalItems} items` : ""}`}
              className={`
                relative
                cursor-pointer
                p-2
                transition-all
                duration-300
                ease-out
                ${actionTheme}
              `}
            >
              <span className="material-symbols-outlined block text-[21px]">
                shopping_bag
              </span>

              {totalItems > 0 && (
                <span
                  className="
                    absolute
                    right-0.5
                    top-0.5
                    flex
                    min-h-4
                    min-w-4
                    items-center
                    justify-center
                    bg-primary
                    px-1
                    font-technical-data
                    text-[9px]
                    leading-none
                    text-on-primary
                  "
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* ACCOUNT - DESKTOP */}

            <Link
              to="/login"
              aria-label="Account"
              className={`
                cursor-pointer
                hidden
                p-2
                transition-all
                duration-300
                ease-out
                md:block
                ${actionTheme}
              `}
            >
              <span className="material-symbols-outlined block text-[21px]">
                person
              </span>
            </Link>

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              className={`
                cursor-pointer
                p-2
                transition-all
                duration-300
                ease-out
                md:hidden
                ${actionTheme}
              `}
            >
              <span className="material-symbols-outlined block text-[24px]">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION DRAWER
        ===================================================== */}

        {isMobileMenuOpen && (
          <div
            className="
              fixed
              left-0
              top-20
              z-40
              flex
              h-[calc(100vh-5rem)]
              w-full
              flex-col
              border-b
              border-border-subtle
              bg-surface
              px-margin-mobile
              py-8
              animate-[mobileMenuIn_300ms_ease-out]
              md:hidden
            "
          >
            <nav className="flex flex-col">
              {/* ABOUT */}

              <Link
                to="/about"
                className={`
                  flex
                  items-center
                  justify-between
                  border-b
                  border-border-subtle
                  py-4
                  font-nav-item
                  text-[14px]
                  transition-colors
                  ${
                    isAboutActive
                      ? "text-primary"
                      : "text-text-muted hover:text-primary"
                  }
                `}
              >
                <span>About</span>

                {isAboutActive && (
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                )}
              </Link>

              {/* COLLECTIONS */}

              <Link
                to="/products"
                className={`
                  flex
                  items-center
                  justify-between
                  border-b
                  border-border-subtle
                  py-4
                  font-nav-item
                  text-[14px]
                  transition-colors
                  ${
                    isCollectionsActive
                      ? "text-primary"
                      : "text-text-muted hover:text-primary"
                  }
                `}
              >
                <span>Collections</span>

                {isCollectionsActive && (
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                )}
              </Link>

              {/* ACCOUNT */}

              <Link
                to="/login"
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-border-subtle
                  py-4
                  font-nav-item
                  text-[14px]
                  text-text-muted
                  transition-colors
                  hover:text-primary
                "
              >
                <span className="material-symbols-outlined text-[20px]">
                  person
                </span>
                Sign In / Account
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* =======================================================
          SEARCH OVERLAY
      ======================================================= */}

      <SearchOverlay open={isSearchOpen} onClose={closeSearch} />

      {/* =====================================================
          LOCAL MOBILE MENU ANIMATION
      ===================================================== */}

      <style>
        {`
          @keyframes mobileMenuIn {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}
