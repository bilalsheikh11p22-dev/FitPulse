const mongoose = require('mongoose');

// Escape user input before using it inside a RegExp (prevents regex injection / ReDoS)
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Stock photo that older versions of the app silently assigned to every new account.
// It is treated as "no profile picture" so existing accounts behave like new ones.
const LEGACY_DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
];

const sanitizeAvatar = (value) =>
  typeof value === 'string' && value.trim() && !LEGACY_DEFAULT_AVATARS.includes(value.trim()) ? value.trim() : '';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Parse a number, returning `fallback` for anything that is not a finite number
const toNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const isValidDate = (value) => {
  if (value === undefined || value === null || value === '') return false;
  return !Number.isNaN(new Date(value).getTime());
};

// Map thrown errors to a sensible HTTP status. Mongoose validation / cast errors are client errors.
const handleError = (res, error) => {
  if (error && error.name === 'ValidationError') {
    const message = Object.values(error.errors || {})
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ message: message || 'Validation failed' });
  }
  if (error && error.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${error.path}` });
  }
  if (error && error.code === 11000) {
    return res.status(400).json({ message: 'A record with that value already exists' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Server error. Please try again.' });
};

// ---- Local-day helpers -------------------------------------------------------------
// `tzOffsetMin` follows JavaScript's Date#getTimezoneOffset() (UTC minus local, in minutes), so the
// browser can send its own offset and "today" / streaks are computed in the USER's local day.
const MS_DAY = 86400000;

const parseTzOffset = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && Math.abs(n) <= 840 ? n : fallback;
};

const dayIndex = (date, tzOffsetMin) => Math.floor((new Date(date).getTime() - tzOffsetMin * 60000) / MS_DAY);

// Start and end instants of the local day that contains `now`
const localDayRange = (now = new Date(), tzOffsetMin = now.getTimezoneOffset()) => {
  const start = new Date(dayIndex(now, tzOffsetMin) * MS_DAY + tzOffsetMin * 60000);
  return { start, end: new Date(start.getTime() + MS_DAY - 1) };
};

// Consecutive-day workout streak from real workout dates.
// - several workouts on one day count once
// - future-dated workouts are ignored
// - the streak is still alive if the latest workout was today OR yesterday
const calculateStreak = (dates, now = new Date(), tzOffsetMin = now.getTimezoneOffset()) => {
  const today = dayIndex(now, tzOffsetMin);
  const days = new Set();
  for (const d of dates) {
    const t = new Date(d).getTime();
    if (Number.isNaN(t)) continue;
    const idx = dayIndex(t, tzOffsetMin);
    if (idx <= today) days.add(idx);
  }
  let cursor = days.has(today) ? today : today - 1;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
};

module.exports = { LEGACY_DEFAULT_AVATARS, sanitizeAvatar, escapeRegex, isValidId, toNumber, isValidDate, handleError, calculateStreak, parseTzOffset, localDayRange };
