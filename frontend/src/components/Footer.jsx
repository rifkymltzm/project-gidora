export default function Footer() {
  return (
    <footer className="w-full border-t border-border-subtle bg-surface py-16 px-margin-mobile md:px-margin-desktop">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter md:grid-cols-4">
        {/* Column 1: Brand & Copyright */}
        <div className="col-span-1 flex flex-col justify-between md:col-span-2">
          <div>
            <span className="font-technical-data text-technical-data font-bold text-primary block mb-2">
              GIDORA TECHNICAL SYSTEMS
            </span>
            <p className="font-label-caps text-[10px] text-text-muted opacity-80 tracking-widest uppercase">
              © 2026 GIDORA TECHNICAL SYSTEMS. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>

        {/* Column 2: Policies */}
        <div className="col-span-1 flex flex-col gap-3">
          <a
            href="#"
            className="font-label-caps text-label-caps text-text-muted transition-colors hover:text-primary opacity-80 hover:opacity-100"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="font-label-caps text-label-caps text-text-muted transition-colors hover:text-primary opacity-80 hover:opacity-100"
          >
            Terms of Service
          </a>
        </div>

        {/* Column 3: Customer Care & Contact */}
        <div className="col-span-1 flex flex-col gap-3">
          <a
            href="#"
            className="font-label-caps text-label-caps text-text-muted transition-colors hover:text-primary opacity-80 hover:opacity-100"
          >
            Shipping & Returns
          </a>
          <a
            href="#"
            className="font-label-caps text-label-caps text-text-muted transition-colors hover:text-primary opacity-80 hover:opacity-100"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
