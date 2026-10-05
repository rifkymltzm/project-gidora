import { NavLink } from 'react-router-dom';

const navigation = [
  { label: 'PROFILE', to: '/account/profile' },
  { label: 'ADDRESSES', to: '/account/addresses' },
  { label: 'ORDERS', to: '/account/orders' },
];

export default function AccountNavigation() {
  return (
    <nav
      className="no-scrollbar border-border-subtle flex overflow-x-auto border-b"
      aria-label="Account navigation"
    >
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `font-nav-item relative mr-6 shrink-0 px-1 py-4 transition-colors duration-300 last:mr-0 sm:mr-7 ${isActive ? 'text-primary' : 'text-text-muted hover:text-primary'} after:bg-primary after:absolute after:bottom-0 after:left-0 after:h-px after:transition-all after:duration-300 ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'} `
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
