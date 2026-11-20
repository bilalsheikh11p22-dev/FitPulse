const { handleError, toNumber } = require('../utils/helpers');
const WorkoutCategory = require('../models/WorkoutCategory');
const Workout = require('../models/Workout');

// The original built-in categories. They are inserted once, when the collection is empty,
// so existing workouts keep working and admins can then rename / disable / extend them.
const DEFAULT_CATEGORIES = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Flexibility', 'Crossfit'];

const keyOf = (name) => String(name).trim().toLowerCase();
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const ensureDefaults = async () => {
  if ((await WorkoutCategory.countDocuments({})) > 0) return;
  for (const name of DEFAULT_CATEGORIES) {
    try {
      await WorkoutCategory.create({ name, nameKey: keyOf(name), description: '', active: true, exercises: [] });
    } catch (error) {
      if (!error || error.code !== 11000) throw error; // another request seeded it first
    }
  }
};

// Canonical names of categories users may pick
const getActiveCategories = async () => {
  await ensureDefaults();
  return WorkoutCategory.find({ active: true }).sort({ name: 1 });
};

// Resolve user input to a canonical active category name (case-insensitive), or null
const resolveCategoryName = async (input) => {
  if (typeof input !== 'string' || !input.trim()) return null;
  const cats = await getActiveCategories();
  const hit = cats.find((c) => c.nameKey === keyOf(input));
  return hit ? hit.name : null;
};

// Category used when a workout is created without one: Strength if available, otherwise the first active category
const defaultCategoryName = async () => {
  const cats = await getActiveCategories();
  const strength = cats.find((c) => c.nameKey === 'strength');
  return strength ? strength.name : cats.length ? cats[0].name : null;
};

// ---------- User-facing: categories + exercise library for the workout form ----------
// @route GET /api/workouts/categories
const listActiveCategories = async (req, res) => {
  try {
    const cats = await getActiveCategories();
    res.json(cats.map((c) => ({ _id: c._id, name: c.name, description: c.description, exercises: c.exercises })));
  } catch (error) {
    handleError(res, error);
  }
};

// ---------- Admin ----------
const withCounts = async (cat) => {
  const obj = typeof cat.toObject === 'function' ? cat.toObject() : { ...cat };
  obj.workoutCount = await Workout.countDocuments({ category: cat.name });
  return obj;
};

// @route GET /api/admin/workout-categories
const adminListCategories = async (req, res) => {
  try {
    await ensureDefaults();
    const cats = await WorkoutCategory.find({}).sort({ name: 1 });
    res.json(await Promise.all(cats.map(withCounts)));
  } catch (error) {
    handleError(res, error);
  }
};

const validateCategoryFields = (b, partial) => {
  if (!partial || b.name !== undefined) {
    if (typeof b.name !== 'string' || b.name.trim().length < 2) return 'Category name must be at least 2 characters';
    if (b.name.trim().length > 40) return 'Category name is too long (max 40 characters)';
  }
  if (b.description !== undefined && (typeof b.description !== 'string' || b.description.length > 300)) {
    return 'Description must be text of at most 300 characters';
  }
  return null;
};

// @route POST /api/admin/workout-categories
const adminCreateCategory = async (req, res) => {
  try {
    await ensureDefaults();
    const problem = validateCategoryFields(req.body, false);
    if (problem) return res.status(400).json({ message: problem });
    const name = req.body.name.trim();
    if (await WorkoutCategory.findOne({ nameKey: keyOf(name) })) {
      return res.status(400).json({ message: `A category named "${name}" already exists` });
    }
    const cat = await WorkoutCategory.create({
      name, nameKey: keyOf(name), description: text(req.body.description, 300), active: true, exercises: [],
    });
    res.status(201).json(await withCounts(cat));
  } catch (error) {
    handleError(res, error);
  }
};

// @route PUT /api/admin/workout-categories/:id   (rename, describe, enable / disable)
const adminUpdateCategory = async (req, res) => {
  try {
    const cat = await WorkoutCategory.findOne({ _id: req.params.id });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const b = req.body;
    const problem = validateCategoryFields(b, true);
    if (problem) return res.status(400).json({ message: problem });

    const oldName = cat.name;
    if (b.name !== undefined) {
      const name = b.name.trim();
      const clash = await WorkoutCategory.findOne({ nameKey: keyOf(name) });
      if (clash && String(clash._id) !== String(cat._id)) {
        return res.status(400).json({ message: `A category named "${name}" already exists` });
      }
      cat.name = name;
      cat.nameKey = keyOf(name);
    }
    if (b.description !== undefined) cat.description = text(b.description, 300);
    if (b.active !== undefined) cat.active = Boolean(b.active);
    const saved = await cat.save();
    // keep existing workouts attached to the renamed category
    if (saved.name !== oldName) await Workout.updateMany({ category: oldName }, { $set: { category: saved.name } });
    res.json(await withCounts(saved));
  } catch (error) {
    handleError(res, error);
  }
};

// @route DELETE /api/admin/workout-categories/:id
const adminDeleteCategory = async (req, res) => {
  try {
    const cat = await WorkoutCategory.findOne({ _id: req.params.id });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const used = await Workout.countDocuments({ category: cat.name });
    if (used > 0) {
      return res.status(400).json({
        message: `${used} workout${used === 1 ? ' uses' : 's use'} "${cat.name}". Disable the category instead of deleting it.`,
      });
    }
    await WorkoutCategory.findOneAndDelete({ _id: cat._id });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    handleError(res, error);
  }
};

// ----- exercises inside a category -----
const exerciseFields = (b, partial) => {
  if (!partial || b.name !== undefined) {
    if (typeof b.name !== 'string' || !b.name.trim()) return { error: 'Exercise name is required' };
    if (b.name.trim().length > 80) return { error: 'Exercise name is too long (max 80 characters)' };
  }
  for (const k of ['sets', 'reps', 'weight']) {
    if (b[k] !== undefined && b[k] !== '' && !(Number.isFinite(Number(b[k])) && Number(b[k]) >= 0)) {
      return { error: `${k[0].toUpperCase()}${k.slice(1)} must be a number that is 0 or more` };
    }
  }
  for (const [k, max] of [['muscleGroup', 40], ['equipment', 40], ['description', 300]]) {
    if (b[k] !== undefined && (typeof b[k] !== 'string' || b[k].length > max)) return { error: `${k} must be text of at most ${max} characters` };
  }
  return { error: null };
};

const applyExercise = (target, b) => {
  if (b.name !== undefined) target.name = b.name.trim();
  if (b.muscleGroup !== undefined) target.muscleGroup = text(b.muscleGroup, 40);
  if (b.equipment !== undefined) target.equipment = text(b.equipment, 40);
  if (b.description !== undefined) target.description = text(b.description, 300);
  if (b.sets !== undefined) target.sets = toNumber(b.sets, 3);
  if (b.reps !== undefined) target.reps = toNumber(b.reps, 10);
  if (b.weight !== undefined) target.weight = toNumber(b.weight, 0);
};

const sameId = (a, b) => String(a) === String(b);
const duplicateName = (cat, name, exceptId) =>
  cat.exercises.some((e) => keyOf(e.name) === keyOf(name) && !sameId(e._id, exceptId));

// @route POST /api/admin/workout-categories/:id/exercises
const adminAddExercise = async (req, res) => {
  try {
    const cat = await WorkoutCategory.findOne({ _id: req.params.id });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const { error } = exerciseFields(req.body, false);
    if (error) return res.status(400).json({ message: error });
    if (duplicateName(cat, req.body.name)) {
      return res.status(400).json({ message: `"${req.body.name.trim()}" is already in ${cat.name}` });
    }
    const ex = { name: '', muscleGroup: '', equipment: '', description: '', sets: 3, reps: 10, weight: 0 };
    applyExercise(ex, req.body);
    cat.exercises.push(ex);
    res.status(201).json(await withCounts(await cat.save()));
  } catch (error) {
    handleError(res, error);
  }
};

// @route PUT /api/admin/workout-categories/:id/exercises/:exerciseId
const adminUpdateExercise = async (req, res) => {
  try {
    const cat = await WorkoutCategory.findOne({ _id: req.params.id });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const ex = cat.exercises.find((e) => sameId(e._id, req.params.exerciseId));
    if (!ex) return res.status(404).json({ message: 'Exercise not found' });
    const { error } = exerciseFields(req.body, true);
    if (error) return res.status(400).json({ message: error });
    if (req.body.name !== undefined && duplicateName(cat, req.body.name, ex._id)) {
      return res.status(400).json({ message: `"${req.body.name.trim()}" is already in ${cat.name}` });
    }
    applyExercise(ex, req.body);
    res.json(await withCounts(await cat.save()));
  } catch (error) {
    handleError(res, error);
  }
};

// @route DELETE /api/admin/workout-categories/:id/exercises/:exerciseId
const adminDeleteExercise = async (req, res) => {
  try {
    const cat = await WorkoutCategory.findOne({ _id: req.params.id });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    if (!cat.exercises.some((e) => sameId(e._id, req.params.exerciseId))) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    cat.exercises = cat.exercises.filter((e) => !sameId(e._id, req.params.exerciseId));
    res.json(await withCounts(await cat.save()));
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  resolveCategoryName,
  defaultCategoryName,
  listActiveCategories,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminAddExercise,
  adminUpdateExercise,
  adminDeleteExercise,
};
