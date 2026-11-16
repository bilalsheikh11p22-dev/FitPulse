const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
  getNutritionLogs,
  addNutritionLog,
  updateNutritionLog,
  deleteNutritionLog,
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  return next();
};

router.route('/')
  .get(protect, getNutritionLogs)
  .post(protect, addNutritionLog);

router.route('/:id')
  .put(protect, validateId, updateNutritionLog)
  .delete(protect, validateId, deleteNutritionLog);

module.exports = router;
