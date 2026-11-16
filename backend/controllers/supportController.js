const { handleError, toNumber, isValidId } = require('../utils/helpers');
const SupportTicket = require('../models/SupportTicket');
const Feedback = require('../models/Feedback');

const CATEGORIES = ['bug', 'account', 'feature_request', 'workout_sync', 'general', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];
const FEEDBACK_CATEGORIES = ['ui_design', 'features', 'performance', 'bug_report', 'general'];

// Both GET endpoints intentionally return plain arrays (the frontend normalizes defensively).
// Every query is scoped to req.user so users can never read another user's tickets.
const getTickets = async (req, res) => {
  try {
    res.json(await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (error) {
    handleError(res, error);
  }
};

const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    if (typeof subject !== 'string' || !subject.trim()) return res.status(400).json({ message: 'Subject is required' });
    if (category !== undefined && !CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid category' });
    if (priority !== undefined && !PRIORITIES.includes(priority)) return res.status(400).json({ message: 'Invalid priority' });
    const text = typeof message === 'string' && message.trim() ? message.trim() : subject.trim();

    const ticket = new SupportTicket({
      user: req.user._id,
      subject: subject.trim(),
      category: category || 'bug',
      priority: priority || 'medium',
      messages: [{ sender: 'user', text, timestamp: new Date() }],
    });
    res.status(201).json(await ticket.save());
  } catch (error) {
    handleError(res, error);
  }
};

const replyTicket = async (req, res) => {
  try {
    const { message } = req.body;
    if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ message: 'Reply message is required' });
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid ticket ID format' });

    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.status === 'closed') return res.status(400).json({ message: 'This ticket is closed and cannot receive replies' });

    ticket.messages.push({ sender: 'user', text: message.trim(), timestamp: new Date() });
    // A user follow-up re-opens a resolved ticket; an open one moves to in_progress only once staff respond
    if (ticket.status === 'resolved') ticket.status = 'open';
    res.json(await ticket.save());
  } catch (error) {
    handleError(res, error);
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { rating, category, comments } = req.body;
    const r = toNumber(rating, NaN);
    if (!Number.isInteger(r) || r < 1 || r > 5) return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    if (typeof comments !== 'string' || !comments.trim()) return res.status(400).json({ message: 'Comments are required' });
    if (category !== undefined && !FEEDBACK_CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid feedback category' });

    const feedback = new Feedback({
      user: req.user._id,
      rating: r,
      category: category || 'general',
      comments: comments.trim(),
    });
    res.status(201).json(await feedback.save());
  } catch (error) {
    handleError(res, error);
  }
};

const getFeedback = async (req, res) => {
  try {
    res.json(await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getTickets, createTicket, replyTicket, submitFeedback, getFeedback };
