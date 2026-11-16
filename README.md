# FitPulse Pro - MERN Fitness Tracker

> Complete Full-Stack Web Application built according to the **Aptech MERN Fitness Tracker eProject SRS Specification** with **Public Pages**, **User Panel**, and **Dedicated Admin Panel** featuring **Rich Framer Motion Scroll Animations**.

---

## 🚀 Live Local Endpoints

- **Frontend Application**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **Backend REST API**: [http://127.0.0.1:5001/api](http://127.0.0.1:5001/api)
- **Health Check**: [http://127.0.0.1:5001/api/health](http://127.0.0.1:5001/api/health)

---

## 🔑 Pre-Seeded Credentials (1-Click Auto Fill Available)

### 1. Administrator Portal (`/admin/login`)
- **Email / Username**: `admin@fitpulse.com` (or `admin`)
- **Password**: `adminpassword123`
- **Role**: `admin` (Full access to Admin Console, user moderation, reports & notifications)

### 2. User Account (`/login`)
- **Email / Username**: `demo@fitpulse.com` (or `alexfit`)
- **Password**: `password123`
- **Role**: `user` (Personalized workouts, nutrition, PRs, and reports)

---

## 🗺️ Complete Application Map & Route Structure

### 1. Public Pages (Accessible to Guests without Login)
| Route | Page | Purpose & Features |
|---|---|---|
| `/` | **Home / Landing** | Hero section with Framer Motion scroll parallax, live widget mockup, animated metrics counters, testimonials. |
| `/about` | **About** | Mission statement, MERN technical architecture, data integrity & security commitment. |
| `/features` | **Features** | Comprehensive breakdown of workout tracking, macro distribution, PRs, clinical reports, and admin oversight. |
| `/contact` | **Contact & Support** | Guest inquiry submission form, email/phone hotline, academic center details, and SLA metrics. |
| `/login` | **User Login** | Secure entry with 1-Click Demo Auto-Fill. |
| `/register` | **User Registration** | Account creation with age, gender, height, weight, activity level, and fitness objectives. |

### 2. User Panel (Protected for Authenticated Athletes)
| Route | Page | Purpose & Features |
|---|---|---|
| `/dashboard` | **Dashboard** | Active workout streak calculated from real workout dates, daily calorie progress ring, quick log modals, active goals. |
| `/workouts` | **Workouts (CRUD)** | Create, edit, delete routines. Track exercise sets, reps, and kg weights with category filters. |
| `/nutrition` | **Nutrition** | Log Breakfast, Lunch, Dinner, Snacks. Calculate total calories, protein, carbs, and fats. |
| `/progress` | **Progress** | Body weight trajectory line chart, circumference table (chest, waist, arms), and 1RM strength PRs. |
| `/analytics` | **Analytics** | Interactive Recharts: 7-day workout frequency, caloric intake area chart, macro split donut. |
| `/goals-reminders` | **Goals & Reminders**| Scheduled workout & meal prompts with toggle switches and milestone goal progress bars. |
| `/notifications` | **Notifications** | Real-time activity alerts: workout completion, goal achievement, community followers. |
| `/reports` | **Reports & Export** | One-Click PDF export using `jsPDF` and spreadsheet CSV download for coaches/clinicians. |
| `/profile` | **User Profile** | Personalized biometrics card, bio, target weight, and community athlete search. |
| `/settings` | **Settings** | Dark/Light theme toggle, metric/imperial unit converter, and GDPR data export (JSON). |
| `/support` | **Support & Feedback** | Interactive support ticket desk with reply messaging threads and 5-star user review ratings. |

### 3. Admin Panel (Protected by `AdminRoute` and `adminOnly` Middleware)
| Route | Page | Purpose & Features |
|---|---|---|
| `/admin/login` | **Admin Portal Login** | Dedicated admin authentication entry with 1-Click Auto-Fill. |
| `/admin/dashboard` | **Admin Dashboard** | System-wide statistics: total users, active vs suspended, total workouts, nutrition logs, pending tickets. |
| `/admin/users` | **User Management** | Search, filter by role/status, inspect user activity, activate/deactivate accounts, toggle admin roles, delete users. |
| `/admin/workouts` | **Workout Management** | Audit and moderate all user workout routines across the platform; delete improper entries. |
| `/admin/nutrition` | **Nutrition Management**| Audit food logs across all users; filter by meal type and inspect macronutrient counts. |
| `/admin/progress` | **Progress Monitoring** | Monitor platform-wide weight check-ins, body circumferences, and lifting PRs. |
| `/admin/reports` | **System Reports** | Generate system-level audit reports with one-click PDF and CSV download. |
| `/admin/support` | **Ticket Management** | Review user tickets, update status (open/in progress/resolved), and reply directly as Administrator. |
| `/admin/feedback` | **Feedback Reviews** | Audit all user review ratings (1-5 stars) and user sentiment comments. |
| `/admin/notifications`| **System Broadcaster** | Broadcast announcements, maintenance alerts, or tips to all active users simultaneously. |
| `/admin/settings` | **Admin Settings** | Admin master credentials management, server health audit, and database status check. |

---

## 🛠️ Technology Stack Architecture

### Frontend
- **React.js 18** (Vite bundler)
- **Tailwind CSS 3** (Custom dark/light theme, glassmorphism)
- **Framer Motion** (Scroll parallax, viewport animations, staggered transitions)
- **Recharts** (Interactive data analytics charts)
- **jsPDF & jsPDF-AutoTable** (Clinical PDF export)
- **Lucide React** (Clean modern icons)
- **Canvas-Confetti** (Workout completion celebrations)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Full schema models for User, Workout, Nutrition, Progress, Goal, Notification, Reminder, SupportTicket, Feedback)
- **JWT (JSON Web Tokens)** & **bcryptjs** (Secure authentication and password hashing)
- **Role-Based Access Control (RBAC)** (`adminOnly` middleware)
- **CORS & Morgan** (Logging & cross-origin handling)

---

## 🏃 How to Run the Project

### 1. Backend Server
```bash
cd backend
npm install
npm run seed     # Seeds Administrator + Demo Athletes + Workouts + Nutrition + Progress
npm start        # Starts Express server on port 5001
```

### 2. Frontend Server
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://127.0.0.1:5173
```

---

## UI Redesign (Nov 2026)

- New orange/charcoal brand theme (see `frontend/tailwind.config.js` + `src/index.css` tokens). Dark by default, working light mode via the navbar toggle.
- Photos live in one file: `frontend/src/data/images.js` (Unsplash URLs). Replace with local files from `public/images/` if you want offline images.
- Reusable UI helpers: `components/ui/` (`Img`, `Reveal`, `Counter`, `PageHero`, `AuthShell`).
- Redesigned: Navbar, Footer, Landing, About/Features/Contact banners, Login/Register/Admin login (split screen), Dashboard banner.
- Run: `cd frontend && npm install && npm run dev`

## Reminders, notifications & goals (Phase 3)

- **Scheduler:** `backend/utils/reminderScheduler.js` runs ONE interval per server process (started after MongoDB connects).
  It checks every 30 s (override with `REMINDER_CHECK_INTERVAL_MS` in `backend/.env`).
- **Timezone strategy:** each reminder stores the IANA timezone of the browser that created it, and `time`/`days`/`runDate`
  are interpreted in that timezone (DST-safe). `nextRunAt` (UTC) is stored on the reminder.
- **No duplicates:** every reminder notification carries a unique `dedupeKey` (reminder id + occurrence) and the reminder is
  advanced with a conditional update, so restarts, crashes and parallel processes cannot notify twice.
- **After a restart:** an occurrence missed by up to 6 h notifies once; older missed occurrences are skipped silently.
  Missed occurrences are never replayed in bulk. Disabled or deleted reminders are never processed.
- **Delivery:** in-app notifications only (bell badge polls every 60 s). There is no browser push, email or SMS.
- Goal progress is `(current - start) / (target - start)`, i.e. `current / target` when it starts at 0. The bar is clamped to 0-100%,
  the real value (e.g. 150%) is still shown.
