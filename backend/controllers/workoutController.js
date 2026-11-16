const { handleError, escapeRegex, toNumber, isValidDate } = require('../utils/helpers');
const Workout = require('../models/Workout');
const { createNotification } = require('../utils/notify');

const CATEGORIES = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Flexibility', 'Crossfit'];

const parseTags = (tags) => {
  const list = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',') : [];
  return list.map((t) => String(t).trim()).filter(Boolean);
};

const cleanExercises = (exercises) => {
  if (!Array.isArray(exercises)) return [];
  return exercises
    .filter((e) => e && typeof e.name === 'string' && e.name.trim())
    .map((e) => ({
      name: e.name.trim(),
      sets: Math.max(0, toNumber(e.sets, 3)),
      reps: Math.max(0, toNumber(e.reps, 10)),
      weight: Math.max(0, toNumber(e.weight, 0)),
      duration: Math.max(0, toNumber(e.duration, 0)),
      notes: typeof e.notes === 'string' ? e.notes : '',
      completed: e.completed === undefined ? true : Boolean(e.completed),
    }));
};

// @desc    Get all workouts for logged in user (with search and filters)
// @route   GET /api/workouts
const getWorkouts = async (req, res) => {
  try {
    const { search, category, tag, limit } = req.query;
    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = String(category);
    }

    if (tag) {
      query.tags = { $in: [new RegExp(escapeRegex(tag), 'i')] };
    }

    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ title: rx }, { notes: rx }, { 'exercises.name': rx }];
    }

    const workoutsQuery = Workout.find(query).sort({ date: -1 });
    const lim = parseInt(limit, 10);
    if (lim > 0) workoutsQuery.limit(Math.min(lim, 500));

    res.json(await workoutsQuery.exec());
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Create a new workout
// @route   POST /api/workouts
const createWorkout = async (req, res) => {
  try {
    const { title, category, duration, caloriesBurned, date, tags, notes, exercises } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Workout title is required' });
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid workout category' });
    }
    if (date !== undefined && date !== '' && !isValidDate(date)) {
      return res.status(400).json({ message: 'Invalid workout date' });
    }
    const dur = toNumber(duration, 30);
    const cal = toNumber(caloriesBurned, 200);
    if (dur <= 0 || cal < 0) {
      return res.status(400).json({ message: 'Duration must be positive and calories cannot be negative' });
    }

    const workout = new Workout({
      user: req.user._id,
      title: title.trim(),
      category: category || 'Strength',
      duration: dur,
      caloriesBurned: cal,
      date: date ? new Date(date) : new Date(),
      tags: parseTags(tags),
      notes: typeof notes === 'string' ? notes : '',
      exercises: cleanExercises(exercises),
    });

    const savedWorkout = await workout.save();

    await createNotification({
      user: req.user._id,
      dedupeKey: `workout:${savedWorkout._id}`,
      title: 'Workout Logged! 🔥',
      message: `Great job! You recorded "${savedWorkout.title}" burning ${savedWorkout.caloriesBurned} kcal.`,
      type: 'workout_completion',
      link: '/workouts',
    });

    res.status(201).json(savedWorkout);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    const { title, category, duration, caloriesBurned, date, tags, notes, exercises } = req.body;

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ message: 'Workout title cannot be empty' });
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid workout category' });
    }
    if (date !== undefined && date !== '' && !isValidDate(date)) {
      return res.status(400).json({ message: 'Invalid workout date' });
    }
    if (duration !== undefined && !(toNumber(duration, NaN) > 0)) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }
    if (caloriesBurned !== undefined && !(toNumber(caloriesBurned, NaN) >= 0)) {
      return res.status(400).json({ message: 'Calories cannot be negative' });
    }

    if (title !== undefined) workout.title = title.trim();
    if (category !== undefined) workout.category = category;
    if (duration !== undefined) workout.duration = Number(duration);
    if (caloriesBurned !== undefined) workout.caloriesBurned = Number(caloriesBurned);
    if (date) workout.date = new Date(date);
    if (notes !== undefined) workout.notes = typeof notes === 'string' ? notes : '';
    if (tags !== undefined) workout.tags = parseTags(tags);
    if (exercises !== undefined) workout.exercises = cleanExercises(exercises);

    res.json(await workout.save());
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout };
