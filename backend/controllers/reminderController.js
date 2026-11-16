const { handleError, toNumber, isValidDate } = require('../utils/helpers');
const Reminder = require('../models/Reminder');
const Goal = require('../models/Goal');
const { createNotification } = require('../utils/notify');
const { computeNextRun, isValidTimeZone, DATE_RE, ALL_DAYS } = require('../utils/schedule');

const REMINDER_TYPES = ['workout', 'meal', 'water', 'goal', 'supplement', 'weight', 'general'];
const REPEATS = ['once', 'daily', 'weekly', 'custom'];
const GOAL_CATEGORIES = ['weight', 'workout', 'nutrition', 'running', 'strength', 'endurance', 'general'];
const CLIENT_GOAL_STATUSES = ['in_progress', 'completed'];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MS_DAY = 86400000;

// ---------- Reminders ----------
// Fields: title, type, time (HH:MM), days, active, notes (= description), repeat, runDate, timezone,
// plus scheduler state lastTriggeredAt / nextRunAt (maintained by utils/reminderScheduler.js).
const getReminders = async (req, res) => {
  try {
    res.json(await Reminder.find({ user: req.user._id }).sort({ time: 1 }));
  } catch (error) {
    handleError(res, error);
  }
};

const createReminder = async (req, res) => {
  try {
    const { title, type, time, days, notes, active, repeat, runDate, timezone } = req.body;

    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'Reminder title is required' });
    if (title.trim().length > 100) return res.status(400).json({ message: 'Reminder title is too long (max 100 characters)' });
    if (typeof time !== 'string' || !TIME_RE.test(time)) return res.status(400).json({ message: 'Time must be in HH:MM (24h) format' });
    if (type !== undefined && !REMINDER_TYPES.includes(type)) return res.status(400).json({ message: 'Invalid reminder type' });
    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 300)) {
      return res.status(400).json({ message: 'Description must be text of at most 300 characters' });
    }
    if (repeat !== undefined && !REPEATS.includes(repeat)) return res.status(400).json({ message: 'Invalid repeat option' });
    if (days !== undefined && (!Array.isArray(days) || days.some((d) => !ALL_DAYS.includes(d)))) {
      return res.status(400).json({ message: 'Invalid reminder days' });
    }
    if (timezone !== undefined && !isValidTimeZone(timezone)) return res.status(400).json({ message: 'Invalid timezone' });

    const mode = repeat || 'custom';
    let cleanDays = days && days.length ? [...new Set(days)] : [];
    let cleanRunDate = '';
    if (mode === 'once') {
      if (typeof runDate !== 'string' || !DATE_RE.test(runDate) || Number.isNaN(new Date(runDate).getTime())) {
        return res.status(400).json({ message: 'A date is required for a one-time reminder' });
      }
      cleanRunDate = runDate;
      cleanDays = [];
    } else if (mode === 'daily') {
      cleanDays = [...ALL_DAYS];
    } else if (mode === 'weekly') {
      if (cleanDays.length !== 1) return res.status(400).json({ message: 'Choose exactly one weekday for a weekly reminder' });
    } else if (!cleanDays.length) {
      cleanDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    }

    const isActive = active !== undefined ? Boolean(active) : true;
    const draft = {
      time, repeat: mode, days: cleanDays, runDate: cleanRunDate, timezone: timezone || 'UTC',
    };
    const nextRunAt = computeNextRun(draft, new Date());
    if (isActive && !nextRunAt) {
      return res.status(400).json({ message: 'That date and time has already passed. Choose a future time.' });
    }

    const reminder = new Reminder({
      user: req.user._id,
      title: title.trim(),
      type: type || 'workout',
      ...draft,
      notes: typeof notes === 'string' ? notes.trim() : '',
      active: isActive,
      lastTriggeredAt: null,
      nextRunAt: isActive ? nextRunAt : null,
    });
    res.status(201).json(await reminder.save());
  } catch (error) {
    handleError(res, error);
  }
};

const toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    if (reminder.active) {
      reminder.active = false;
      reminder.nextRunAt = null; // a disabled reminder is never picked up by the scheduler
    } else {
      const next = computeNextRun(reminder, new Date());
      if (!next) {
        return res.status(400).json({ message: 'This one-time reminder has already passed. Delete it and create a new one.' });
      }
      reminder.active = true;
      reminder.nextRunAt = next;
    }
    await reminder.save();
    res.json(reminder);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    handleError(res, error);
  }
};

