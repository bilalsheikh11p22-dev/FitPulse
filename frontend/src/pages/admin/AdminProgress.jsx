import React, { useState, useEffect } from 'react';
import { Scale, Trash2 } from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, fmtDate } from '../../utils/normalize';

export default function AdminProgress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/progress');
      setLogs(toArray(res.data));
      setError('');
    } catch (err) {
      setLogs([]);
      setError(getErrorMessage(err, 'Could not load progress records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this progress check-in?')) return;
    try {
      await api.delete(`/admin/progress/${id}`);
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      window.alert(getErrorMessage(err, 'Failed to delete progress record.'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Scale className="w-6 h-6 text-cyan-400" />
          <span>User Biometric & Progress Monitoring</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review weight trajectories, body circumferences, and 1RM personal records across all platform athletes.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Progress Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading progress records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No progress entries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Athlete</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3">Waist</th>
                  <th className="px-4 py-3">Bench Press</th>
                  <th className="px-4 py-3">Squats</th>
                  <th className="px-4 py-3">Deadlift</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-white">
                      {log.user?.name || 'Athlete'}
                      <span className="block text-[10px] text-slate-500 font-normal">@{log.user?.username}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {fmtDate(log.date)}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-bold">{log.weight} kg</td>
                    <td className="px-4 py-3 text-slate-300">
                      {log.bodyMeasurements?.waist ? `${log.bodyMeasurements.waist} cm` : '--'}
                    </td>
                    <td className="px-4 py-3 text-brand-400 font-semibold">
                      {log.performanceMetrics?.benchPressMax ? `${log.performanceMetrics.benchPressMax} kg` : '--'}
                    </td>
                    <td className="px-4 py-3 text-purple-400 font-semibold">
                      {log.performanceMetrics?.squatMax ? `${log.performanceMetrics.squatMax} kg` : '--'}
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">
                      {log.performanceMetrics?.deadliftMax ? `${log.performanceMetrics.deadliftMax} kg` : '--'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                      {log.notes || '--'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(log._id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete check-in"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
