import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Bell, User, LogOut, Sun, Moon, Menu, X, ChevronDown, Settings, ShieldCheck, LifeBuoy, LogIn, UserPlus,
} from 'lucide-react';
import api from '../api/api';
import { toNumber } from '../utils/normalize';
import Logo from './ui/Logo';
import Avatar from './ui/Avatar';
import NavUnderline from './ui/NavUnderline';

const userNavLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Workouts', path: '/workouts' },
  { name: 'Nutrition', path: '/nutrition' },
  { name: 'Progress', path: '/progress' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Goals', path: '/goals-reminders' },
  { name: 'Reports', path: '/reports' },
];

const publicNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Features', path: '/features' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('/notifications');
        // response is { notifications, unreadCount } - read the count, never treat it as an array
        const count = res.data && !Array.isArray(res.data) ? toNumber(res.data.unreadCount) : 0;
        if (!cancelled) setUnreadCount(count);
      } catch {
        // keep the last known count on a transient failure
      }
    };
    // The Notifications page announces its own count, so it needs no second request
    if (location.pathname !== '/notifications') load();
    const onChanged = (e) => {
      const count = e?.detail?.unreadCount;
      if (Number.isFinite(count)) setUnreadCount(count);
      else load();
    };
    window.addEventListener('fitpulse:notifications-changed', onChanged);
    // Reminders are created by the server on a schedule, so poll gently while the tab is visible
    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 60000);
    return () => {
      cancelled = true;
      clearInterval(poll);
      window.removeEventListener('fitpulse:notifications-changed', onChanged);
    };
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = user ? userNavLinks : publicNavLinks;
  const isActive = (p) => location.pathname === p || (p === '/goals-reminders' && location.pathname === '/reminders');

  const iconBtn =
    'p-2 sm:p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/85 backdrop-blur-xl border-b border-slate-800 shadow-soft' : 'bg-slate-950/40 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-16 sm:h-[68px]">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="group shrink-0" aria-label="FitPulse home">
            <Logo markSize={32} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {links.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 ${
                    active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="relative inline-block">
                    {link.name}
                    {active && <NavUnderline layoutId="nav-underline" />}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggleTheme} className={`${iconBtn} hidden min-[400px]:inline-flex`} title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/25 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}

                <Link to="/notifications" className={`relative ${iconBtn}`} title="Notifications" aria-label="Notifications">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-[10px] font-bold text-[#fff] flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown((v) => !v)}
                    className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-600 transition"
                  >
                    <Avatar src={user.avatar} name={user.name} size={32} rounded="rounded-lg" className="ring-2 ring-brand-500/40" />
                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-200">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.16 }}
                          className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-soft py-2 z-50 origin-top-right"
                        >
                          <div className="px-4 py-2.5 border-b border-slate-800">
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                          </div>
                          {user.role === 'admin' && (
                            <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition">
                              <ShieldCheck className="w-4 h-4" /> Admin Console
                            </Link>
                          )}
                          <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition">
                            <User className="w-4 h-4 text-brand-400" /> My Profile
                          </Link>
                          <Link to="/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition">
                            <Settings className="w-4 h-4 text-cyan-400" /> Settings
                          </Link>
                          <Link to="/support" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition">
                            <LifeBuoy className="w-4 h-4 text-amber-400" /> Support & Feedback
                          </Link>
                          <div className="border-t border-slate-800 my-1" />
                          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/admin/login" className="hidden xl:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition border border-red-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
                <Link to="/login" className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary !py-2.5 !px-5 !text-[13px]">
                  Get Started
                </Link>
              </div>
            )}

            <button onClick={() => setMenuOpen((v) => !v)} className={`lg:hidden ${iconBtn}`} aria-label="Menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 top-16 sm:top-[68px] bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden absolute top-full inset-x-0 z-50 bg-slate-950 border-b border-slate-800 shadow-soft max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-1">
                {links.map((link, i) => {
                  const active = isActive(link.path);
                  return (
                    <motion.div key={link.path} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <Link
                        to={link.path}
                        aria-current={active ? 'page' : undefined}
                        className={`block px-4 py-3 text-sm font-semibold transition-colors ${
                          active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="relative inline-block">
                          {link.name}
                          {active && <NavUnderline layoutId="nav-underline-mobile" />}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}

                {!user ? (
                  <div className="pt-3 grid grid-cols-2 gap-2">
                    <Link to="/login" className="btn-ghost !py-3"><LogIn className="w-4 h-4" /> Sign In</Link>
                    <Link to="/register" className="btn-primary !py-3"><UserPlus className="w-4 h-4" /> Join Free</Link>
                    <Link to="/admin/login" className="col-span-2 text-center px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 border border-red-500/20">
                      Admin Portal
                    </Link>
                  </div>
                ) : (
                  <div className="pt-3 grid grid-cols-2 gap-2">
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/25 transition">
                        <ShieldCheck className="w-4 h-4" /> Admin Console
                      </Link>
                    )}
                    <Link to="/profile" className="btn-ghost !py-3"><User className="w-4 h-4" /> Profile</Link>
                    <button onClick={handleLogout} className="btn-ghost !py-3 !text-red-400 !border-red-500/30"><LogOut className="w-4 h-4" /> Sign Out</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
