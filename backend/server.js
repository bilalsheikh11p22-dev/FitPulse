const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startReminderScheduler } = require('./utils/reminderScheduler');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Using an insecure development fallback - set it in backend/.env');
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

// Connect to MongoDB
connectDB().then(() => startReminderScheduler());

const app = express();

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
// Carefully configured so that existing CDN fonts, Unsplash images, recharts,
// framer-motion, and the Vite dev server all continue to work.
app.use(
  helmet({
    contentSecurityPolicy: false,       // Disabled: would need a full allow-list for all CDN assets
    crossOriginEmbedderPolicy: false,   // Disabled: Unsplash images are cross-origin
  })
);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow only the configured frontend origin (defaults to localhost for dev).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true,
  })
);

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Rate Limiters ─────────────────────────────────────────────────────────────
// Strict limiter for auth endpoints most likely to be brute-forced
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts from this IP, please try again in 15 minutes.' },
  skip: () => process.env.NODE_ENV === 'test',
});

// General API limiter — prevents automated scraping and DoS
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again shortly.' },
  skip: () => process.env.NODE_ENV === 'test',
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FitPulse API is operating smoothly' });
});

// ── Routes ────────────────────────────────────────────────────────────────────
// Auth endpoints get the strict rate limiter
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

// All other API endpoints share the general limiter
app.use('/api/users',         generalLimiter, require('./routes/userRoutes'));
app.use('/api/workouts',      generalLimiter, require('./routes/workoutRoutes'));
app.use('/api/nutrition',     generalLimiter, require('./routes/nutritionRoutes'));
app.use('/api/progress',      generalLimiter, require('./routes/progressRoutes'));
app.use('/api/analytics',     generalLimiter, require('./routes/analyticsRoutes'));
app.use('/api/notifications', generalLimiter, require('./routes/notificationRoutes'));
app.use('/api/reminders',     generalLimiter, require('./routes/reminderRoutes'));
app.use('/api/support',       generalLimiter, require('./routes/supportRoutes'));
app.use('/api/reports',       generalLimiter, require('./routes/reportRoutes'));
app.use('/api/admin',         generalLimiter, require('./routes/adminRoutes'));

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
