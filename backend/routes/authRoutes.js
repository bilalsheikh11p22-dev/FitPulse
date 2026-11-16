const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  searchUsers,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  exportUserData,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// Email verification
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerification);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// GDPR Data Export
router.get('/export-data', protect, exportUserData);

module.exports = router;
