const { handleError, escapeRegex, isValidId } = require('../utils/helpers');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');
const SupportTicket = require('../models/SupportTicket');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const Goal = require('../models/Goal');
const Reminder = require('../models/Reminder');

// @desc    Get system-wide dashboard statistics
// @route   GET /api/admin/dashboard
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const totalWorkouts = await Workout.countDocuments();
    const totalNutrition = await Nutrition.countDocuments();
    const totalProgress = await Progress.countDocuments();
    const pendingTickets = await SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } });
    const totalTickets = await SupportTicket.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    // Recent registered users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password').lean();

    // Recent workouts across all users
    const recentWorkouts = await Workout.find().populate('user', 'name username').sort({ createdAt: -1 }).limit(5).lean();

    // Recent feedbacks
    const recentFeedbacks = await Feedback.find().populate('user', 'name username avatar').sort({ createdAt: -1 }).limit(4).lean();

    // Workout category breakdown across system
    const categoryStats = await Workout.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalWorkouts,
      totalNutrition,
      totalProgress,
      totalTickets,
      pendingTickets,
      totalFeedback,
      recentUsers,
      recentWorkouts,
      recentFeedbacks,
      categoryStats: categoryStats.map((c) => ({ name: c._id, count: c.count })),
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get all users with search & filters
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ name: rx }, { username: rx }, { email: rx }];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get user full details & activity
// @route   GET /api/admin/users/:id
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const workouts = await Workout.find({ user: user._id }).sort({ date: -1 }).limit(5);
    const nutrition = await Nutrition.find({ user: user._id }).sort({ date: -1 }).limit(5);
    const progress = await Progress.find({ user: user._id }).sort({ date: -1 }).limit(5);
    const tickets = await SupportTicket.find({ user: user._id }).sort({ createdAt: -1 });

    res.json({
      user,
      workoutsCount: await Workout.countDocuments({ user: user._id }),
      nutritionCount: await Nutrition.countDocuments({ user: user._id }),
      progressCount: await Progress.countDocuments({ user: user._id }),
      recentWorkouts: workouts,
      recentNutrition: nutrition,
      recentProgress: progress,
      tickets,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Toggle user active/inactive status
// @route   PUT /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }
    // Never leave the platform without an active administrator
    if (user.role === 'admin' && user.isActive) {
      const otherActiveAdmins = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: user._id } });
      if (otherActiveAdmins === 0) {
        return res.status(400).json({ message: 'Cannot deactivate the last active administrator.' });
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ message: `User status updated to ${user.isActive ? 'Active' : 'Deactivated'}`, user: safeUser });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete user and their data
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    if (user.role === 'admin') {
      const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: user._id } });
      if (otherAdmins === 0) {
        return res.status(400).json({ message: 'Cannot delete the last administrator.' });
      }
    }

    // Clean up related data
    await Goal.deleteMany({ user: user._id });
    await Reminder.deleteMany({ user: user._id });
    await SupportTicket.deleteMany({ user: user._id });
    await Feedback.deleteMany({ user: user._id });
    await Workout.deleteMany({ user: user._id });
    await Nutrition.deleteMany({ user: user._id });
    await Progress.deleteMany({ user: user._id });
    await Notification.deleteMany({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all associated data deleted successfully.' });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update user role (user/admin)
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "user" or "admin".' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (role === 'user' && target.role === 'admin') {
      if (String(target._id) === String(req.user._id)) {
        return res.status(400).json({ message: 'You cannot remove your own administrator access.' });
      }
      const otherAdmins = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: target._id } });
      if (otherAdmins === 0) {
        return res.status(400).json({ message: 'Cannot demote the last active administrator.' });
      }
    }
    if (role === 'admin' && target.isActive === false) {
      return res.status(400).json({ message: 'Activate this account before granting administrator access.' });
    }

    target.role = role;
    await target.save();
    res.json(await User.findById(target._id).select('-password'));
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get all workouts across users
// @route   GET /api/admin/workouts
const getAllWorkoutsAdmin = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.title = new RegExp(escapeRegex(search), 'i');
    }

    const workouts = await Workout.find(query)
      .populate('user', 'name username email')
      .sort({ date: -1 });

    res.json(workouts);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete workout (admin moderation)
