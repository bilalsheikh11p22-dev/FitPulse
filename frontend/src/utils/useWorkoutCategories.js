import { useEffect, useState } from 'react';
import api from '../api/api';
import { toArray, toNumber, getErrorMessage } from './normalize';

// Workout categories (and their exercise library) managed by the admin.
// `admin: true` also returns disabled categories (used for admin filters).
const normalize = (c) => ({
  _id: String(c._id),
  name: String(c.name),
  description: typeof c.description === 'string' ? c.description : '',
  active: c.active !== false,
  workoutCount: toNumber(c.workoutCount),
  exercises: toArray(c.exercises)
    .filter((e) => e && typeof e.name === 'string')
    .map((e) => ({
      _id: String(e._id),
      name: e.name,
      muscleGroup: typeof e.muscleGroup === 'string' ? e.muscleGroup : '',
      equipment: typeof e.equipment === 'string' ? e.equipment : '',
      description: typeof e.description === 'string' ? e.description : '',
      sets: toNumber(e.sets, 3),
      reps: toNumber(e.reps, 10),
      weight: toNumber(e.weight, 0),
    })),
});

export const normalizeCategories = (data) =>
  toArray(data).filter((c) => c && typeof c.name === 'string' && c._id).map(normalize);

export default function useWorkoutCategories({ admin = false } = {}) {
  const [state, setState] = useState({ categories: [], loading: true, error: '' });

  useEffect(() => {
    let cancelled = false;
    api
      .get(admin ? '/admin/workout-categories' : '/workouts/categories')
      .then((res) => {
        if (!cancelled) setState({ categories: normalizeCategories(res.data), loading: false, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setState({ categories: [], loading: false, error: getErrorMessage(err, 'Could not load categories.') });
      });
    return () => {
      cancelled = true;
    };
  }, [admin]);

  return state;
}
