const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
  getTickets,
  createTicket,
  replyTicket,
  submitFeedback,
  getFeedback,
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  return next();
};

router.route('/tickets')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.post('/tickets/:id/reply', protect, validateId, replyTicket);

router.route('/feedback')
  .get(protect, getFeedback)
  .post(protect, submitFeedback);

module.exports = router;
