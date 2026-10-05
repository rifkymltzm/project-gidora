import { Link, NavLink } from 'react-router-dom';

const navigation = [
  { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
  { label: 'Products', path: '/admin/products', icon: 'inventory_2' },
  { label: 'Orders', path: '/admin/orders', icon: 'receipt_long' },
  { label: 'Customers', path: '/admin/customers', icon: 'group' },
];

const itemClass = `
  flex min-h-11
  items-center
  gap-3
  overflow-hidden
  px-3 py-3
  font-nav-item
  transition-colors duration-200
  md:justify-center
  md:gap-0
  md:px-2
`;

const iconClass = `
  material-symbols-outlined
  shrink-0
  !text-[19px]
`;

const labelClass = (isExpanded) => `
  whitespace-nowrap
  ${isExpanded ? 'md:inline' : 'md:hidden'}
`;

const desktopLayoutClass = (isExpanded) => (isExpanded ? 'md:justify-start md:gap-3 md:px-3' : '');

const navItemClass = (isExpanded, isActive) => `
  ${itemClass}
  ${desktopLayoutClass(isExpanded)}
  ${
    isActive
      ? 'bg-primary text-on-primary'
      : 'text-text-muted hover:bg-surface-container-low hover:text-primary'
  }
`;

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  isExpanded = false,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <>
      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        aria-label="Admin sidebar"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`border-border-subtle bg-surface-container-lowest fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-0 md:h-screen md:w-full md:translate-x-0 md:transition-none`}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          {/* BRAND */}
          <div className="border-border-subtle relative flex h-16 shrink-0 items-center border-b px-5 md:px-4">
            <div className={`min-w-0 ${isExpanded ? 'md:block' : 'md:hidden'} `}>
              <p className="font-technical-data text-primary font-bold tracking-[0.04em] whitespace-nowrap">
                GIDORA
              </p>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="bg-primary h-px w-3 shrink-0" />

                <p className="font-label-caps text-text-muted whitespace-nowrap">
                  NAVIGATION SYSTEM
                </p>
              </div>
            </div>

            {/* COLLAPSED DESKTOP LOGO */}
            <span
              aria-hidden="true"
              className={`font-technical-data text-primary hidden font-bold tracking-[0.04em] md:absolute md:left-1/2 md:block md:-translate-x-1/2 ${isExpanded ? 'md:hidden' : ''} `}
            >
              G
            </span>
          </div>

          {/* NAVIGATION */}
          <nav aria-label="Admin navigation" className="min-h-0 flex-1 overflow-y-auto p-3 md:p-2">
            <div className="space-y-1">
              {navigation.map(({ label, path, icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/admin'}
                  onClick={onCloseMobile}
                  title={label}
                  className={({ isActive }) => navItemClass(isExpanded, isActive)}
                >
                  <span className={iconClass}>{icon}</span>

                  <span className={labelClass(isExpanded)}>{label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* VIEW STORE */}
          <div className="border-border-subtle shrink-0 border-t p-3 md:p-2">
            <Link
              to="/"
              onClick={onCloseMobile}
              title="View Store"
              className={`group ${itemClass} ${desktopLayoutClass(isExpanded)} text-text-muted hover:bg-surface-container-low hover:text-primary`}
            >
              <span className={iconClass}>store</span>

              <span className={labelClass(isExpanded)}>VIEW STORE</span>

              {/* EXTERNAL ARROW */}
              {isExpanded && (
                <span className="material-symbols-outlined ml-auto shrink-0 -translate-x-0.5 translate-y-0.5 !text-[16px] opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100">
                  arrow_outward
                </span>
              )}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
