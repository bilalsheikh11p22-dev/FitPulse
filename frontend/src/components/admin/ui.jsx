import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Inbox, Search, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Shared building blocks for every admin screen.                     */
/*  One accent (brand orange), neutral surfaces, semantic status       */
/*  colours only where they carry meaning. Fully theme-aware because   */
/*  everything is expressed with the slate / brand tokens.             */
/* ------------------------------------------------------------------ */

export const inputCls =
  'w-full rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm px-3.5 py-2.5 ' +
  'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-50';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold ' +
  'px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed';

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium ' +
  'px-4 py-2.5 border border-slate-700/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const iconBtn =
  'inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400';

/** Page title block with optional right-side actions. */
export function PageHeader({ icon: Icon, title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          {Icon && (
            <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-brand-400">
              <Icon className="w-[18px] h-[18px]" />
            </span>
          )}
          <span className="truncate">{title}</span>
        </h1>
        {description && <p className="mt-2 text-sm text-slate-400 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/** Standard surface. Use `padded={false}` for tables that run edge to edge. */
export function Card({ title, icon: Icon, action, children, padded = true, className = '' }) {
  return (
    <section className={`rounded-xl bg-slate-900 border border-slate-800 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-slate-400" />}
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

const STAT_TONES = {
  brand: 'text-brand-400 bg-brand-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  cyan: 'text-cyan-400 bg-cyan-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  violet: 'text-violet-400 bg-violet-500/10',
  slate: 'text-slate-300 bg-slate-800',
};

/** KPI tile. The icon chip carries the colour; the number stays neutral for easy scanning. */
export function StatCard({ label, value, hint, icon: Icon, tone = 'slate' }) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-400">{label}</p>
        {Icon && (
          <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg ${STAT_TONES[tone] || STAT_TONES.slate}`}>
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold text-white tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const BADGE_TONES = {
  neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  brand: 'bg-brand-500/10 text-brand-400 border-brand-500/25',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  danger: 'bg-red-500/10 text-red-400 border-red-500/25',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
};

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${BADGE_TONES[tone] || BADGE_TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({ active, activeLabel = 'Active', inactiveLabel = 'Suspended' }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-300">
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function Alert({ tone = 'danger', children }) {
  const isOk = tone === 'success';
  const Icon = isOk ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={isOk ? 'status' : 'alert'}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
        isOk
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
          : 'bg-red-500/10 border-red-500/25 text-red-400'
      }`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="py-20 flex flex-col items-center gap-3 text-sm text-slate-400">
      <div className="w-7 h-7 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="py-16 px-6 flex flex-col items-center text-center">
      <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
        <Icon className="w-5 h-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-white">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>}
    </div>
  );
}

/** Search input + submit, used by every list screen. */
export function SearchBar({ value, onChange, onSubmit, placeholder }) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 flex-1 min-w-[240px]">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`${inputCls} pl-10`}
        />
      </div>
      <button type="submit" className={btnPrimary}>
        Search
      </button>
    </form>
  );
}

/** Segmented single-select filter. `options` can be strings or {value,label}. */
export function FilterTabs({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {label && <span className="text-xs font-medium text-slate-500 mr-1">{label}</span>}
      <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
        {options.map((o) => {
          const val = typeof o === 'string' ? o : o.value;
          const text = typeof o === 'string' ? o : o.label;
          const active = value === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              aria-pressed={active}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Table shell: horizontal scroll, sticky-looking header, quiet row dividers. */
export function DataTable({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/50">
            {columns.map((c) => (
              <th
                key={c.label}
                scope="col"
                className={`px-5 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap ${c.align === 'right' ? 'text-right' : ''}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">{children}</tbody>
      </table>
    </div>
  );
}

export const tdCls = 'px-5 py-3.5 align-middle';

/** Accessible modal with Escape-to-close. */
export function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-xl bg-slate-900 border border-slate-800 shadow-2xl`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className={iconBtn} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-5">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-slate-800 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-200 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
