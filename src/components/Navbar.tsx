import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/sop', label: 'SOP Review' },
  { to: '/log', label: 'Log Review' },
  { to: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  return (
    <header className="bg-slateish text-white shadow-panel">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">Compliance Gap Intelligence</h1>
          <p className="text-xs text-slate-200">SOP vs Execution Log Gap Detection Platform</p>
        </div>
        <nav className="flex gap-2 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 transition ${
                  isActive ? 'bg-brand-400 text-slateish' : 'bg-white/10 text-slate-100 hover:bg-white/20'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
