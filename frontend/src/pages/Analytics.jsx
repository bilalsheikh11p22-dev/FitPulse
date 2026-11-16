import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Activity, 
  Apple, 
  Dumbbell 
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/api';
import { toArray, toNumber, toDate, fmt, getErrorMessage, prefersReducedMotion } from '../utils/normalize';

const RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last 1 year' },
  { value: 'all', label: 'All time' },
];
const VIEWS = [
  { value: 'auto', label: 'Auto' },
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];
const GRAN_LABEL = { day: 'Daily', week: 'Weekly', month: 'Monthly' };
const MEASURE_COLORS = { chest: '#ff6b2c', waist: '#06b6d4', hips: '#a855f7', arms: '#f59e0b', thighs: '#ec4899' };
const LIFT_COLORS = { benchPressMax: '#ff6b2c', squatMax: '#06b6d4', deadliftMax: '#a855f7' };
const LIFT_LABELS = { benchPressMax: 'Bench (kg)', squatMax: 'Squat (kg)', deadliftMax: 'Deadlift (kg)' };

const tooltipStyle = {
  backgroundColor: '#0f172a',
  borderColor: '#334155',
  borderRadius: '0.75rem',
  color: '#f8fafc',
  fontSize: '12px',
};

// Turn any API payload into numbers/strings the charts can safely draw. Nothing is invented.
const normalizeCharts = (d) => {
  const src = d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  const series = (rows, keys) =>
    toArray(rows)
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({ day: String(r.day ?? ''), date: String(r.date ?? ''), ...Object.fromEntries(keys.map((k) => [k, toNumber(r[k])])) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  const n = (o, keys) => Object.fromEntries(keys.map((k) => [k, toNumber(o?.[k])]));
  const sw = src.summary?.workouts;
  const sn = src.summary?.nutrition;
  const sp = src.summary?.progress;
  const history = toArray(src.weightHistory)
    .map((h) => ({ ...h, d: toDate(h?.date), weight: toNumber(h?.weight, NaN) }))
    .filter((h) => h.d && Number.isFinite(h.weight))
    .sort((a, b) => a.d - b.d)
    .map((h) => ({
      label: h.d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: h.weight,
      ...Object.fromEntries(Object.keys(MEASURE_COLORS).map((k) => [k, toNumber(h.bodyMeasurements?.[k]) || null])),
      ...Object.fromEntries(Object.keys(LIFT_COLORS).map((k) => [k, toNumber(h.performanceMetrics?.[k]) || null])),
    }));
  return {
    granularity: String(src.granularity || 'day'),
    workoutTrends: series(src.workoutTrends, ['workouts', 'calories', 'duration']),
    nutritionTrends: series(src.nutritionTrends, ['calories', 'protein', 'carbs', 'fats']),
    categoryBreakdown: toArray(src.categoryBreakdown).map((c) => ({ name: String(c?.name ?? 'Other'), value: toNumber(c?.value) })),
    mealDistribution: toArray(src.mealDistribution).map((c) => ({ name: String(c?.name ?? 'Other'), value: toNumber(c?.value), calories: toNumber(c?.calories) })),
    weightHistory: history,
    summary: {
      workouts: n(sw, ['total', 'completed', 'activeDays', 'perWeek', 'totalDuration', 'avgDuration', 'totalCalories']),
      nutrition: n(sn, ['meals', 'daysLogged', 'totalCalories', 'avgDailyCalories', 'protein', 'carbs', 'fats']),
      progress: {
        entries: toNumber(sp?.entries),
        startWeight: sp?.startWeight == null ? null : toNumber(sp.startWeight, null),
        latestWeight: sp?.latestWeight == null ? null : toNumber(sp.latestWeight, null),
        weightChange: sp?.weightChange == null ? null : toNumber(sp.weightChange, null),
        measurementChanges: toArray(sp?.measurementChanges).map((m) => ({ name: String(m?.name ?? ''), change: toNumber(m?.change), latest: toNumber(m?.latest) })),
        performance: toArray(sp?.performance).map((m) => ({
          key: String(m?.key ?? ''), label: String(m?.label ?? ''), unit: String(m?.unit ?? ''),
          first: toNumber(m?.first), latest: toNumber(m?.latest), change: toNumber(m?.change), improved: Boolean(m?.improved),
        })),
      },
    },
  };
};

function StatTile({ label, value, hint }) {
  return (
    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="font-bold text-white text-sm">{value}</p>
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState('7d');
  const [view, setView] = useState('auto');
  // result of the latest finished request: { key, charts, error }
  const [result, setResult] = useState({ key: '', charts: null, error: '' });
  const key = `${range}|${view}`;
  const reduceMotion = prefersReducedMotion();

  useEffect(() => {
    let cancelled = false;
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/charts', {
          params: { range, granularity: view, tzOffset: new Date().getTimezoneOffset() },
        });
        if (cancelled) return;
        if (!res.data || typeof res.data !== 'object' || Array.isArray(res.data) || !res.data.summary) {
          setResult({ key, charts: null, error: 'The server returned an unexpected analytics response.' });
          return;
        }
        setResult({ key, charts: normalizeCharts(res.data), error: '' });
      } catch (err) {
        if (!cancelled) setResult({ key, charts: null, error: getErrorMessage(err, 'Could not load analytics.') });
      }
    };
    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [range, view, key]);

  const charts = result.charts;
  const error = result.error;
  const loading = result.key !== key; // a request for the current filters is still running

  if (loading && !charts && !error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rangeLabel = RANGES.find((r) => r.value === range)?.label || '';
  const gran = charts?.granularity || 'day';
  const sw = charts?.summary.workouts;
  const sn = charts?.summary.nutrition;
  const sp = charts?.summary.progress;

  const categoryColors = ['#ff6b2c', '#06b6d4', '#a855f7', '#f59e0b', '#ec4899', '#3b82f6'];

  const macroPieData = [
    { name: 'Protein (g)', value: Math.round(sn?.protein || 0), color: '#ef4444' },
    { name: 'Carbs (g)', value: Math.round(sn?.carbs || 0), color: '#06b6d4' },
    { name: 'Fats (g)', value: Math.round(sn?.fats || 0), color: '#eab308' },
  ];
  const hasMacros = macroPieData.some((m) => m.value > 0);
  const hasWorkoutData = (charts?.workoutTrends || []).some((d) => d.workouts > 0 || d.calories > 0);
  const hasCalorieData = (charts?.nutritionTrends || []).some((d) => d.calories > 0);
  const hasWeight = (charts?.weightHistory || []).length > 0;
  const measureKeys = Object.keys(MEASURE_COLORS).filter((k) => (charts?.weightHistory || []).some((h) => h[k]));
  const liftKeys = Object.keys(LIFT_COLORS).filter((k) => (charts?.weightHistory || []).some((h) => h[k]));
  const noAnimation = !reduceMotion ? {} : { isAnimationActive: false };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>Data Visualization & Fitness Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            In-depth algorithmic analysis of training frequency, caloric trends, and macro ratios.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="sr-only" htmlFor="analytics-range">Date range</label>
          <select
            id="analytics-range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="analytics-view">Chart grouping</label>
          <select
            id="analytics-view"
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            {VIEWS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {charts && (
      <div className={`space-y-8 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
      {/* Summary: workouts, nutrition, progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-brand-400" />
            <span>Workout Summary</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Total workouts" value={fmt(sw.total)} />
            <StatTile label="Completed" value={fmt(sw.completed)} hint="all exercises done" />
            <StatTile label="Per week" value={fmt(sw.perWeek, 1)} hint={`${fmt(sw.activeDays)} active days`} />
            <StatTile label="Total time" value={`${fmt(sw.totalDuration)} min`} hint={`avg ${fmt(sw.avgDuration)} min`} />
            <StatTile label="Calories burned" value={`${fmt(sw.totalCalories)} kcal`} />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Apple className="w-5 h-5 text-amber-400" />
            <span>Nutrition Summary</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Total calories" value={`${fmt(sn.totalCalories)} kcal`} hint={`${fmt(sn.meals)} meals`} />
            <StatTile label="Avg per logged day" value={`${fmt(sn.avgDailyCalories)} kcal`} hint={`${fmt(sn.daysLogged)} days logged`} />
            <StatTile label="Protein" value={`${fmt(sn.protein, 1)} g`} />
            <StatTile label="Carbs" value={`${fmt(sn.carbs, 1)} g`} />
            <StatTile label="Fats" value={`${fmt(sn.fats, 1)} g`} />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Progress Summary</span>
          </h3>
          {sp.entries === 0 ? (
            <p className="text-xs text-slate-400 italic">No check-ins recorded in this period.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Check-ins" value={fmt(sp.entries)} />
              <StatTile label="Latest weight" value={sp.latestWeight === null ? '--' : `${fmt(sp.latestWeight, 1)} kg`} />
              <StatTile
                label="Weight change"
                value={sp.weightChange === null ? '--' : `${sp.weightChange > 0 ? '+' : ''}${fmt(sp.weightChange, 1)} kg`}
                hint={sp.weightChange === null ? 'needs 2+ check-ins' : `from ${fmt(sp.startWeight, 1)} kg`}
              />
              {sp.performance.slice(0, 3).map((p) => (
                <StatTile
                  key={p.key}
                  label={p.label}
                  value={`${p.change > 0 ? '+' : ''}${fmt(p.change, 1)} ${p.unit}`}
                  hint={p.improved ? 'improved' : p.change === 0 ? 'no change' : 'declined'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid 1: Workout Frequency Bar Chart & Macro Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Frequency */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">
                Workout Activity — {rangeLabel}
              </h3>
            </div>
            <span className="text-xs text-brand-400 font-semibold bg-brand-500/10 px-2.5 py-1 rounded border border-brand-500/20">
              {GRAN_LABEL[gran] || 'Daily'} Frequency
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            {!hasWorkoutData ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No data recorded in this period yet.
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.workoutTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar {...noAnimation} dataKey="workouts" name="Workouts Count" fill="#ff6b2c" radius={[4, 4, 0, 0]} />
                <Bar {...noAnimation} dataKey="calories" name="Calories Burned (kcal)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Macro Distribution Donut */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Macronutrient Split</h3>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {!hasMacros ? (
              <p className="text-xs text-slate-400 italic">No meals logged in this period.</p>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  {...noAnimation}
                  data={macroPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {macroPieData.map((m) => (
              <div key={m.name} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ backgroundColor: m.color }} />
                <p className="text-[10px] text-slate-400">{m.name.split(' ')[0]}</p>
                <p className="font-bold text-white">{m.value}g</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 2: Daily Nutrition Caloric Trend Area Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Caloric Intake Trend — {rangeLabel}
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
            Energy Balance
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          {!hasCalorieData ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No data recorded in this period yet.
              </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts?.nutritionTrends || []}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Area
                {...noAnimation}
                type="monotone"
                dataKey="calories"
                name={gran === 'day' ? 'Calories Consumed (kcal)' : 'Avg calories per logged day (kcal)'}
                stroke="#f59e0b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCal)"
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid 3: Category Breakdown Cards */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span>Training Focus Breakdown by Category</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {charts?.categoryBreakdown && charts.categoryBreakdown.length > 0 ? (
            charts.categoryBreakdown.map((cat, i) => (
              <div
                key={cat.name}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1"
              >
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: categoryColors[i % categoryColors.length] }} />
                <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                <p className="text-xl font-extrabold text-brand-400">{cat.value} Sessions</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No category data yet.</p>
          )}
        </div>
      </div>

      {/* Meal distribution */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Apple className="w-5 h-5 text-amber-400" />
          <span>Meal Category Distribution</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {charts.mealDistribution.length > 0 ? (
            charts.mealDistribution.map((m, i) => (
              <div key={m.name} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: categoryColors[i % categoryColors.length] }} />
                <h4 className="text-sm font-bold text-white">{m.name}</h4>
                <p className="text-xl font-extrabold text-amber-400">{m.value} Meals</p>
                <p className="text-[10px] text-slate-400">{fmt(m.calories)} kcal</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No meals logged in this period.</p>
          )}
        </div>
      </div>

      {/* Progress analytics: weight, measurements, performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Weight History</span>
          </h3>
          <div className="h-56 w-full">
            {!hasWeight ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No check-ins in this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.weightHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={['dataMin - 1', 'dataMax + 1']} allowDecimals />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line {...noAnimation} type="monotone" dataKey="weight" name="Weight (kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Body Measurements (cm)</span>
          </h3>
          <div className="h-56 w-full">
            {measureKeys.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No measurements recorded in this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.weightHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {measureKeys.map((k) => (
                    <Line {...noAnimation} key={k} type="monotone" dataKey={k} name={k} stroke={MEASURE_COLORS[k]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-purple-400" />
            <span>Exercise Performance</span>
          </h3>
          <div className="h-56 w-full">
            {liftKeys.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No lift records in this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.weightHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {liftKeys.map((k) => (
                    <Line {...noAnimation} key={k} type="monotone" dataKey={k} name={LIFT_LABELS[k]} stroke={LIFT_COLORS[k]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          {sp.performance.length > 0 && (
            <ul className="space-y-1 text-[11px] text-slate-300">
              {sp.performance.map((p) => (
                <li key={p.key} className="flex items-center justify-between">
                  <span>{p.label}</span>
                  <span className={p.improved ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    {fmt(p.first, 1)} → {fmt(p.latest, 1)} {p.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
      )}
    </div>
  );
}
