
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// Load environment variables before using project configuration
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startReminderScheduler, processDueReminders } = require('./utils/reminderScheduler');

const app = express();

const isVercel = process.env.VERCEL === '1';

// ─────────────────────────────────────────────────────────────
// Environment validation
// ─────────────────────────────────────────────────────────────

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Configure it in environment variables.');
}

// ─────────────────────────────────────────────────────────────
// Proxy configuration for Vercel
// ─────────────────────────────────────────────────────────────

if (isVercel) {
  app.set('trust proxy', 1);
}

// ─────────────────────────────────────────────────────────────
// Security headers
// ─────────────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ─────────────────────────────────────────────────────────────
// CORS configuration
// ─────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Same-origin requests (frontend and API served from the same Vercel domain) are always allowed.
// The browser still sends an Origin header on POST/PUT/DELETE, so it is compared with the request host.
const isSameOrigin = (req, origin) => {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
};

app.use(
  cors((req, callback) => {
    const origin = req.header('Origin');

    if (!origin || ALLOWED_ORIGINS.includes(origin) || isSameOrigin(req, origin)) {
      return callback(null, { origin: true, credentials: true });
    }

    return callback(new Error(`CORS: origin '${origin}' is not allowed`));
  })
);

// ─────────────────────────────────────────────────────────────
// Body parser
// ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));

// ─────────────────────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────────────────────────
// Rate limiters
// ─────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many attempts from this IP. Please try again in 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests. Please try again shortly.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// ─────────────────────────────────────────────────────────────
// Root route
// ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FitPulse Backend is running',
    health: '/api/health',
  });
});

// ─────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FitPulse API is operating smoothly',
  });
});

// ─────────────────────────────────────────────────────────────
// MongoDB connection middleware
// Connect before handling API requests.
// connectDB must use a cached connection.
// ─────────────────────────────────────────────────────────────

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);

    res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Reminder cron (Vercel Cron)
// A serverless function cannot keep a background timer running, so Vercel Cron calls this
// endpoint instead (see "crons" in vercel.json). Set CRON_SECRET in the Vercel env variables;
// Vercel then sends it automatically as "Authorization: Bearer <CRON_SECRET>".
// ─────────────────────────────────────────────────────────────

app.get('/api/cron/reminders', async (req, res, next) => {
  const secret = process.env.CRON_SECRET;

  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const notified = await processDueReminders(new Date());
    res.status(200).json({ success: true, notified });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────
// API routes
// ─────────────────────────────────────────────────────────────

// Site media is public and cached (the video is fetched in several range requests), so it has no per-IP limiter.
app.use('/api/media', require('./routes/mediaRoutes'));

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

app.use('/api/users', generalLimiter, require('./routes/userRoutes'));
app.use('/api/workouts', generalLimiter, require('./routes/workoutRoutes'));
app.use('/api/nutrition', generalLimiter, require('./routes/nutritionRoutes'));
app.use('/api/progress', generalLimiter, require('./routes/progressRoutes'));
app.use('/api/analytics', generalLimiter, require('./routes/analyticsRoutes'));
app.use('/api/notifications', generalLimiter, require('./routes/notificationRoutes'));
app.use('/api/reminders', generalLimiter, require('./routes/reminderRoutes'));
app.use('/api/support', generalLimiter, require('./routes/supportRoutes'));
app.use('/api/reports', generalLimiter, require('./routes/reportRoutes'));
app.use('/api/admin', generalLimiter, require('./routes/adminRoutes'));

// ─────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Local development server
// Vercel uses the exported Express app instead.
// ─────────────────────────────────────────────────────────────

if (!isVercel) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      startReminderScheduler();

      app.listen(PORT, () => {
        console.log(
          `FitPulse server running in ${
            process.env.NODE_ENV || 'development'
          } mode on port ${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error('Server startup failed:', error);
      process.exit(1);
    });
}

// Export Express app for Vercel
module.exports = app;
