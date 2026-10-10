import { NavLink } from 'react-router';

const LINKS = [
  { to: '/', label: 'Scan' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/history', label: 'History' },
];

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <span className="navbar__brand">Inventory Scanner</span>
        <nav className="navbar__links">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
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
