export default function AdminHeader({ mobileNavOpen, onToggleMobileNav }) {
  return (
    <header className="border-border-subtle bg-surface/95 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-6 lg:px-8 xl:px-10">
        {/* LEFT SECTION */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleMobileNav}
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileNavOpen}
            className="text-text-muted hover:bg-surface-container-low hover:text-primary focus:ring-primary focus:ring-offset-surface flex h-9 w-9 shrink-0 items-center justify-center transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none md:hidden"
          >
            <span className="material-symbols-outlined !text-[20px]">
              {mobileNavOpen ? 'close' : 'menu'}
            </span>
          </button>

          <p className="font-label-caps text-text-muted truncate">GIDORA / ADMIN</p>
          <span className="bg-border-subtle hidden h-3 w-px sm:block" />
          <p className="font-label-caps text-primary hidden sm:block">CONTROL PANEL</p>
        </div>

        {/* PROFILE SECTION */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="font-label-caps text-primary">ADMINISTRATOR</p>
            <p className="font-technical-data text-text-muted mt-0.5">ACTIVE SESSION</p>
          </div>
          <div className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center">
            <span className="material-symbols-outlined !text-[17px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
