import React from 'react';
import PageHero from '../../components/ui/PageHero';
import { IMAGES } from '../../data/images';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  ShieldCheck, 
  Award, 
  Target, 
  Zap, 
  Heart, 
  Code2, 
  Database, 
  Cpu, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  const stack = [
    { name: 'MongoDB', role: 'NoSQL Database for high-speed biometrics & logs', icon: <Database className="w-5 h-5 text-emerald-400" /> },
    { name: 'Express.js', role: 'RESTful API routing & micro-services', icon: <Code2 className="w-5 h-5 text-slate-300" /> },
    { name: 'React.js', role: 'Component-based reactive UI & Framer Motion animations', icon: <Cpu className="w-5 h-5 text-cyan-400" /> },
    { name: 'Node.js', role: 'Event-driven scalable runtime environment', icon: <Zap className="w-5 h-5 text-brand-400" /> },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <PageHero eyebrow="About FitPulse" title="Built for people who want" highlight="measurable results" subtitle="FitPulse bridges the gap between training science and everyday execution - one place to log workouts, audit nutrition and analyse performance." image={IMAGES.gymDark} />
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Our Core Mission</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              To empower individuals to achieve verifiable body transformation through structured data, progressive overload metrics, and dietary accountability.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Complete Toolkit</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Everything in one platform: user accounts, workouts, nutrition, progress, reports, reminders and a full admin panel.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Security & Privacy</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your biometric data is encrypted. We enforce bcrypt password hashing, signed JWT authentication, and full GDPR compliance with zero data leakage.
            </p>
          </div>
        </div>

        {/* Architecture & Tech Stack */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white">Architectural Foundations</h2>
            <p className="text-xs text-slate-400">
              Modern full-stack MERN stack with scalable micro-architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stack.map((item) => (
              <div
                key={item.name}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 mx-auto flex items-center justify-center">
                  {item.icon}
                </div>
                <h4 className="text-sm font-bold text-white">{item.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center space-y-4 pt-4">
          <h3 className="text-xl font-bold text-white">Ready to begin your physical transformation?</h3>
          <div className="flex justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs hover:bg-brand-400 transition shadow-lg shadow-brand-500/20"
            >
              Create Account
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-xs hover:bg-slate-700 transition"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
