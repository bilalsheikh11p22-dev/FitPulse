import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Logo from './Logo';
import Img from './Img';
import { IMAGES } from '../../data/images';

// Split-screen layout for Login / Register / Admin login
export default function AuthShell({ children, image = IMAGES.auth, title, subtitle, points = [], accent = 'brand' }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 bg-slate-950">
      {/* Image side */}
      <div className="relative hidden lg:block overflow-hidden">
        <Img src={image} alt="" eager className="absolute inset-0 w-full h-full -z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/60 to-transparent -z-10" />
        <div className={`absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] -z-10 ${accent === 'red' ? 'bg-red-500/25' : 'bg-brand-500/30'}`} />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 xl:p-16">
          <Link to="/" className="group inline-flex w-fit" aria-label="FitPulse home">
            <Logo markSize={36} wordmarkClassName="text-2xl text-white" />
          </Link>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight text-[#fff]">{title}</h2>
            {subtitle && <p className="mt-4 text-slate-300 max-w-md leading-relaxed">{subtitle}</p>}
            <ul className="mt-8 space-y-3">
              {points.map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="flex items-center gap-3 text-sm text-slate-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                  {p}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex items-center justify-center px-4 sm:px-8 py-10 sm:py-14 overflow-hidden">
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] blur-[140px] rounded-full pointer-events-none ${accent === 'red' ? 'bg-red-500/10' : 'bg-brand-500/10'}`} />
        <div className="relative z-10 w-full flex justify-center">{children}</div>
      </div>
    </div>
  );
}
