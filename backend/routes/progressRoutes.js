const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
  getProgressLogs,
  addProgressLog,
  deleteProgressLog,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  return next();
};

router.route('/')
  .get(protect, getProgressLogs)
  .post(protect, addProgressLog);

router.route('/:id')
  .delete(protect, validateId, deleteProgressLog);

module.exports = router;
