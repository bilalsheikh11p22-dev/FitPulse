import React, { useState } from 'react';
import { getErrorMessage } from '../utils/normalize';
import { X, Plus, Trash2, Dumbbell } from 'lucide-react';
import confetti from 'canvas-confetti';

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// Returns an error message or null
const validateWorkout = (f) => {
  if (!String(f.title || '').trim()) return 'Please enter a workout title.';
  if (!(num(f.duration, NaN) > 0)) return 'Duration must be greater than 0 minutes.';
  if (!(num(f.caloriesBurned, NaN) >= 0)) return 'Calories cannot be negative.';
  const exercises = Array.isArray(f.exercises) ? f.exercises : [];
  if (exercises.some((e) => !String(e.name || '').trim())) return 'Every exercise needs a name (or remove the empty row).';
  if (exercises.some((e) => num(e.sets, NaN) < 0 || num(e.reps, NaN) < 0 || num(e.weight, NaN) < 0)) return 'Sets, reps and weight cannot be negative.';
  return null;
};

// All numeric fields are sent as real numbers
const buildWorkoutPayload = (f) => ({
  ...f,
  title: String(f.title).trim(),
  duration: num(f.duration),
  caloriesBurned: num(f.caloriesBurned),
  exercises: (f.exercises || []).map((e) => ({
    ...e,
    name: String(e.name).trim(),
    sets: num(e.sets),
    reps: num(e.reps),
    weight: num(e.weight),
  })),
});

export default function WorkoutModal({ isOpen, onClose, onSave, initialData }) {
  if (!isOpen) return null;
  return <WorkoutModalForm onClose={onClose} onSave={onSave} initialData={initialData} />;
}

function WorkoutModalForm({ onClose, onSave, initialData }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState(
    initialData
      ? {
          title: initialData.title || '',
          category: initialData.category || 'Strength',
          duration: initialData.duration ?? 45,
          caloriesBurned: initialData.caloriesBurned ?? 0,
          tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
          notes: initialData.notes || '',
          date: initialData.date,
          exercises:
            Array.isArray(initialData.exercises) && initialData.exercises.length > 0
              ? initialData.exercises.map((ex) => ({ name: ex.name || '', sets: ex.sets ?? 3, reps: ex.reps ?? 10, weight: ex.weight ?? 0, notes: ex.notes || '' }))
              : [{ name: '', sets: 3, reps: 10, weight: 0, notes: '' }],
        }
      : {
      title: '',
      category: 'Strength',
      duration: 45,
      caloriesBurned: 320,
      tags: 'Chest, Triceps',
      notes: '',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 75, notes: '' },
      ],
    }
  );

  const handleAddExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { name: '', sets: 3, reps: 10, weight: 20, notes: '' },
      ],
    }));
  };

  const handleRemoveExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index),
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.exercises];
      updated[index] = {
        ...updated[index],
        [field]: field === 'sets' || field === 'reps' || field === 'weight' ? Number(value) : value,
      };
      return { ...prev, exercises: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const problem = validateWorkout(formData);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(buildWorkoutPayload(formData));
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {initialData ? 'Edit Workout Routine' : 'Log New Workout Routine'}
            </h3>
            <p className="text-xs text-slate-400">
              Record exercises, sets, repetitions, and weights used.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Workout Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Upper Body Hypertrophy or Leg Power"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="HIIT">HIIT</option>
                <option value="Yoga">Yoga</option>
                <option value="Flexibility">Flexibility</option>
                <option value="Crossfit">Crossfit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                min="5"
                max="360"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Est. Calories (kcal)
              </label>
              <input
                type="number"
                min="10"
                value={formData.caloriesBurned}
                onChange={(e) => setFormData({ ...formData, caloriesBurned: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. Chest, Triceps, Hypertrophy, Heavy"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Exercises dynamic table */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                Exercises & Sets
              </label>
              <button
                type="button"
                onClick={handleAddExercise}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-400 text-xs font-semibold hover:bg-brand-500/30 transition border border-brand-500/30"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Exercise
              </button>
            </div>

            <div className="space-y-2">
              {formData.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="Exercise Name (e.g. Squat)"
                    value={ex.name}
                    onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                    className="flex-1 w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Sets</span>
                      <input
                        type="number"
                        min="1"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                        className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs text-center"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Reps</span>
                      <input
                        type="number"
                        min="1"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                        className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs text-center"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Kg</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={ex.weight}
                        onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)}
                        className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs text-center"
                      />
                    </div>

                    {formData.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes / Intensity Observations
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Great energy today, rested 90 seconds between compound sets."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {error && (
            <p role="alert" className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition shadow-lg shadow-brand-500/25 disabled:opacity-60"
            >
              {initialData ? 'Update Workout' : 'Save Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
