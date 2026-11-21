import React from 'react';
import { LogoMark } from './Logo';

/**
 * FitPulse loaders (theme aware, pure CSS animation, no extra dependencies).
 *
 *  <PageLoader />                 full-screen branded loader (auth check, route guards)
 *  <SectionLoader label="..." />  centred loader for a section / page body
 *  <InlineLoader label="..." />   compact loader for cards and lists
 *
 * Keyframes live in index.css (fp-spin, fp-breathe, fp-trace, fp-bar, fp-dots).
 */

function Ring({ size = 96, mark = 40, id = 'fp-ring' }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="presentation">
      {/* soft halo */}
      <span className="absolute inset-2 rounded-full blur-xl bg-brand-500/25 fp-breathe" aria-hidden="true" />
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff6b2c" />
            <stop offset="1" stopColor="#ffb020" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(var(--white) / 0.09)" strokeWidth="3" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${c * 0.28} ${c}`}
          className="fp-spin"
          style={{ transformOrigin: '50% 50%' }}
        />
      </svg>
      <LogoMark size={mark} className="relative text-white fp-breathe" />
    </div>
  );
}

function Heartbeat({ className = '' }) {
  return (
    <svg viewBox="0 0 220 36" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="fp-beat" x1="0" x2="1">
          <stop offset="0" stopColor="#ff6b2c" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ff6b2c" />
          <stop offset="1" stopColor="#ffb020" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 18 H70 L82 18 L92 5 L106 31 L118 10 L126 18 H150 L158 18 L164 13 L170 21 L174 18 H220"
        fill="none"
        stroke="url(#fp-beat)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="100"
        className="fp-trace"
      />
    </svg>
  );
}

export function PageLoader({ label = 'Loading your workspace' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* quiet grid + brand light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--white) / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--white) / 0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, #000 15%, transparent 72%)',
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, #000 15%, transparent 72%)',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full blur-[140px] bg-brand-500/10 pointer-events-none" />

      <div className="relative flex flex-col items-center">
        <Ring size={104} mark={44} id="fp-ring-page" />

        <div className="mt-6 font-display text-2xl tracking-[-0.03em] text-white">
          <span className="font-extrabold">Fit</span>
          <span className="font-medium">Pulse</span>
        </div>

        <Heartbeat className="mt-3 w-44 h-7" />

        <p className="mt-3 text-xs font-medium text-slate-400 tracking-wide">
          {label}
          <span className="fp-dots" aria-hidden="true">
            <i>.</i>
            <i>.</i>
            <i>.</i>
          </span>
        </p>

        {/* indeterminate progress */}
        <div className="mt-5 h-[3px] w-40 rounded-full overflow-hidden bg-white/10" aria-hidden="true">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-500 to-brand-accent fp-bar" />
        </div>
      </div>
    </div>
  );
}

export function SectionLoader({ label = 'Loading', className = '' }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={`min-h-[calc(100vh-4rem)] flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center">
        <Ring size={72} mark={28} id="fp-ring-section" />
        <p className="mt-4 text-xs font-medium text-slate-400 tracking-wide">
          {label}
          <span className="fp-dots" aria-hidden="true">
            <i>.</i>
            <i>.</i>
            <i>.</i>
          </span>
        </p>
      </div>
    </div>
  );
}

export function InlineLoader({ label = 'Loading', className = '' }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <Ring size={48} mark={18} id={`fp-ring-inline`} />
      <p className="mt-3 text-xs font-medium text-slate-400 tracking-wide">
        {label}
        <span className="fp-dots" aria-hidden="true">
          <i>.</i>
          <i>.</i>
          <i>.</i>
        </span>
      </p>
    </div>
  );
}

export default PageLoader;
