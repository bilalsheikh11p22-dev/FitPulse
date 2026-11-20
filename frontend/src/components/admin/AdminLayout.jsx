import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Utensils,
  Scale,
  FileText,
  LifeBuoy,
  Star,
  Megaphone,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LogoMark } from '../ui/Logo';
import Avatar from '../ui/Avatar';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Workouts', path: '/admin/workouts', icon: Dumbbell },
      { name: 'Nutrition', path: '/admin/nutrition', icon: Utensils },
      { name: 'Progress', path: '/admin/progress', icon: Scale },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { name: 'Support Tickets', path: '/admin/support', icon: LifeBuoy },
      { name: 'Feedback', path: '/admin/feedback', icon: Star },
      { name: 'Broadcast', path: '/admin/notifications', icon: Megaphone },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Reports', path: '/admin/reports', icon: FileText },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function SidebarContent({ onNavigate }) {
  return (
    <div className="h-full flex flex-col">
      {/* Brand */}
      <Link
        to="/admin/dashboard"
        onClick={onNavigate}
        className="group flex items-center gap-3 px-5 h-16 shrink-0 border-b border-slate-800"
        aria-label="FitPulse admin console"
      >
        <LogoMark size={30} className="text-white" />
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] tracking-tight text-white">
            <span className="font-extrabold">Fit</span>
            <span className="font-medium">Pulse</span>
          </span>
          <span className="mt-1 text-[11px] text-slate-500 font-medium">Admin Console</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Admin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-xs font-medium text-slate-500">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ name, path, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-brand-500" />
                        )}
                        <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-brand-400' : ''}`} />
                        <span>{name}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer link */}
      <div className="p-3 border-t border-slate-800">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <span>Open user app</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const current = ALL_ITEMS.find((i) => i.path === location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 shadow-2xl">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-slate-300 hover:bg-slate-800"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
                <span className="text-slate-500 hidden sm:inline">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
                <span className="font-semibold text-white truncate">{current?.name || 'Console'}</span>
              </nav>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              <div className="hidden sm:block w-px h-6 bg-slate-800 mx-1" />

              <div className="flex items-center gap-2.5 pl-1">
                <Avatar src={user?.avatar} name={user?.name} size={32} rounded="rounded-full" />
                <div className="hidden md:flex flex-col leading-tight">
                  <span className="text-sm font-medium text-white max-w-[140px] truncate">{user?.name || 'Administrator'}</span>
                  <span className="text-xs text-slate-500">Administrator</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-1 p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 z-auto [animation:none] px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
