import React, { useState, useEffect } from 'react';
import { Layers, Plus, Pencil, Trash2, Dumbbell, X, Power, ListChecks } from 'lucide-react';
import api from '../../api/api';
import { getErrorMessage } from '../../utils/normalize';
import useFlash from '../../utils/useFlash';
import { normalizeCategories } from '../../utils/useWorkoutCategories';

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500';
const labelCls = 'block text-xs font-semibold text-slate-300 mb-1';

// Modal shell (opens near the top of the screen, below the navbar)
function FormModal({ title, subtitle, onClose, onSubmit, submitLabel, children }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const handle = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 !m-0 flex items-start justify-center px-4 pt-20 pb-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-white pr-8">{title}</h3>
        <p className="text-xs text-slate-400 mb-5">{subtitle}</p>
        <form onSubmit={handle} className="space-y-4">
          {children}
          {error && (
            <p role="alert" className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition disabled:opacity-60">
              {saving ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryForm({ category, onClose, onSave }) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const submit = async () => {
    if (name.trim().length < 2) throw new Error('Category name must be at least 2 characters.');
    await onSave({ name: name.trim(), description: description.trim() });
  };
  return (
    <FormModal
      title={category ? 'Edit Category' : 'New Workout Category'}
      subtitle={category ? 'Renaming also updates every workout that uses it.' : 'Users can pick it when they log a workout.'}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={category ? 'Save Changes' : 'Create Category'}
    >
      <div>
        <label className={labelCls}>Category Name *</label>
        <input className={inputCls} value={name} maxLength={40} required placeholder="e.g. Pilates" onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <input className={inputCls} value={description} maxLength={300} placeholder="Optional" onChange={(e) => setDescription(e.target.value)} />
      </div>
    </FormModal>
  );
}

function ExerciseForm({ exercise, categoryName, onClose, onSave }) {
  const [f, setF] = useState({
    name: exercise?.name || '',
    muscleGroup: exercise?.muscleGroup || '',
    equipment: exercise?.equipment || '',
    sets: exercise?.sets ?? 3,
    reps: exercise?.reps ?? 10,
    weight: exercise?.weight ?? 0,
    description: exercise?.description || '',
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const submit = async () => {
    if (!f.name.trim()) throw new Error('Exercise name is required.');
    for (const k of ['sets', 'reps', 'weight']) {
      if (f[k] === '' || !Number.isFinite(Number(f[k])) || Number(f[k]) < 0) throw new Error(`${k[0].toUpperCase()}${k.slice(1)} must be 0 or more.`);
    }
    await onSave({
      name: f.name.trim(),
      muscleGroup: f.muscleGroup.trim(),
      equipment: f.equipment.trim(),
      description: f.description.trim(),
      sets: Number(f.sets),
      reps: Number(f.reps),
      weight: Number(f.weight),
    });
  };
  return (
    <FormModal
      title={exercise ? 'Edit Exercise' : 'Add Exercise'}
      subtitle={`Category: ${categoryName}. Users can pick it in the workout form.`}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={exercise ? 'Save Changes' : 'Add Exercise'}
    >
      <div>
        <label className={labelCls}>Exercise Name *</label>
        <input className={inputCls} value={f.name} maxLength={80} required placeholder="e.g. Barbell Squat" onChange={set('name')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Muscle Group</label>
          <input className={inputCls} value={f.muscleGroup} maxLength={40} placeholder="e.g. Legs" onChange={set('muscleGroup')} />
        </div>
        <div>
          <label className={labelCls}>Equipment</label>
          <input className={inputCls} value={f.equipment} maxLength={40} placeholder="e.g. Barbell" onChange={set('equipment')} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Default Sets</label>
          <input type="number" min="0" step="1" className={inputCls} value={f.sets} onChange={set('sets')} />
        </div>
        <div>
          <label className={labelCls}>Default Reps</label>
          <input type="number" min="0" step="1" className={inputCls} value={f.reps} onChange={set('reps')} />
        </div>
        <div>
          <label className={labelCls}>Weight (kg)</label>
          <input type="number" min="0" step="any" className={inputCls} value={f.weight} onChange={set('weight')} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <input className={inputCls} value={f.description} maxLength={300} placeholder="Optional instructions" onChange={set('description')} />
      </div>
    </FormModal>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, flash] = useFlash();
  const [selectedId, setSelectedId] = useState(null);
  const [categoryForm, setCategoryForm] = useState(null); // null | { category? }
  const [exerciseForm, setExerciseForm] = useState(null); // null | { exercise? }

  useEffect(() => {
    let cancelled = false;
    api
      .get('/admin/workout-categories')
      .then((res) => {
        if (cancelled) return;
        const list = normalizeCategories(res.data);
        setCategories(list);
        setSelectedId((cur) => cur || (list[0] ? list[0]._id : null));
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load workout categories.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = categories.find((c) => c._id === selectedId) || null;
  const replace = (data) => {
    const [updated] = normalizeCategories([data]);
    if (!updated) return null;
    setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    return updated;
  };

  const saveCategory = async (payload) => {
    if (categoryForm?.category) {
      const res = await api.put(`/admin/workout-categories/${categoryForm.category._id}`, payload);
      replace(res.data);
      flash('Category updated.');
    } else {
      const res = await api.post('/admin/workout-categories', payload);
      const [created] = normalizeCategories([res.data]);
      if (created) {
        setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedId(created._id);
      }
      flash('Category created.');
    }
  };

  const toggleActive = async (cat) => {
    try {
      const res = await api.put(`/admin/workout-categories/${cat._id}`, { active: !cat.active });
      replace(res.data);
      setError('');
      flash(cat.active ? `"${cat.name}" disabled. Users can no longer pick it.` : `"${cat.name}" enabled.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}" and its ${cat.exercises.length} exercises?`)) return;
    try {
      await api.delete(`/admin/workout-categories/${cat._id}`);
      setCategories((prev) => {
        const next = prev.filter((c) => c._id !== cat._id);
        setSelectedId((cur) => (cur === cat._id ? (next[0] ? next[0]._id : null) : cur));
        return next;
      });
      setError('');
      flash('Category deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saveExercise = async (payload) => {
    const editing = exerciseForm?.exercise;
    const res = editing
      ? await api.put(`/admin/workout-categories/${selected._id}/exercises/${editing._id}`, payload)
      : await api.post(`/admin/workout-categories/${selected._id}/exercises`, payload);
    replace(res.data);
    flash(editing ? 'Exercise updated.' : 'Exercise added.');
  };

  const deleteExercise = async (ex) => {
    if (!window.confirm(`Remove "${ex.name}" from ${selected.name}?`)) return;
    try {
      const res = await api.delete(`/admin/workout-categories/${selected._id}/exercises/${ex._id}`);
      replace(res.data);
      setError('');
      flash('Exercise removed.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-red-400" />
            <span>Workout Categories & Exercises</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage the categories users can log workouts under, and the exercise library they can pick from.
          </p>
        </div>
        <button
          onClick={() => setCategoryForm({})}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          {success}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          No categories yet. Click "New Category" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category list */}
          <div className="space-y-2" role="list" aria-label="Workout categories">
            {categories.map((c) => (
              <button
                key={c._id}
                role="listitem"
                onClick={() => setSelectedId(c._id)}
                className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  c._id === selectedId ? 'bg-red-500/10 border-red-500/40' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {c.exercises.length} exercise{c.exercises.length === 1 ? '' : 's'} • {c.workoutCount} workout{c.workoutCount === 1 ? '' : 's'}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                    c.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {c.active ? 'Active' : 'Disabled'}
                </span>
              </button>
            ))}
          </div>

          {/* Selected category */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            {selected && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white break-words">{selected.name}</h2>
                    <p className="text-xs text-slate-400">{selected.description || 'No description.'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => setCategoryForm({ category: selected })} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => toggleActive(selected)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5">
                      <Power className="w-3.5 h-3.5" /> {selected.active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deleteCategory(selected)} aria-label="Delete category" title="Delete category" className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-red-400" />
                    <span>Exercises ({selected.exercises.length})</span>
                  </h3>
                  <button onClick={() => setExerciseForm({})} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                {selected.exercises.length === 0 ? (
                  <p className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    No exercises in this category yet. Add the first one.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selected.exercises.map((ex) => (
                      <div key={ex._id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-white flex items-center gap-1.5 break-words">
                            <Dumbbell className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            {ex.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {ex.sets} sets × {ex.reps} reps • {ex.weight} kg
                            {ex.muscleGroup ? ` • ${ex.muscleGroup}` : ''}
                            {ex.equipment ? ` • ${ex.equipment}` : ''}
                          </p>
                          {ex.description && <p className="text-[11px] text-slate-500">{ex.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => setExerciseForm({ exercise: ex })} aria-label={`Edit ${ex.name}`} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteExercise(ex)} aria-label={`Remove ${ex.name}`} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {categoryForm && <CategoryForm category={categoryForm.category} onClose={() => setCategoryForm(null)} onSave={saveCategory} />}
      {exerciseForm && selected && (
        <ExerciseForm exercise={exerciseForm.exercise} categoryName={selected.name} onClose={() => setExerciseForm(null)} onSave={saveExercise} />
      )}
    </div>
  );
}
