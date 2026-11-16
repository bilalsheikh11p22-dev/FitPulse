// Pure analytics helpers: date-range resolution, bucketing and summaries.
// All "days" are the USER's local days (tzOffset follows Date#getTimezoneOffset()).
const { parseTzOffset } = require('./helpers');

const MS_DAY = 86400000;
const RANGES = ['7d', '30d', '90d', '6m', '1y', 'all'];
const GRANULARITIES = ['auto', 'day', 'week', 'month'];
const MAX_BUCKETS = 400;

const dayIdx = (date, tz) => Math.floor((new Date(date).getTime() - tz * 60000) / MS_DAY);
const idxToInstant = (idx, tz) => new Date(idx * MS_DAY + tz * 60000); // start of local day as UTC instant
const idxToUTCDate = (idx) => new Date(idx * MS_DAY);
const ymd = (idx) => idxToUTCDate(idx).toISOString().slice(0, 10);

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const round1 = (v) => Math.round(v * 10) / 10;

// First local-day index of the range (null => all time, caller supplies the earliest record day)
const rangeStartIdx = (range, todayIdx) => {
  switch (range) {
    case '7d': return todayIdx - 6;
    case '30d': return todayIdx - 29;
    case '90d': return todayIdx - 89;
    case '6m':
    case '1y': {
      const months = range === '6m' ? 6 : 12;
      const t = idxToUTCDate(todayIdx);
      const y = t.getUTCFullYear();
      const m = t.getUTCMonth() - months;
      const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      return Math.floor(Date.UTC(y, m, Math.min(t.getUTCDate(), dim)) / MS_DAY);
    }
    default: return null;
  }
};

const weekStart = (idx) => idx - ((idx + 3) % 7); // Monday (epoch day 0 was a Thursday)
const monthStart = (idx) => {
  const t = idxToUTCDate(idx);
  return Math.floor(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1) / MS_DAY);
};
const nextMonthStart = (idx) => {
  const t = idxToUTCDate(idx);
  return Math.floor(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 1) / MS_DAY);
};

const bucketKeys = (startIdx, endIdx, gran) => {
  const keys = [];
  if (gran === 'day') for (let i = startIdx; i <= endIdx; i += 1) keys.push(i);
  else if (gran === 'week') for (let i = weekStart(startIdx); i <= endIdx; i += 7) keys.push(i);
  else for (let i = monthStart(startIdx); i <= endIdx; i = nextMonthStart(i)) keys.push(i);
  return keys;
};
const keyOf = (idx, gran) => (gran === 'day' ? idx : gran === 'week' ? weekStart(idx) : monthStart(idx));

const labelOf = (idx, gran, spanDays) => {
  const d = idxToUTCDate(idx);
  if (gran === 'month') return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
  if (gran === 'day' && spanDays <= 7) return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

// Choose bucket size: honour the request when it yields a sane number of buckets
const pickGranularity = (requested, spanDays) => {
  const auto = spanDays <= 31 ? 'day' : spanDays <= 100 ? 'week' : 'month';
  if (requested === 'auto' || !requested) return auto;
  const count = requested === 'day' ? spanDays : requested === 'week' ? Math.ceil(spanDays / 7) + 1 : Math.ceil(spanDays / 28) + 1;
  return count <= MAX_BUCKETS ? requested : auto;
};

const resolveWindow = ({ range, tzOffset, now, earliest }) => {
  const todayIdx = dayIdx(now, tzOffset);
  let startIdx = rangeStartIdx(range, todayIdx);
  if (startIdx === null) startIdx = earliest === null || earliest === undefined ? todayIdx : Math.min(dayIdx(earliest, tzOffset), todayIdx);
  return { todayIdx, startIdx, spanDays: todayIdx - startIdx + 1 };
};

// Workout / nutrition series for the chosen granularity (empty buckets are zero-filled, ascending order)
const buildWorkoutSeries = (workouts, w, gran, tz) => {
  const keys = bucketKeys(w.startIdx, w.todayIdx, gran);
  const map = new Map(keys.map((k) => [k, { day: labelOf(k, gran, w.spanDays), date: ymd(k), workouts: 0, calories: 0, duration: 0 }]));
  for (const x of workouts) {
    const b = map.get(keyOf(dayIdx(x.date, tz), gran));
    if (!b) continue;
    b.workouts += 1;
    b.calories += num(x.caloriesBurned);
    b.duration += num(x.duration);
  }
  return keys.map((k) => map.get(k));
};

// Nutrition: day buckets are exact daily totals; week/month buckets are the AVERAGE per logged day, so bars stay comparable
const buildNutritionSeries = (meals, w, gran, tz) => {
  const keys = bucketKeys(w.startIdx, w.todayIdx, gran);
  const map = new Map(keys.map((k) => [k, { day: labelOf(k, gran, w.spanDays), date: ymd(k), calories: 0, protein: 0, carbs: 0, fats: 0, days: new Set() }]));
  for (const m of meals) {
    const di = dayIdx(m.date, tz);
    const b = map.get(keyOf(di, gran));
    if (!b) continue;
    b.calories += num(m.calories);
    b.protein += num(m.protein);
    b.carbs += num(m.carbs);
    b.fats += num(m.fats);
    b.days.add(di);
  }
  return keys.map((k) => {
    const b = map.get(k);
    const n = Math.max(1, b.days.size);
    return {
      day: b.day, date: b.date,
      calories: Math.round(b.calories / n), protein: round1(b.protein / n), carbs: round1(b.carbs / n), fats: round1(b.fats / n),
      daysLogged: b.days.size,
    };
  });
};

const summarizeWorkouts = (workouts, spanDays, tz) => {
  const total = workouts.length;
  const completed = workouts.filter((x) => !Array.isArray(x.exercises) || x.exercises.every((e) => e.completed !== false)).length;
  const days = new Set(workouts.map((x) => dayIdx(x.date, tz)));
  const totalDuration = workouts.reduce((a, x) => a + num(x.duration), 0);
  return {
    total, completed,
    activeDays: days.size,
    perWeek: round1(total / Math.max(1, spanDays / 7)),
    totalDuration,
    avgDuration: total ? Math.round(totalDuration / total) : 0,
    totalCalories: Math.round(workouts.reduce((a, x) => a + num(x.caloriesBurned), 0)),
  };
};

const summarizeNutrition = (meals, tz) => {
  const days = new Set(meals.map((m) => dayIdx(m.date, tz)));
  const sum = (k) => meals.reduce((a, m) => a + num(m[k]), 0);
  const n = Math.max(1, days.size);
  const totalCalories = Math.round(sum('calories'));
  return {
    meals: meals.length, daysLogged: days.size,
    totalCalories,
    avgDailyCalories: days.size ? Math.round(totalCalories / n) : 0,
    protein: round1(sum('protein')), carbs: round1(sum('carbs')), fats: round1(sum('fats')),
    avgProtein: days.size ? round1(sum('protein') / n) : 0,
    avgCarbs: days.size ? round1(sum('carbs') / n) : 0,
    avgFats: days.size ? round1(sum('fats') / n) : 0,
  };
};

const MEASUREMENTS = ['chest', 'waist', 'hips', 'arms', 'thighs'];
const METRICS = [
  { key: 'benchPressMax', label: 'Bench press max', unit: 'kg', lowerIsBetter: false },
  { key: 'squatMax', label: 'Squat max', unit: 'kg', lowerIsBetter: false },
  { key: 'deadliftMax', label: 'Deadlift max', unit: 'kg', lowerIsBetter: false },
  { key: 'pullUpsCount', label: 'Pull-ups', unit: 'reps', lowerIsBetter: false },
  { key: 'runningTime5k', label: '5K time', unit: 'min', lowerIsBetter: true },
];

// A stored 0 means "not recorded" for measurements and performance metrics
const firstLast = (rows, pick) => {
  const vals = rows.map(pick).filter((v) => Number.isFinite(v) && v > 0);
  if (!vals.length) return null;
  return { first: vals[0], latest: vals[vals.length - 1], points: vals.length };
};

const buildProgress = (rows) => {
  const history = rows
    .filter((r) => r.date && !Number.isNaN(new Date(r.date).getTime()) && Number.isFinite(Number(r.weight)))
    .map((r) => ({
      date: new Date(r.date).toISOString(),
      weight: Number(r.weight),
      bodyMeasurements: Object.fromEntries(MEASUREMENTS.map((k) => [k, num(r.bodyMeasurements && r.bodyMeasurements[k])])),
      performanceMetrics: Object.fromEntries(METRICS.map((m) => [m.key, num(r.performanceMetrics && r.performanceMetrics[m.key])])),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const weights = history.length ? { first: history[0].weight, latest: history[history.length - 1].weight } : null;
  const measurementChanges = MEASUREMENTS.map((k) => {
    const fl = firstLast(history, (h) => h.bodyMeasurements[k]);
    return fl && fl.points > 1 ? { name: k, first: fl.first, latest: fl.latest, change: round1(fl.latest - fl.first) } : null;
  }).filter(Boolean);
  const performance = METRICS.map((m) => {
    const fl = firstLast(history, (h) => h.performanceMetrics[m.key]);
    if (!fl || fl.points < 2) return null;
    const change = round1(fl.latest - fl.first);
    return { ...m, first: fl.first, latest: fl.latest, change, improved: m.lowerIsBetter ? change < 0 : change > 0 };
  }).filter(Boolean);

  return {
    history,
    summary: {
      entries: history.length,
      startWeight: weights ? weights.first : null,
      latestWeight: weights ? weights.latest : null,
      weightChange: weights && history.length > 1 ? round1(weights.latest - weights.first) : null,
      measurementChanges,
      performance,
    },
  };
};

const countBy = (rows, key, extra) => {
  const map = new Map();
  for (const r of rows) {
    const name = r[key] || 'Other';
    const cur = map.get(name) || { name, value: 0, calories: 0 };
    cur.value += 1;
    if (extra) cur.calories += num(r[extra]);
    map.set(name, cur);
  }
  return [...map.values()].sort((a, b) => b.value - a.value);
};

module.exports = {
  RANGES, GRANULARITIES, MS_DAY, parseTzOffset,
  dayIdx, idxToInstant, resolveWindow, pickGranularity,
  buildWorkoutSeries, buildNutritionSeries, summarizeWorkouts, summarizeNutrition, buildProgress, countBy,
};
