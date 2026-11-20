import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { API_BASE_URL } from '../api/api';
import { IMAGES } from '../data/images';

// Where uploaded files are served from: the API origin (http://localhost:5001), not the /api path
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const CACHE_KEY = 'fitpulse_media';

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
};

// '/uploads/media/x.jpg' -> 'http://localhost:5001/uploads/media/x.jpg'; external links pass through
export const resolveMediaUrl = (url) => {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Defaults + admin overrides -> same shape as IMAGES ({ hero, gym, avatars: { marcus, ... }, heroVideo ... })
const build = (overrides) => {
  const merged = { ...IMAGES, avatars: { ...IMAGES.avatars } };
  Object.entries(overrides || {}).forEach(([key, url]) => {
    const full = resolveMediaUrl(url);
    if (!full) return;
    if (key.startsWith('avatars.')) merged.avatars[key.slice('avatars.'.length)] = full;
    else merged[key] = full;
  });
  return merged;
};

const MediaContext = createContext({ media: IMAGES, overrides: {}, refresh: () => {} });

export function MediaProvider({ children }) {
  // Start from the last known admin media so a customised hero never flashes the default first
  const [overrides, setOverrides] = useState(readCache);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/media');
      const next = res.data?.media || {};
      setOverrides(next);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        /* storage full / blocked: the live value is still in state */
      }
    } catch {
      /* backend offline: keep cached / default media */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const media = useMemo(() => build(overrides), [overrides]);
  const value = useMemo(() => ({ media, overrides, refresh }), [media, overrides, refresh]);

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMedia = () => useContext(MediaContext).media;
// eslint-disable-next-line react-refresh/only-export-components
export const useMediaAdmin = () => useContext(MediaContext);
