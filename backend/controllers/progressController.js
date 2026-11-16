const { handleError, toNumber, isValidDate } = require('../utils/helpers');
const Progress = require('../models/Progress');
const User = require('../models/User');

const MEASURE_KEYS = ['chest', 'waist', 'hips', 'arms', 'thighs'];
const METRIC_KEYS = ['runningTime5k', 'benchPressMax', 'squatMax', 'deadliftMax', 'pullUpsCount'];

const pickNumbers = (obj, keys) => {
  const out = {};
  const src = obj && typeof obj === 'object' ? obj : {};
  for (const k of keys) out[k] = Math.max(0, toNumber(src[k], 0));
  return out;
};

// Keep the profile weight consistent with the most recent progress entry
const syncUserWeight = async (userId) => {
  const latest = await Progress.findOne({ user: userId }).sort({ date: -1, createdAt: -1 });
  if (latest) await User.findByIdAndUpdate(userId, { weight: latest.weight });
};

// @desc    Get all progress entries (oldest first, for charts)
// @route   GET /api/progress
const getProgressLogs = async (req, res) => {
  try {
    res.json(await Progress.find({ user: req.user._id }).sort({ date: 1 }));
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Add a progress entry
// @route   POST /api/progress
const addProgressLog = async (req, res) => {
  try {
    const { weight, bodyMeasurements, performanceMetrics, notes, photoUrl, date } = req.body;

    const w = Number(weight);
    if (weight === undefined || weight === '' || !Number.isFinite(w) || w < 20 || w > 500) {
      return res.status(400).json({ message: 'Weight is required and must be between 20 and 500 kg' });
    }
    if (date !== undefined && date !== '' && !isValidDate(date)) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const progress = new Progress({
      user: req.user._id,
      weight: w,
      bodyMeasurements: pickNumbers(bodyMeasurements, MEASURE_KEYS),
      performanceMetrics: pickNumbers(performanceMetrics, METRIC_KEYS),
      notes: typeof notes === 'string' ? notes : '',
      photoUrl: typeof photoUrl === 'string' ? photoUrl : '',
      date: date ? new Date(date) : new Date(),
    });

    const saved = await progress.save();
    await syncUserWeight(req.user._id);

    res.status(201).json(saved);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete a progress entry
// @route   DELETE /api/progress/:id
const deleteProgressLog = async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!progress) return res.status(404).json({ message: 'Progress record not found' });
    await syncUserWeight(req.user._id);
    res.json({ message: 'Progress entry deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getProgressLogs, addProgressLog, deleteProgressLog };
