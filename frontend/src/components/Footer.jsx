import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Reveal from './ui/Reveal';
import Logo from './ui/Logo';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="relative border-t border-slate-800 bg-slate-950 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      {!user && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-brand-600 via-brand-500 to-amber-400 text-[#fff] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-glow">
              <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-[#fff]/10 blur-2xl" />
              <div className="relative">
                <h3 className="text-2xl sm:text-4xl font-extrabold leading-tight">Ready to level up your training?</h3>
                <p className="mt-2 text-[#fff]/85 max-w-xl text-sm sm:text-base">Join FitPulse today and turn every workout into measurable progress.</p>
              </div>
              <Link to="/register" className="relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-950 text-white font-bold text-sm hover:scale-105 transition-transform shrink-0">
                Start for free <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          <div className="col-span-2 md:col-span-4 space-y-4">
            <Link to="/" className="group inline-flex" aria-label="FitPulse home">
              <Logo markSize={32} wordmarkClassName="text-xl text-white" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The all-in-one fitness tracker for workouts, nutrition and progress - built to keep you consistent and motivated.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-400" /> support@fitpulse.com</li>
            </ul>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-sm font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/features" className="hover:text-brand-400 transition">Features</Link></li>
              <li><Link to="/workouts" className="hover:text-brand-400 transition">Workouts</Link></li>
              <li><Link to="/nutrition" className="hover:text-brand-400 transition">Nutrition</Link></li>
              <li><Link to="/analytics" className="hover:text-brand-400 transition">Analytics</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-brand-400 transition">About us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-400 transition">Contact</Link></li>
              <li><Link to="/support" className="hover:text-brand-400 transition">Support</Link></li>
              <li><Link to="/reports" className="hover:text-brand-400 transition">Reports</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-3">
            <h4 className="text-sm font-bold text-white mb-4">Built with</h4>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium">
              {['MongoDB', 'Express', 'React', 'Node.js', 'Tailwind', 'Framer Motion', 'Recharts'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-300">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FitPulse. All rights reserved.</p>
          <p>Train smart. Eat well. Track everything.</p>
        </div>
      </div>
    </footer>
  );
}
