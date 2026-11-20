import React, { useState, useEffect } from 'react';
import { Dumbbell, Trash2, Clock, Flame, ChevronDown, ChevronUp, User } from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, fmtDate } from '../../utils/normalize';
import {
  PageHeader,
  Card,
  Badge,
  Alert,
  Spinner,
  EmptyState,
  SearchBar,
  FilterTabs,
  iconBtn,
} from '../../components/admin/ui';

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
    <div>
      <PageHeader
        icon={Dumbbell}
        title="Workouts"
        description="Review and moderate workout routines logged by every user on the platform."
      />

      <div className="space-y-4">
        <Card>
          <div className="space-y-4">
            <SearchBar value={search} onChange={setSearch} onSubmit={handleSearchSubmit} placeholder="Search by routine title" />
            <FilterTabs label="Category" options={categories} value={category} onChange={setCategory} />
          </div>
        </Card>

        {error && <Alert>{error}</Alert>}

        {loading ? (
          <Spinner label="Loading workouts…" />
        ) : workouts.length === 0 ? (
          <Card>
            <EmptyState icon={Dumbbell} title="No workouts found" description="Try a different search or category." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {workouts.map((w) => {
              const isExpanded = expandedId === w._id;
              return (
                <article key={w._id} className="rounded-xl bg-slate-900 border border-slate-800">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge tone="brand">{w.category}</Badge>
                          <span className="text-xs text-slate-500">{fmtDate(w.date)}</span>
                        </div>
                        <h3 className="text-base font-semibold text-white leading-snug">{w.title}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate">
                            {w.user?.name || 'Unknown'} <span className="text-slate-500">@{w.user?.username}</span>
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(w._id, w.title)}
                        className={`${iconBtn} hover:!text-red-400 hover:!bg-red-500/10`}
                        title="Delete workout"
                        aria-label={`Delete ${w.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-5 text-sm text-slate-300">
                      <span className="flex items-center gap-1.5 tabular-nums">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        {w.duration} min
                      </span>
                      <span className="flex items-center gap-1.5 tabular-nums">
                        <Flame className="w-4 h-4 text-amber-400" />
                        {w.caloriesBurned} kcal
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : w._id)}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors rounded-b-xl"
                    >
                      <span>{w.exercises?.length || 0} exercises</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && w.exercises && (
                      <ul className="px-5 pb-4 space-y-1.5">
                        {w.exercises.map((ex, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between gap-3 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
                          >
                            <span className="text-slate-100 font-medium truncate">{ex.name}</span>
                            <span className="text-slate-400 whitespace-nowrap tabular-nums">
                              {ex.sets} × {ex.reps} · {ex.weight} kg
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
