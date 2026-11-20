import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { API_BASE_URL } from '../api/api';

// Loads the admin-customised pictures and video once, and lets any component ask for a slot.
// The last response is cached in localStorage so returning visitors do not see the default picture flash.

const CACHE_KEY = 'fitpulse_site_media';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, ''); // '' in production (same origin)

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const resolveSrc = (src) => (src && src.startsWith('/api/') ? `${API_ORIGIN}${src}` : src);

const SiteMediaContext = createContext({
  items: {},
  loaded: false,
  getUrl: (key, fallback) => fallback,
  getItem: () => null,
  refresh: async () => {},
});

export function SiteMediaProvider({ children }) {
  const [items, setItems] = useState(readCache);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/media');
      const next = res.data && typeof res.data.items === 'object' && res.data.items ? res.data.items : {};
      setItems(next);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        /* storage full or blocked: the cache is optional */
      }
    } catch {
      /* offline or API down: keep the cached/default pictures */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      items,
      loaded,
      refresh,
      getItem: (key) => items[key] || null,
      getUrl: (key, fallback) => {
        const item = items[key];
        return item && item.src ? resolveSrc(item.src) : fallback;
      },
    }),
    [items, loaded, refresh]
  );

  return <SiteMediaContext.Provider value={value}>{children}</SiteMediaContext.Provider>;
}

export const useSiteMedia = () => useContext(SiteMediaContext);