// ---------- Goals ----------
// Progress = (current - start) / (target - start); with start = 0 this is current / target.
// Works for decreasing goals (weight loss). `progress` keeps the real value (can exceed 100);
// `progressPct` is clamped to 0..100 for bars. Never divides by zero.
const calcProgress = (goal) => {
  const target = toNumber(goal.targetValue);
  const current = toNumber(goal.currentValue);
  const hasStart = goal.startValue !== undefined && goal.startValue !== null;
  let raw;
  if (hasStart && toNumber(goal.startValue) !== target) {
    raw = ((current - toNumber(goal.startValue)) / (target - toNumber(goal.startValue))) * 100;
  } else if (hasStart) {
    raw = current === target ? 100 : 0;
  } else {
    raw = target > 0 ? (current / target) * 100 : 0;
  }
  if (!Number.isFinite(raw)) raw = 0;
  return { progress: Math.round(raw * 10) / 10, progressPct: Math.max(0, Math.min(100, Math.round(raw))) };
};

const withProgress = (goal) => {
  const obj = typeof goal.toObject === 'function' ? goal.toObject() : { ...goal };
  return { ...obj, ...calcProgress(obj) };
};

const hasReachedTarget = (goal) => {
  const start = goal.startValue ?? goal.currentValue;
  return goal.targetValue >= start ? goal.currentValue >= goal.targetValue : goal.currentValue <= goal.targetValue;
};

// Goals still "in progress" after their deadline become overdue (and overdue goals pushed back out become in progress)
const syncGoalStatuses = async (userId, now = new Date()) => {
  await Goal.updateMany({ user: userId, status: 'in_progress', deadline: { $lt: now } }, { $set: { status: 'overdue' } });
  await Goal.updateMany({ user: userId, status: 'overdue', deadline: { $gte: now } }, { $set: { status: 'in_progress' } });
};

const getGoals = async (req, res) => {
  try {
    await syncGoalStatuses(req.user._id);
    const goals = await Goal.find({ user: req.user._id }).sort({ deadline: 1 });
    res.json(goals.map(withProgress));
  } catch (error) {
    handleError(res, error);
  }
};

const notifyAchievement = (goal) =>
  createNotification({
    user: goal.user,
    title: 'Goal Achieved! 🏆',
    message: `You completed your goal "${goal.title}". Great work!`,
    type: 'goal_achievement',
    link: '/reminders',
    dedupeKey: `goal:${goal._id}:completed:${new Date(goal.completedAt).getTime()}`,
  });

// Validate the fields shared by create and update. Returns an error message or null.
const validateGoalFields = (b, { partial }) => {
  const { title, description, category, targetValue, currentValue, unit, deadline, startDate } = b;
  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) return 'Goal title is required';
    if (title.trim().length > 120) return 'Goal title is too long (max 120 characters)';
  }
  if (description !== undefined && (typeof description !== 'string' || description.length > 500)) {
    return 'Description must be text of at most 500 characters';
  }
  if (category !== undefined && !GOAL_CATEGORIES.includes(category)) return 'Invalid goal category';
  if (!partial || targetValue !== undefined) {
    if (targetValue === '' || targetValue === null || targetValue === undefined || !Number.isFinite(Number(targetValue))) {
      return 'Target value must be a number';
    }
    if (Number(targetValue) <= 0) return 'Target value must be greater than 0';
  }
  if (currentValue !== undefined && currentValue !== '' && currentValue !== null) {
    if (!Number.isFinite(Number(currentValue))) return 'Current value must be a number';
    if (Number(currentValue) < 0) return 'Current value cannot be negative';
  }
  if (unit !== undefined && (typeof unit !== 'string' || unit.length > 20)) return 'Unit must be text of at most 20 characters';
  if (deadline !== undefined && deadline !== '' && !isValidDate(deadline)) return 'Invalid deadline';
  if (startDate !== undefined && startDate !== '' && !isValidDate(startDate)) return 'Invalid start date';
  return null;
};

