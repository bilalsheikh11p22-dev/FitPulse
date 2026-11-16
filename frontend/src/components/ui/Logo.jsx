import React from 'react';

/**
 * FitPulse brand mark.
 *
 * A geometric "P" (stem + open bowl = strength and structure) with a forward-leaning
 * step beneath it (movement and progress, one rep at a time). The P follows
 * `currentColor` so it adapts to dark and light themes; the step is always brand orange.
 *
 * Drawn on a 40x40 grid, so it stays crisp from 16px (favicon) to hero sizes.
 */
export function LogoMark({ size = 32, className = '', title = 'FitPulse' }) {
  return (
    <svg
      viewBox="4.75 4 40 40"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={`shrink-0 ${className}`}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9 5h19.5a11.5 11.5 0 0 1 0 23H17v14H9zM17 12v9h11.5a4.5 4.5 0 0 0 0-9z"
      />
      <path
        fill="#ff6b2c"
        d="M22 43l10-10h8.5L30.5 43z"
        className="transition-transform duration-300 ease-out group-hover:translate-x-[1.5px] group-hover:-translate-y-[1.5px]"
      />
    </svg>
  );
}

/**
 * Mark + wordmark lockup. Wrap in a <Link className="group"> to get the subtle hover motion.
 * The wordmark pairs a heavy "Fit" with a lighter "Pulse", echoing the heavy stem / light step of the mark.
 */
export default function Logo({
  markSize = 32,
  showWordmark = true,
  tagline = '',
  className = '',
  wordmarkClassName = 'text-[19px] sm:text-xl text-white',
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-white ${className}`}>
      <LogoMark size={markSize} />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className={`font-display tracking-[-0.03em] ${wordmarkClassName}`}>
            <span className="font-extrabold">Fit</span>
            <span className="font-medium">Pulse</span>
          </span>
          {tagline && (
            <span className="mt-1 text-[9px] uppercase tracking-[0.24em] text-slate-400 font-semibold">{tagline}</span>
          )}
        </span>
      )}
    </span>
  );
}
