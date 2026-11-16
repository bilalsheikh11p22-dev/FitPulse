const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
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
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protect all admin routes with JWT and adminOnly
router.use(protect, adminOnly);

// Middleware: validate MongoDB ObjectId route params to prevent CastError spam and injection
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  return next();
};

// Dashboard
router.get('/dashboard', getAdminDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', validateId, getUserDetails);
router.put('/users/:id/toggle-status', validateId, toggleUserStatus);
router.delete('/users/:id', validateId, deleteUser);
router.put('/users/:id/role', validateId, updateUserRole);

// Workout Management
router.get('/workouts', getAllWorkoutsAdmin);
router.delete('/workouts/:id', validateId, deleteWorkoutAdmin);

// Nutrition Management
router.get('/nutrition', getAllNutritionAdmin);
router.delete('/nutrition/:id', validateId, deleteNutritionAdmin);

// Progress Monitoring
router.get('/progress', getAllProgressAdmin);
router.delete('/progress/:id', validateId, deleteProgressAdmin);

// Support & Tickets
router.get('/tickets', getAllTicketsAdmin);
router.put('/tickets/:id', validateId, updateTicketAdmin);

// Feedback
router.get('/feedback', getAllFeedbackAdmin);

// Notifications broadcast
router.post('/notifications/broadcast', broadcastNotification);

// System Reports
router.get('/reports', getAdminSystemReport);

module.exports = router;