const createGoal = async (req, res) => {
  try {
    const b = req.body;
    const problem = validateGoalFields(b, { partial: false });
    if (problem) return res.status(400).json({ message: problem });
    if (b.status !== undefined && !CLIENT_GOAL_STATUSES.includes(b.status)) return res.status(400).json({ message: 'Invalid goal status' });

    const now = new Date();
    const start = b.startDate ? new Date(b.startDate) : now;
    const deadline = b.deadline ? new Date(b.deadline) : new Date(start.getTime() + 30 * MS_DAY);
    if (deadline.getTime() < start.getTime() - MS_DAY) {
      return res.status(400).json({ message: 'Deadline cannot be before the start date' });
    }

    const current = toNumber(b.currentValue, 0);
    const goal = new Goal({
      user: req.user._id,
      title: b.title.trim(),
      description: typeof b.description === 'string' ? b.description.trim() : '',
      category: b.category || 'weight',
      targetValue: Number(b.targetValue),
      currentValue: current,
      startValue: current,
      unit: typeof b.unit === 'string' && b.unit.trim() ? b.unit.trim() : 'kg',
      startDate: start,
      deadline,
      status: 'in_progress',
      completedAt: null,
    });
    if (b.status === 'completed' || hasReachedTarget(goal)) {
      goal.status = 'completed';
      goal.completedAt = now;
    } else if (deadline < now) {
      goal.status = 'overdue';
    }
    const saved = await goal.save();
    if (saved.status === 'completed') await notifyAchievement(saved);
    res.status(201).json(withProgress(saved));
  } catch (error) {
    handleError(res, error);
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const b = req.body;
    const problem = validateGoalFields(b, { partial: true });
    if (problem) return res.status(400).json({ message: problem });
    if (b.status !== undefined && !CLIENT_GOAL_STATUSES.includes(b.status) && b.status !== goal.status) {
      return res.status(400).json({ message: 'Invalid goal status' });
    }

    const wasCompleted = goal.status === 'completed';
    const before = { current: goal.currentValue, target: goal.targetValue };

    if (b.title !== undefined) goal.title = b.title.trim();
    if (b.description !== undefined) goal.description = b.description.trim();
    if (b.category !== undefined) goal.category = b.category;
    if (b.targetValue !== undefined) goal.targetValue = Number(b.targetValue);
    if (b.currentValue !== undefined && b.currentValue !== '' && b.currentValue !== null) {
      goal.currentValue = Number(b.currentValue);
      if (goal.startValue === undefined || goal.startValue === null) goal.startValue = goal.currentValue;
    }
    if (typeof b.unit === 'string' && b.unit.trim()) goal.unit = b.unit.trim();
    if (b.startDate) goal.startDate = new Date(b.startDate);
    if (b.deadline) goal.deadline = new Date(b.deadline);
    if (goal.startDate && goal.deadline && new Date(goal.deadline) < new Date(goal.startDate).getTime() - MS_DAY) {
      return res.status(400).json({ message: 'Deadline cannot be before the start date' });
    }

    // A status is only an explicit override when it differs from what is stored
    // (the edit form always sends the status it loaded).
    const explicit = b.status !== undefined && b.status !== goal.status && CLIENT_GOAL_STATUSES.includes(b.status);
    const valuesChanged = goal.currentValue !== before.current || goal.targetValue !== before.target;
    const reached = hasReachedTarget(goal);
    let nextStatus = goal.status;
    if (explicit) nextStatus = b.status;
    else if (valuesChanged && reached && goal.status !== 'completed') nextStatus = 'completed';
    else if (valuesChanged && !reached && goal.status === 'completed') nextStatus = 'in_progress';
    if (nextStatus !== 'completed') nextStatus = new Date(goal.deadline) < new Date() ? 'overdue' : 'in_progress';

    if (nextStatus === 'completed' && !wasCompleted) goal.completedAt = new Date();
    if (nextStatus !== 'completed') goal.completedAt = null;
    goal.status = nextStatus;

    const saved = await goal.save();
    if (!wasCompleted && saved.status === 'completed') await notifyAchievement(saved);
    res.json(withProgress(saved));
  } catch (error) {
    handleError(res, error);
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  syncGoalStatuses,
  withProgress,
  getReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
