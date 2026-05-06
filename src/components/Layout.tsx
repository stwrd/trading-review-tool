import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/journal', label: 'Trade Journal' },
  { to: '/setups', label: 'Setup Library' },
  { to: '/errors', label: 'Error Analytics' },
  { to: '/weekly', label: 'Weekly Review' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4">
          <h1 className="mr-6 text-xl font-semibold">Trading Review Tool</h1>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm ${
                    isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
