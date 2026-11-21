import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Logo from './Logo';
import { IMAGES } from '../../data/images';
import { useSiteMedia } from '../../context/SiteMediaContext';

// Split-screen layout for Login / Register / Admin login / password flows.
// Only the background and the left brand panel live here; the form is whatever the page passes as children.
//
// The left panel follows the theme (deep navy in dark mode, soft light in light mode) using the theme tokens.
// It never depends on the photo: if the image is slow, blocked or offline the panel still looks finished.

const GLOWS = {
  brand: { a: 'rgba(255,107,44,0.22)', b: 'rgba(255,176,32,0.08)' },
  red: { a: 'rgba(239,68,68,0.22)', b: 'rgba(244,63,94,0.08)' },
};

function PulseLine({ reduce }) {
  return (
    <svg
      viewBox="0 0 800 200"
      preserveAspectRatio="none"
      className="absolute left-0 right-0 top-[38%] w-full h-40 pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pulse-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ff6b2c" stopOpacity="0" />
          <stop offset="0.35" stopColor="#ff6b2c" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#ffb020" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb020" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0 100 H250 L282 100 L312 38 L352 166 L388 58 L414 100 H520 L545 100 L565 78 L585 118 L600 100 H800"
        fill="none"
        stroke="url(#pulse-fade)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.3 }}
      />
    </svg>
  );
}

export default function AuthShell({ children, image = IMAGES.auth, title, subtitle, points = [], accent = 'brand' }) {
  const [imgOk, setImgOk] = useState(false);
  const reduce = useReducedMotion();
  const { getUrl } = useSiteMedia();
  const bgImage = getUrl('authBackground', image);
  const glow = GLOWS[accent] || GLOWS.brand;

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] bg-slate-950">
      {/* ---------- Brand panel (theme aware) ---------- */}
      <aside className="relative hidden lg:flex overflow-hidden bg-slate-900 border-r border-white/[0.08]">
        {/* Photo: clearly visible, then tinted by the theme overlay below so text always stays readable */}
        {bgImage && (
          <img
            key={bgImage}
            src={bgImage}
            alt=""
            loading="eager"
            decoding="async"
            onLoad={() => setImgOk(true)}
            onError={() => setImgOk(false)}
            className={`absolute inset-0 w-full h-full object-cover object-center saturate-[0.85] transition-opacity duration-1000 ${imgOk ? 'opacity-60 dark:opacity-50' : 'opacity-0'}`}
          />
        )}

        {/* Theme tint: navy in dark mode, soft white in light mode (slate tokens flip with the theme) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Fine grid, faded toward the edges */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(var(--white) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--white) / 0.05) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 30% 55%, #000 25%, transparent 75%)',
            maskImage: 'radial-gradient(ellipse 80% 70% at 30% 55%, #000 25%, transparent 75%)',
          }}
        />

        {/* Brand light */}
        <div
          className="absolute -bottom-40 -left-32 w-[640px] h-[640px] rounded-full blur-[130px]"
          style={{ background: glow.a }}
        />
        <div
          className="absolute -top-40 -right-32 w-[460px] h-[460px] rounded-full blur-[130px]"
          style={{ background: glow.b }}
        />

        {/* The "pulse" */}
        <PulseLine reduce={reduce} />

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col justify-between p-12 xl:p-16">
          <Link to="/" className="group inline-flex w-fit" aria-label="FitPulse home">
            <Logo markSize={36} wordmarkClassName="text-2xl text-white" />
          </Link>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-xl"
          >
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight text-white">{title}</h2>
            {subtitle && <p className="mt-5 text-base xl:text-lg text-slate-300 max-w-md leading-relaxed">{subtitle}</p>}

            {points.length > 0 && (
              <ul className="mt-9 space-y-3.5">
                {points.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={reduce ? false : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.1 }}
                    className="flex items-center gap-3 text-sm xl:text-[15px] text-slate-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                    {p}
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </aside>

      {/* ---------- Form side ---------- */}
      <div className="relative flex items-center justify-center px-4 sm:px-8 py-10 sm:py-14 overflow-hidden bg-slate-950">
        {/* Quiet dotted texture + soft light, so the card sits on something instead of flat colour */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgb(var(--white) / 0.07) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)',
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[150px] pointer-events-none"
          style={{ background: glow.b.replace('0.08', '0.12') }}
        />
        <div className="relative z-10 w-full flex justify-center">{children}</div>
      </div>
    </div>
  );
}
