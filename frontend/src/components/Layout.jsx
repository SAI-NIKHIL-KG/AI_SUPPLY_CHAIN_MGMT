import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, Package, Truck, Users, AlertTriangle,
  IndianRupee, MessageSquare, FlaskConical, Map, FileText, Settings,
  LogOut, Menu, X, ChevronLeft
} from 'lucide-react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/forecast', icon: TrendingUp, label: 'Demand Forecast' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/suppliers', icon: Users, label: 'Suppliers' },
  { to: '/logistics', icon: Truck, label: 'Logistics' },
  { to: '/map', icon: Map, label: 'Network Map' },
  { to: '/risk', icon: AlertTriangle, label: 'Risk Center' },
  { to: '/cost', icon: IndianRupee, label: 'Cost Analytics' },
  { to: '/assistant', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/simulation', icon: FlaskConical, label: 'Simulation' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItems = () => (
    <>
      {nav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
            }`
          }
        >
          <Icon className="w-5 h-5 shrink-0" />
          {(sidebarOpen || mobileOpen) && <span>{label}</span>}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-slate-800 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm">AI Supply Chain</p>
              <p className="text-xs text-slate-400">BharatSmart</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-700"
          >
            <ChevronLeft className={`w-5 h-5 transition ${!sidebarOpen && 'rotate-180'}`} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItems />
        </nav>
        <div className="p-3 border-t border-slate-700">
          {sidebarOpen && (
            <div className="mb-2 px-2">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-600/20 hover:text-red-300 transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-800 text-white flex flex-col z-50">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <span className="font-bold">AI Supply Chain</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <NavItems />
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-slate-700">AI Supply Chain Management</h1>
            <p className="text-xs text-slate-400">Indian Market Decision Support System</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">{user?.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
