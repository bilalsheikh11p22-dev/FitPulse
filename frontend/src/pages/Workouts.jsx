import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Search, 
  Filter, 
  Flame, 
  Clock, 
  Trash2, 
  Edit, 
  ChevronDown, 
  ChevronUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import api from '../api/api';
import { toArray, getErrorMessage } from '../utils/normalize';
import useFlash from '../utils/useFlash';
import { announceNotifications } from '../utils/notificationEvents';
import WorkoutModal from '../components/WorkoutModal';

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const [success, flash] = useFlash();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      if (selectedTag) params.tag = selectedTag;

      const res = await api.get('/workouts', { params });
      setWorkouts(toArray(res.data));
      setError('');
    } catch (err) {
      setWorkouts([]);
      setError(getErrorMessage(err, 'Could not load workouts.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [category, selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkouts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout routine?')) {
      try {
        await api.delete(`/workouts/${id}`);
        setWorkouts((prev) => prev.filter((w) => w._id !== id));
        setError('');
        flash('Workout deleted.');
      } catch (err) {
        setError(getErrorMessage(err, 'Could not delete the workout.'));
      }
    }
  };

  const handleSaveWorkout = async (data) => {
    // errors propagate to the modal, which stays open and shows the message
    const wasEditing = Boolean(editingWorkout);
    if (editingWorkout) {
      await api.put(`/workouts/${editingWorkout._id}`, data);
    } else {
      await api.post('/workouts', data);
    }
    setEditingWorkout(null);
    await fetchWorkouts(); // keeps ordering and active filters correct
    flash(wasEditing ? 'Workout updated.' : 'Workout saved.');
    if (!wasEditing) announceNotifications(); // a new workout creates a notification
  };

  const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Flexibility', 'Crossfit'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Dumbbell className="w-6 h-6 text-brand-400" />
            <span>Workout Routines & Exercises</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build and manage comprehensive strength, hypertrophy, and cardio training regimens.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingWorkout(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition shadow-lg shadow-brand-500/25 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Workout</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by routine name, notes, or specific exercise (e.g. Squat, Bench)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                category === cat
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag('')}
              className="ml-auto text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Clear Tag ({selectedTag})</span>
            </button>
          )}
        </div>
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

      {/* Workouts Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading workouts...</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Workouts Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't logged any routines matching the selected criteria. Click below to add one!
          </p>
          <button
            onClick={() => {
              setEditingWorkout(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition"
          >
            Create Workout
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((workout) => {
            const isExpanded = expandedId === workout._id;
            return (
              <div
                key={workout._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition shadow-lg flex flex-col justify-between space-y-4"
              >
                {/* Workout Card Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {workout.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(workout.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {workout.title}
                      </h3>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingWorkout(workout);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit Workout"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(workout._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                        title="Delete Workout"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{workout.duration} mins</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{workout.caloriesBurned} kcal</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Activity className="w-3.5 h-3.5 text-brand-400" />
                      <span>{workout.exercises?.length || 0} exercises</span>
                    </span>
                  </div>

                  {workout.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      "{workout.notes}"
                    </p>
                  )}

                  {/* Tags */}
                  {workout.tags && workout.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {workout.tags.map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exercises Dropdown Table */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : workout._id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-brand-400 transition"
                  >
                    <span>Exercise List ({workout.exercises?.length || 0})</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && workout.exercises && (
                    <div className="mt-3 space-y-1.5">
                      {workout.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-slate-900 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-white">{ex.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">{ex.sets} sets × {ex.reps} reps</span>
                            {ex.weight > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20">
                                {ex.weight} kg
                              </span>
                            )}
                          </div>
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

      {/* Workout Modal */}
      <WorkoutModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWorkout(null);
        }}
        onSave={handleSaveWorkout}
        initialData={editingWorkout}
      />
    </div>
  );
}
