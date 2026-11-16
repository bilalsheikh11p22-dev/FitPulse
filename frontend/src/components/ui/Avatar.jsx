import React, { useState } from 'react';
import { User } from 'lucide-react';
import { resolveAvatar, getInitials } from '../../utils/avatar';

/**
 * Profile picture with a clean fallback.
 * - Picture set and loadable -> the picture.
 * - Otherwise -> the person's initials, or a neutral user icon when there is no name either.
 * Never fetches a stock, random or generated image.
 */
export default function Avatar({ src, name, size = 32, rounded = 'rounded-xl', className = '', alt }) {
  const url = resolveAvatar(src);
  const [failedUrl, setFailedUrl] = useState('');
  const showImage = url && failedUrl !== url;
  const initials = getInitials(name);
  const box = { width: size, height: size };

  if (showImage) {
    return (
      <img
        src={url}
        alt={alt ?? name ?? 'Profile'}
        style={box}
        className={`${rounded} object-cover shrink-0 ${className}`}
        onError={() => setFailedUrl(url)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={alt ?? name ?? 'Profile'}
      style={{ ...box, fontSize: Math.max(10, Math.round(size * 0.38)) }}
      className={`${rounded} shrink-0 inline-flex items-center justify-center select-none font-display font-bold tracking-tight bg-slate-800 text-slate-200 border border-slate-700 ${className}`}
    >
      {initials || <User style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2} />}
    </span>
  );
}
