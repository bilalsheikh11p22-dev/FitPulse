// Response normalization helpers.
// They never invent data: anything that is not the expected shape becomes an empty array / 0 / null.

// Return an array from an API payload. Accepts a bare array, or an object holding the array under `key`, or standard common payload keys.
export const toArray = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (key && Array.isArray(data[key])) return data[key];
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.tickets)) return data.tickets;
    if (Array.isArray(data.feedback)) return data.feedback;
    if (Array.isArray(data.feedbacks)) return data.feedbacks;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    if (data.data && typeof data.data === 'object') {
      if (key && Array.isArray(data.data[key])) return data.data[key];
      if (Array.isArray(data.data.tickets)) return data.data.tickets;
      if (Array.isArray(data.data.feedback)) return data.data.feedback;
      if (Array.isArray(data.data.feedbacks)) return data.data.feedbacks;
    }
  }
  return [];
};

// Finite number from numbers or numeric strings; anything else (objects, NaN, '') becomes `fallback`.
export const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

// Format a number for display with a fixed number of decimals. Safe for anything.
export const fmt = (value, digits = 0) => {
  const n = toNumber(value, 0);
  return digits > 0 ? n.toFixed(digits).replace(/\.?0+$/, '') : String(Math.round(n));
};

// A valid Date or null
export const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const fmtDate = (value, options) => {
  const d = toDate(value);
  return d ? d.toLocaleDateString(undefined, options) : '--';
};

// Human readable message from an axios error
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const msg = err?.response?.data?.message;
  if (typeof msg === 'string' && msg) return msg;
  if (err?.code === 'ERR_NETWORK' || (!err?.response && err?.request)) {
    return 'Cannot reach the server. Please check that the backend is running.';
  }
  return fallback;
};

// Progress toward a goal in percent (unclamped): (current - start) / (target - start) * 100, which is
// current / target * 100 when start is 0 and also works for goals that go down (weight loss).
// Never divides by zero; never invents progress.
export const goalProgressRaw = (goal) => {
  const target = toNumber(goal?.targetValue);
  const current = toNumber(goal?.currentValue);
  const hasStart = goal?.startValue !== undefined && goal?.startValue !== null;
  let pct;
  if (hasStart) {
    const start = toNumber(goal.startValue);
    pct = start === target ? (current === target ? 100 : 0) : ((current - start) / (target - start)) * 100;
  } else {
    pct = target > 0 ? (current / target) * 100 : 0;
  }
  return Number.isFinite(pct) ? Math.round(pct) : 0;
};

// Same, clamped to 0..100 for progress bars (the real value stays available via goalProgressRaw)
export const goalProgress = (goal) => Math.max(0, Math.min(100, goalProgressRaw(goal)));

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
