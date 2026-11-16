const crypto = require('crypto');
const { handleError, escapeRegex, sanitizeAvatar } = require('../utils/helpers');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createNotification } = require('../utils/notify');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.warn('[Auth] JWT_SECRET not set — refusing to sign token in production');
    if (process.env.NODE_ENV === 'production') throw new Error('Server configuration error');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fitness_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];
const ACTIVITY = ['sedentary', 'light', 'moderate', 'very_active', 'extra_active'];
const GOALS = ['weight_loss', 'muscle_gain', 'endurance', 'maintenance', 'general_fitness'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Never include the password hash in a response
const publicUser = (user, withToken = false) => {
  const payload = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    isActive: user.isActive !== undefined ? user.isActive : true,
    isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : false,
    avatar: sanitizeAvatar(user.avatar),
    bio: user.bio,
    age: user.age,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
    targetWeight: user.targetWeight,
    activityLevel: user.activityLevel,
    fitnessGoal: user.fitnessGoal,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
  if (withToken) payload.token = generateToken(user._id);
  return payload;
};

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

// Returns an error string or null. Only validates fields that are present.
const validateBiometrics = (b) => {
  if (b.age !== undefined && !(Number.isFinite(Number(b.age)) && Number(b.age) >= 10 && Number(b.age) <= 120))
    return 'Age must be between 10 and 120';
  if (b.height !== undefined && !(Number.isFinite(Number(b.height)) && Number(b.height) >= 50 && Number(b.height) <= 272))
    return 'Height must be between 50 and 272 cm';
  if (b.weight !== undefined && !(Number.isFinite(Number(b.weight)) && Number(b.weight) >= 20 && Number(b.weight) <= 500))
    return 'Weight must be between 20 and 500 kg';
  if (b.targetWeight !== undefined && !(Number.isFinite(Number(b.targetWeight)) && Number(b.targetWeight) >= 20 && Number(b.targetWeight) <= 500))
    return 'Target weight must be between 20 and 500 kg';
  if (b.gender !== undefined && !GENDERS.includes(b.gender)) return 'Invalid gender value';
  if (b.activityLevel !== undefined && !ACTIVITY.includes(b.activityLevel)) return 'Invalid activity level';
  if (b.fitnessGoal !== undefined && !GOALS.includes(b.fitnessGoal)) return 'Invalid fitness goal';
  return null;
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, avatar, age, gender, height, weight, activityLevel, fitnessGoal } = req.body;

    if (!isNonEmptyString(name) || !isNonEmptyString(username) || !isNonEmptyString(email) || typeof password !== 'string') {
      return res.status(400).json({ message: 'Name, username, email and password are required' });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    const bioError = validateBiometrics({ age, gender, height, weight, activityLevel, fitnessGoal });
    if (bioError) return res.status(400).json({ message: bioError });

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { username: cleanUsername }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Generate email verification token
    const verificationRaw = crypto.randomBytes(32).toString('hex');
    const verificationHash = crypto.createHash('sha256').update(verificationRaw).digest('hex');

    // Role is always "user" on self-registration - admins cannot be created through this endpoint
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      role: 'user',
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: verificationHash,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      avatar: sanitizeAvatar(avatar), // never auto-assign a picture; empty means initials in the UI
      age: age !== undefined ? Number(age) : 25,
      gender: gender || 'male',
      height: height !== undefined ? Number(height) : 175,
      weight: weight !== undefined ? Number(weight) : 72,
      activityLevel: activityLevel || 'moderate',
      fitnessGoal: fitnessGoal || 'muscle_gain',
    });

    // Send verification email in background (non-blocking)
    sendVerificationEmail(user, verificationRaw).catch((err) =>
      console.warn('[Register] Could not dispatch verification email:', err.message)
    );

    await createNotification({
      user: user._id,
      title: 'Welcome to FitPulse! 👋',
      message: 'Your account is ready. Log your first workout or set a fitness goal to get started.',
      type: 'system',
      link: '/dashboard',
      dedupeKey: `welcome:${user._id}`,
    });

    res.status(201).json(publicUser(user, true));
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (typeof emailOrUsername !== 'string' || typeof password !== 'string' || !emailOrUsername.trim() || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    const identifier = emailOrUsername.trim().toLowerCase();
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    // Same message for unknown user and wrong password: do not reveal which accounts exist
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials. Please check your username/email and password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account has been deactivated by administrator. Please contact support.' });
    }

    res.json(publicUser(user, true));
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(publicUser(user));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const body = req.body || {};

    if (body.name !== undefined && !isNonEmptyString(body.name)) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    if (body.password !== undefined && body.password !== '' && (typeof body.password !== 'string' || body.password.length < 6)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    const bioError = validateBiometrics(body);
    if (bioError) return res.status(400).json({ message: bioError });

    if (body.preferences !== undefined) {
      const p = body.preferences || {};
      if (p.unitSystem !== undefined && !['metric', 'imperial'].includes(p.unitSystem))
        return res.status(400).json({ message: 'Invalid unit system' });
      if (p.theme !== undefined && !['dark', 'light'].includes(p.theme))
        return res.status(400).json({ message: 'Invalid theme' });
    }

    if (body.name !== undefined) user.name = body.name.trim();
    if (body.bio !== undefined) user.bio = String(body.bio).slice(0, 500);
    // An empty string removes the picture; omitting the field leaves it untouched
    if (body.avatar !== undefined) user.avatar = sanitizeAvatar(body.avatar);
    if (body.age !== undefined) user.age = Number(body.age);
    if (body.gender) user.gender = body.gender;
    if (body.height !== undefined) user.height = Number(body.height);
    if (body.weight !== undefined) user.weight = Number(body.weight);
    if (body.targetWeight !== undefined) user.targetWeight = Number(body.targetWeight);
    if (body.activityLevel) user.activityLevel = body.activityLevel;
    if (body.fitnessGoal) user.fitnessGoal = body.fitnessGoal;

    // Only whitelisted preference keys are merged, one by one, so unspecified ones are kept
    if (body.preferences && typeof body.preferences === 'object') {
      if (!user.preferences) user.preferences = {};
      const p = body.preferences;
      if (p.unitSystem !== undefined) user.preferences.unitSystem = p.unitSystem;
      if (p.theme !== undefined) user.preferences.theme = p.theme;
      if (p.emailNotifications !== undefined) user.preferences.emailNotifications = Boolean(p.emailNotifications);
      if (p.reminderAlerts !== undefined) user.preferences.reminderAlerts = Boolean(p.reminderAlerts);
    }

    // role / isActive / email / username are intentionally NOT updatable here
    if (body.password) user.password = body.password; // hashed by the pre-save hook

    const passwordChanged = Boolean(body.password);
    const updatedUser = await user.save();
    if (passwordChanged) {
      await createNotification({
        user: updatedUser._id,
        title: 'Password changed',
        message: 'Your account password was just changed. If this was not you, contact support.',
        type: 'system',
        link: '/settings',
      });
    }
    res.json(publicUser(updatedUser, true));
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Search users (community) - public fields only, never email
// @route   GET /api/users/search
const searchUsers = async (req, res) => {
  try {
    const q = typeof req.query.query === 'string' ? req.query.query.trim().slice(0, 50) : '';
    if (!q) return res.json([]);

    const rx = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({
      $or: [{ name: rx }, { username: rx }],
      _id: { $ne: req.user._id },
      isActive: true,
    })
      .select('name username avatar bio fitnessGoal activityLevel')
      .limit(10)
      .lean();

    res.json(users.map((u) => ({ ...u, avatar: sanitizeAvatar(u.avatar) })));
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).json({ message: 'Missing token or email' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: 'Verification link is invalid or has expired.' });

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    await createNotification({
      user: user._id,
      title: 'Email verified ✅',
      message: 'Your email address has been verified successfully. Email notifications are now enabled.',
      type: 'system',
      link: '/settings',
      dedupeKey: `email_verified:${user._id}`,
    });

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email is already verified.' });

    // Rate-limit: allow resend only if 2 min have passed
    if (user.emailVerificationExpires && user.emailVerificationExpires > new Date(Date.now() + 24 * 60 * 60 * 1000 - 2 * 60 * 1000)) {
      return res.status(429).json({ message: 'Please wait a moment before requesting another verification email.' });
    }

    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    user.emailVerificationToken = hashed;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    sendVerificationEmail(user, raw).catch((err) =>
      console.warn('[ResendVerification] Email dispatch failed:', err.message)
    );

    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isNonEmptyString(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Rate-limit: if a valid non-expired token exists and was just issued (within last 2 min)
    if (user.resetPasswordExpires && user.resetPasswordExpires > new Date(Date.now() + 60 * 60 * 1000 - 2 * 60 * 1000)) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    sendPasswordResetEmail(user, raw).catch((err) =>
      console.warn('[ForgotPassword] Email dispatch failed:', err.message)
    );

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !isNonEmptyString(email) || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Token, email, and a password of at least 6 characters are required.' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: 'Password reset link is invalid or has expired.' });

    user.password = password; // pre-save hook will hash it
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await createNotification({
      user: user._id,
      title: 'Password changed',
      message: 'Your password was reset successfully. If you did not do this, contact support immediately.',
      type: 'system',
      link: '/settings',
      dedupeKey: `pwd_reset:${user._id}:${Date.now()}`,
    });

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Full user data export (GDPR)
// @route   GET /api/auth/export-data
const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const Workout = require('../models/Workout');
    const Nutrition = require('../models/Nutrition');
    const Progress = require('../models/Progress');
    const Goal = require('../models/Goal');
    const Reminder = require('../models/Reminder');
    const Notification = require('../models/Notification');
    const SupportTicket = require('../models/SupportTicket');
    const Feedback = require('../models/Feedback');

    const user = await User.findById(userId).select('-password -emailVerificationToken -resetPasswordToken');
    const [workouts, nutrition, progress, goals, reminders, notifications, tickets, feedback] = await Promise.all([
      Workout.find({ user: userId }).sort({ createdAt: -1 }),
      Nutrition.find({ user: userId }).sort({ date: -1 }),
      Progress.find({ user: userId }).sort({ date: -1 }),
      Goal.find({ user: userId }),
      Reminder.find({ user: userId }),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(200),
      SupportTicket.find({ user: userId }).sort({ createdAt: -1 }),
      Feedback.find({ user: userId }).sort({ createdAt: -1 }),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: user,
      workouts,
      nutrition,
      progress,
      goals,
      reminders,
      notifications,
      supportTickets: tickets,
      feedback,
    };

    res.setHeader('Content-Disposition', `attachment; filename="FitPulse_Export_${user.username}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(exportPayload);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
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
};
