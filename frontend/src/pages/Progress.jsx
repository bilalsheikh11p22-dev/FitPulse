import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Scale, 
  Plus, 
  Trash2, 
  Award, 
  Activity, 
  Flame, 
  Ruler, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../api/api';
import { toArray, toNumber, toDate, getErrorMessage, fmtDate } from '../utils/normalize';
import useFlash from '../utils/useFlash';
import { useAuth } from '../context/AuthContext';
import ProgressModal from '../components/ProgressModal';

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, flash] = useFlash();
  const { refreshUser } = useAuth();

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress');
      setLogs(toArray(res.data));
      setError('');
    } catch (err) {
      setLogs([]);
      setError(getErrorMessage(err, 'Could not load progress history.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSaveProgress = async (formData) => {
    await api.post('/progress', formData);
    await fetchProgress(); // re-sorted by date from the server
    refreshUser(); // the backend also updates the profile weight
    flash('Check-in saved.');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this check-in entry?')) {
      try {
        await api.delete(`/progress/${id}`);
        setLogs((prev) => prev.filter((l) => l._id !== id));
        setError('');
        refreshUser(); // weight reverts to the latest remaining check-in
        flash('Check-in deleted.');
      } catch (err) {
        setError(getErrorMessage(err, 'Could not delete the entry.'));
      }
    }
  };

  // Format data for chart
  // Only entries with a valid date and a numeric weight are charted, oldest first
  const chartData = [...logs]
    .filter((log) => toDate(log.date) && Number.isFinite(toNumber(log.weight, NaN)))
    .sort((a, b) => toDate(a.date) - toDate(b.date))
    .map((log) => ({
    date: fmtDate(log.date, { month: 'short', day: 'numeric' }),
    weight: toNumber(log.weight, null),
    waist: toNumber(log.bodyMeasurements?.waist, null),
    bench: toNumber(log.performanceMetrics?.benchPressMax, null),
  }));

  const latest = [...logs].filter((l) => toDate(l.date)).sort((a, b) => toDate(a.date) - toDate(b.date)).pop() || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-cyan-400" />
            <span>Progress Tracking & Body Measurements</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track body weight trajectories, muscle circumferences, and lifting personal records.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Check-in</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* PR Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <p className="text-xs text-slate-400">Current Weight</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {latest?.weight || '--'} <span className="text-xs font-normal text-slate-400">kg</span>
          </h3>
          <p className="text-[11px] text-cyan-400 mt-1">Latest check-in</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <p className="text-xs text-slate-400">Bench Press Max</p>
          <h3 className="text-2xl font-bold text-brand-400 mt-1">
            {latest?.performanceMetrics?.benchPressMax || '--'} <span className="text-xs font-normal text-slate-400">kg</span>
          </h3>
          <p className="text-[11px] text-brand-400 mt-1">1RM Strength</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <p className="text-xs text-slate-400">Deadlift Max</p>
          <h3 className="text-2xl font-bold text-purple-400 mt-1">
            {latest?.performanceMetrics?.deadliftMax || '--'} <span className="text-xs font-normal text-slate-400">kg</span>
          </h3>
          <p className="text-[11px] text-purple-400 mt-1">1RM Strength</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <p className="text-xs text-slate-400">5K Running Time</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">
            {latest?.performanceMetrics?.runningTime5k || '--'} <span className="text-xs font-normal text-slate-400">mins</span>
          </h3>
          <p className="text-[11px] text-amber-400 mt-1">Cardio Pace</p>
        </div>
      </div>

      {/* Weight History Line Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Body Weight Trajectory (kg)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {logs.length} Data Points Logged
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No check-ins recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* History Check-ins Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-400" />
          <span>Biometric & Circumference History</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Date</th>
                <th className="px-4 py-3">Weight</th>
                <th className="px-4 py-3">Chest</th>
                <th className="px-4 py-3">Waist</th>
                <th className="px-4 py-3">Arms</th>
                <th className="px-4 py-3">Bench Press</th>
                <th className="px-4 py-3">Squats</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                    {fmtDate(log.date)}
                  </td>
                  <td className="px-4 py-3 text-cyan-400 font-bold whitespace-nowrap">
                    {log.weight} kg
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.bodyMeasurements?.chest ? `${log.bodyMeasurements.chest} cm` : '--'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.bodyMeasurements?.waist ? `${log.bodyMeasurements.waist} cm` : '--'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.bodyMeasurements?.arms ? `${log.bodyMeasurements.arms} cm` : '--'}
                  </td>
                  <td className="px-4 py-3 text-brand-400 font-semibold">
                    {log.performanceMetrics?.benchPressMax ? `${log.performanceMetrics.benchPressMax} kg` : '--'}
                  </td>
                  <td className="px-4 py-3 text-purple-400 font-semibold">
                    {log.performanceMetrics?.squatMax ? `${log.performanceMetrics.squatMax} kg` : '--'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                    {log.notes || '--'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10 transition"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProgress}
      />
    </div>
  );
}
