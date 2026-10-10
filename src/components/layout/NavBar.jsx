import { NavLink } from 'react-router';

const LINKS = [
  { to: '/', label: 'Scan' },
  { to: '/products', label: 'Products' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/staff-usage', label: 'Staff usage' },
  { to: '/history', label: 'History' },
  { to: '/counts', label: 'Stock count' },
  { to: '/staff', label: 'Staff' },
];

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <span className="navbar__brand">Salon Stock</span>
        <nav className="navbar__links">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
