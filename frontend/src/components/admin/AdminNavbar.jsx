import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogoMark } from '../ui/Logo';
import NavUnderline from '../ui/NavUnderline';
import { 
  ShieldCheck, 
  Users, 
  Dumbbell, 
  Layers,
  Utensils, 
  Scale, 
  FileText, 
  LifeBuoy, 
  Star, 
  Bell, 
  Settings, 
  LogOut, 
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

export default function AdminNavbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <ShieldCheck className="w-4 h-4" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { name: 'Workouts', path: '/admin/workouts', icon: <Dumbbell className="w-4 h-4" /> },
    { name: 'Categories', path: '/admin/workout-categories', icon: <Layers className="w-4 h-4" /> },
    { name: 'Nutrition', path: '/admin/nutrition', icon: <Utensils className="w-4 h-4" /> },
    { name: 'Progress', path: '/admin/progress', icon: <Scale className="w-4 h-4" /> },
    { name: 'Reports', path: '/admin/reports', icon: <FileText className="w-4 h-4" /> },
    { name: 'Tickets', path: '/admin/support', icon: <LifeBuoy className="w-4 h-4" /> },
    { name: 'Feedback', path: '/admin/feedback', icon: <Star className="w-4 h-4" /> },
    { name: 'Broadcast', path: '/admin/notifications', icon: <Bell className="w-4 h-4" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Admin Pill */}
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="group flex items-center gap-2.5" aria-label="FitPulse admin console">
              <LogoMark size={32} className="text-white" />
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg tracking-tight text-white flex items-center gap-1.5">
                  <span>
                    <span className="font-extrabold">Fit</span>
                    <span className="font-medium">Pulse</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    ADMIN
                  </span>
                </span>
                <span className="mt-1 text-[9px] uppercase tracking-[0.24em] text-slate-400 font-semibold">
                  Management Console
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Links */}
          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Admin">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="relative inline-block">
                    {link.name}
                    {isActive && <NavUnderline layoutId="admin-nav-underline" tone="red" />}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Switchers */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-brand-400 hover:text-brand-300 hover:bg-slate-800 transition"
              title="Open User Panel"
            >
              <span>User Panel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 transition"
              title="Admin Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-slate-900 text-slate-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-slate-800 space-y-1">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="relative inline-block">
                    {link.name}
                    {isActive && <NavUnderline layoutId="admin-nav-underline-mobile" tone="red" />}
                  </span>
                </Link>
              );
            })}
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-brand-400 font-medium"
            >
              Switch to User View →
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
