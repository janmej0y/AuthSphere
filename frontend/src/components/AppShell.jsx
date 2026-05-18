import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AppShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Settings', to: '/settings' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">AuthSphere</p>
            <p className="mt-1 text-xs text-slate-500">{user?.role} workspace</p>
          </div>
          <nav className="mt-6 flex gap-2 lg:flex-col">
            {navItems.map((item) => (
              <Link
                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                  location.pathname === item.to ? 'bg-blue-50 text-brand' : 'text-slate-600 hover:bg-slate-50'
                }`}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            className="mt-6 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </aside>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;