// @route   DELETE /api/admin/workouts/:id
const deleteWorkoutAdmin = async (req, res) => {
  try {
    const removed = await Workout.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Workout not found' });
    res.json({ message: 'Workout removed by administrator' });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get all nutrition logs across users
// @route   GET /api/admin/nutrition
const getAllNutritionAdmin = async (req, res) => {
  try {
    const { mealType, search } = req.query;
    let query = {};

    if (mealType && mealType !== 'All') {
      query.mealType = mealType;
    }

    if (search) {
      query.foodName = new RegExp(escapeRegex(search), 'i');
    }

    const logs = await Nutrition.find(query)
      .populate('user', 'name username email')
      .sort({ date: -1 });

    res.json(logs);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete nutrition log (admin moderation)
// @route   DELETE /api/admin/nutrition/:id
const deleteNutritionAdmin = async (req, res) => {
  try {
    const removed = await Nutrition.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Nutrition log not found' });
    res.json({ message: 'Nutrition log removed by administrator' });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get all progress logs
// @route   GET /api/admin/progress
const getAllProgressAdmin = async (req, res) => {
  try {
    const logs = await Progress.find()
      .populate('user', 'name username email')
      .sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete progress log (admin moderation)
// @route   DELETE /api/admin/progress/:id
const deleteProgressAdmin = async (req, res) => {
  try {
    const removed = await Progress.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Progress record not found' });
    res.json({ message: 'Progress record removed by administrator' });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get all support tickets
// @route   GET /api/admin/tickets
const getAllTicketsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    const tickets = await SupportTicket.find(query)
      .populate('user', 'name username email avatar')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update ticket status & reply as admin
// @route   PUT /api/admin/tickets/:id
const updateTicketAdmin = async (req, res) => {
  try {
    const { status, replyMessage } = req.body;
    if (status !== undefined && !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid ticket status' });
    }
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    const hasReply = typeof replyMessage === 'string' && replyMessage.trim();
    if (hasReply) {
      ticket.messages.push({
        sender: 'support',
        text: replyMessage.trim(),
        timestamp: new Date(),
      });
    }

    const saved = await ticket.save();

    // Let the ticket owner know that support responded (real event, shown in their notification list)
    if (hasReply || status) {
      await Notification.create({
        user: ticket.user,
        title: hasReply ? 'Support replied to your ticket' : 'Support ticket updated',
        message: hasReply
          ? `FitPulse Support responded to "${ticket.subject}".`
          : `Your ticket "${ticket.subject}" is now ${saved.status.replace('_', ' ')}.`,
        type: 'system',
        link: '/support',
      });
    }
    const populated = await SupportTicket.findById(saved._id).populate('user', 'name username email avatar');
    res.json(populated);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get all feedbacks
// @route   GET /api/admin/feedback
const getAllFeedbackAdmin = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name username email avatar')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Broadcast notification to all users
// @route   POST /api/admin/notifications/broadcast
const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const allowedTypes = ['system', 'reminder', 'goal_achievement', 'workout_completion'];
    if (type !== undefined && !allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }
    const users = await User.find({ isActive: true }).select('_id');
    if (users.length === 0) return res.status(400).json({ message: 'There are no active users to notify.' });

    const notifications = users.map((u) => ({
      user: u._id,
      title: (typeof title === 'string' && title.trim()) || 'System Announcement',
      message: message.trim(),
      type: type || 'system',
      link: '/dashboard',
    }));

    await Notification.insertMany(notifications);
    res.json({ 
      message: `Notification broadcasted to ${users.length} active users.`,
      count: users.length 
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get system-level reports data
// @route   GET /api/admin/reports
const getAdminSystemReport = async (req, res) => {
  try {
    const [users, workouts, nutrition, progress, tickets] = await Promise.all([
      User.find().select('-password').lean(),
      Workout.find().populate('user', 'name').lean(),
      Nutrition.find().populate('user', 'name').lean(),
      Progress.find().populate('user', 'name').lean(),
      SupportTicket.find().populate('user', 'name').lean(),
    ]);

    res.json({
      totalUsers: users.length,
      totalWorkouts: workouts.length,
      totalNutrition: nutrition.length,
      totalProgress: progress.length,
      totalTickets: tickets.length,
      users,
      workouts,
      nutrition,
      progress,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  deleteUser,
  updateUserRole,
  getAllWorkoutsAdmin,
  deleteWorkoutAdmin,
  getAllNutritionAdmin,
  deleteNutritionAdmin,
  getAllProgressAdmin,
  deleteProgressAdmin,
  getAllTicketsAdmin,
  updateTicketAdmin,
  getAllFeedbackAdmin,
  broadcastNotification,
  getAdminSystemReport,
};
