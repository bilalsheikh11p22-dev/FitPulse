import React, { useState, useEffect } from 'react';
import { Utensils, Search, Trash2, User } from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, fmtDate } from '../../utils/normalize';

export default function AdminNutrition() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState('All');
  const [search, setSearch] = useState('');

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      const params = {};
      if (mealType !== 'All') params.mealType = mealType;
      if (search) params.search = search;

      const res = await api.get('/admin/nutrition', { params });
      setLogs(toArray(res.data));
      setError('');
    } catch (err) {
      setLogs([]);
      setError(getErrorMessage(err, 'Could not load records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, [mealType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNutrition();
  };

  const handleDelete = async (id, foodName) => {
    if (window.confirm(`Delete food entry "${foodName}"?`)) {
      try {
        await api.delete(`/admin/nutrition/${id}`);
        setLogs((prev) => prev.filter((l) => l._id !== id));
      } catch (err) {
        window.alert(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Utensils className="w-6 h-6 text-emerald-400" />
          <span>System-Wide Nutrition Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review, moderate, and monitor dietary consumption logs across all users.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by food name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((m) => (
            <button
              key={m}
              onClick={() => setMealType(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                mealType === m
                  ? 'bg-red-500 text-white font-bold'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Nutrition Grid */}
      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading nutrition logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          No nutrition logs found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map((log) => (
            <div
              key={log._id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {log.mealType} • {fmtDate(log.date)}
                    </span>
                    <h3 className="text-sm font-bold text-white">{log.foodName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-brand-400" />
                      <span>{log.user?.name || 'Athlete'} (@{log.user?.username})</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(log._id, log.foodName)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Portion: {log.quantity} {log.unit}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold">
                    P: {log.protein}g
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold">
                    C: {log.carbs}g
                  </span>
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-semibold">
                    F: {log.fats}g
                  </span>
                </div>
                <span className="font-bold text-amber-400">{log.calories} kcal</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
