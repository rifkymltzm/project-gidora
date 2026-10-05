import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import AdminSidebar from '../features/admin/components/AdminSidebar';
import AdminHeader from '../features/admin/components/AdminHeader';

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMobileNav = () => setMobileNavOpen((current) => !current);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="bg-surface text-primary min-h-screen">
      <div
        className="grid min-h-screen grid-cols-1 md:transition-[grid-template-columns] md:duration-300 md:ease-out"
        style={{
          gridTemplateColumns:
            window.innerWidth >= 768
              ? isExpanded
                ? '256px minmax(0, 1fr)'
                : '64px minmax(0, 1fr)'
              : '1fr',
        }}
      >
        <AdminSidebar
          mobileOpen={mobileNavOpen}
          onCloseMobile={closeMobileNav}
          isExpanded={isExpanded}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        />

        <div className="min-w-0">
          <AdminHeader mobileNavOpen={mobileNavOpen} onToggleMobileNav={toggleMobileNav} />
          <main className="min-w-0 px-4 pt-8 pb-16 sm:px-6 md:px-8 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
