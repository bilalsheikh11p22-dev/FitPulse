// Timezone-aware "next occurrence" calculation for reminders. Uses Intl only (no extra dependency).
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isValidTimeZone = (tz) => {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const formatters = new Map();
const zoneParts = (ms, tz) => {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    formatters.set(tz, f);
  }
  const p = {};
  for (const part of f.formatToParts(new Date(ms))) p[part.type] = part.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
};

// offset (ms) of `tz` from UTC at instant `ms`
const zoneOffsetMs = (ms, tz) => {
  const p = zoneParts(ms, tz);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
};

// UTC instant (ms) for the wall-clock time y-m-d h:mi in `tz`
const zonedToUtc = (y, m, d, h, mi, tz) => {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const first = guess - zoneOffsetMs(guess, tz);
  const second = guess - zoneOffsetMs(first, tz);
  return second;
};

// Next time (Date) the reminder is due strictly after `after`, or null (one-time reminder in the past / no valid days).
const computeNextRun = (reminder, after = new Date()) => {
  const tz = isValidTimeZone(reminder.timezone) ? reminder.timezone : 'UTC';
  const [h, mi] = String(reminder.time).split(':').map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(mi)) return null;
  const afterMs = new Date(after).getTime();

  if (reminder.repeat === 'once') {
    if (!DATE_RE.test(reminder.runDate || '')) return null;
    const [y, m, d] = reminder.runDate.split('-').map(Number);
    const t = zonedToUtc(y, m, d, h, mi, tz);
    return t > afterMs ? new Date(t) : null;
  }

  let allowed;
  if (reminder.repeat === 'daily') allowed = ALL_DAYS;
  else if (reminder.repeat === 'weekly') allowed = (reminder.days || []).slice(0, 1);
  else allowed = reminder.days || [];
  if (!allowed.length) return null;

  const local = zoneParts(afterMs, tz);
  for (let i = 0; i <= 8; i += 1) {
    const day = new Date(Date.UTC(local.y, local.m - 1, local.d + i));
    if (!allowed.includes(DAY_NAMES[day.getUTCDay()])) continue;
    const t = zonedToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), h, mi, tz);
    if (t > afterMs) return new Date(t);
  }
  return null;
};

module.exports = { isValidTimeZone, computeNextRun, zonedToUtc, DATE_RE, ALL_DAYS };
