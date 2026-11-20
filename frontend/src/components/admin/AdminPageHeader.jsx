import React from 'react';

const TONES = {
  brand: 'bg-brand-500/10 text-brand-400 border-brand-500/25',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  red: 'bg-red-500/10 text-red-400 border-red-500/25',
};

// Shared title block for every admin page: icon tile, title, one-line description and optional actions on the right.
export default function AdminPageHeader({ icon: Icon, title, subtitle, tone = 'brand', children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 min-w-0">
        {Icon && (
          <span className={`shrink-0 w-11 h-11 rounded-2xl border inline-flex items-center justify-center ${TONES[tone] || TONES.brand}`}>
            <Icon className="w-5 h-5" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-[13px] text-slate-400 mt-1 max-w-2xl leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
