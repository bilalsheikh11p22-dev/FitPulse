import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Search, 
  Trash2, 
  Clock, 
  Flame, 
  ChevronDown, 
  ChevronUp,
  User 
} from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, fmtDate } from '../../utils/normalize';

export default function AdminWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;

      const res = await api.get('/admin/workouts', { params });
      setWorkouts(toArray(res.data));
      setError('');
    } catch (err) {
      setWorkouts([]);
      setError(getErrorMessage(err, 'Could not load records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkouts();
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete workout "${title}"?`)) {
      try {
        await api.delete(`/admin/workouts/${id}`);
        setWorkouts((prev) => prev.filter((w) => w._id !== id));
      } catch (err) {
        window.alert(getErrorMessage(err));
      }
    }
  };

  const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Flexibility', 'Crossfit'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Dumbbell className="w-6 h-6 text-brand-400" />
          <span>System-Wide Workout Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor, audit, and moderate workout routines across all registered users.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by routine title..."
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
          <span className="text-xs text-slate-400 font-semibold mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                category === cat
                  ? 'bg-red-500 text-white font-bold'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Workouts Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading platform workouts...</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          No workouts found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((w) => {
            const isExpanded = expandedId === w._id;
            return (
              <div
                key={w._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                          {w.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {fmtDate(w.date)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {w.title}
                      </h3>
                      <p className="text-xs text-brand-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Athlete: {w.user?.name || 'Unknown'} (@{w.user?.username})</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(w._id, w.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Moderate / Delete Workout"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{w.duration} mins</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{w.caloriesBurned} kcal</span>
                    </span>
                  </div>
                </div>

                {/* Exercises dropdown */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : w._id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    <span>View {w.exercises?.length || 0} Exercises</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && w.exercises && (
                    <div className="mt-2.5 space-y-1.5">
                      {w.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                        >
                          <span className="text-white font-medium">{ex.name}</span>
                          <span className="text-slate-400">
                            {ex.sets} sets × {ex.reps} reps • {ex.weight}kg
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
