const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
  getReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  return next();
};

// Reminders
router.route('/reminders')
  .get(protect, getReminders)
  .post(protect, createReminder);

router.route('/reminders/:id/toggle')
  .put(protect, validateId, toggleReminder);

router.route('/reminders/:id')
  .delete(protect, validateId, deleteReminder);

// Goals
router.route('/goals')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.route('/goals/:id')
  .put(protect, validateId, updateGoal)
  .delete(protect, validateId, deleteGoal);

module.exports = router;
