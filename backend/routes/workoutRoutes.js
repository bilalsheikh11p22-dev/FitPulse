const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  return next();
};

router.route('/')
  .get(protect, getWorkouts)
  .post(protect, createWorkout);

router.route('/:id')
  .get(protect, validateId, getWorkoutById)
  .put(protect, validateId, updateWorkout)
  .delete(protect, validateId, deleteWorkout);

module.exports = router;
