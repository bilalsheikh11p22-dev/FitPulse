import React, { useState } from 'react';

// Image with loading shimmer + graceful fallback if the URL fails (offline, blocked, etc.)
export default function Img({ src, alt = '', className = '', imgClassName = '', eager = false, ...rest }) {
  const [state, setState] = useState('loading');
  const hasPosition = className.includes('absolute') || className.includes('fixed');
  return (
    <div className={`${hasPosition ? '' : 'relative'} overflow-hidden ${state === 'loading' ? 'img-skeleton' : ''} ${className}`}>
      {state !== 'error' ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={`w-full h-full object-cover transition-opacity duration-700 ${state === 'ok' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...rest}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/40 via-slate-800 to-slate-900 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-brand-400/60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" />
          </svg>
        </div>
      )}
    </div>
  );
}
