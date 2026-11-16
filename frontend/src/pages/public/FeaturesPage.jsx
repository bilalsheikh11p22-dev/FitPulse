import React from 'react';
import PageHero from '../../components/ui/PageHero';
import { IMAGES } from '../../data/images';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Zap,
  Sliders
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturesPage() {
  const featureList = [
    {
      title: "Routine Builder & Exercise Tracking",
      category: "Workout Management",
      desc: "Log exercises with exact sets, reps, and poundage. Tag workouts by muscle groups (Chest, Legs, Back) and categorize into Strength, Cardio, or HIIT routines.",
      icon: <Dumbbell className="w-6 h-6 text-brand-400" />,
      badges: ["Set-by-Set Logging", "1RM Calculations", "Rest Interval Notes", "Category Filters"],
    },
    {
      title: "Nutrition & Macronutrient Accounting",
      category: "Dietary Science",
      desc: "Log food intake across Breakfast, Lunch, Dinner, and Snacks. Automatically calculate calories, proteins, carbohydrates, and healthy fats against your daily caloric goal.",
      icon: <Apple className="w-6 h-6 text-emerald-400" />,
      badges: ["Meal Breakdown", "Protein Target Tracker", "Macro Distribution Donut", "Portion Multipliers"],
    },
    {
      title: "Body Measurements & Milestone PRs",
      category: "Physique Evolution",
      desc: "Record body weight, circumferences (waist, arms, chest, thighs), and personal bests in Bench Press, Back Squats, Deadlifts, and 5K running pace.",
      icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
      badges: ["Circumference Logging", "Strength Records", "Weight Trendline", "Historical Check-ins"],
    },
    {
      title: "Visual Performance Analytics",
      category: "Data Visualization",
      desc: "Interactive Recharts engine showing 7-day workout frequency, caloric intake vs burn balance, and long-term strength trajectories.",
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      badges: ["Frequency Bar Chart", "Caloric Area Graph", "Macro Donut Split", "Volume Load Metrics"],
    },
    {
      title: "PDF & CSV Data Reporting",
      category: "Clinical Reporting",
      desc: "Export formatted PDF progress reports on demand using jsPDF, or download complete spreadsheets in CSV format for coaching analysis and backup.",
      icon: <FileText className="w-6 h-6 text-amber-400" />,
      badges: ["One-Click PDF Export", "Full CSV Download", "Date-Range Filters", "Printable Records"],
    },
    {
      title: "Reminders & Scheduled Alerts",
      category: "Habit Automation",
      desc: "Stay consistent with automated prompts for workouts, protein shakes, and hydration with toggle switches and recurring day schedules.",
      icon: <Clock className="w-6 h-6 text-rose-400" />,
      badges: ["Weekly Recurrence", "Hydration Alerts", "Milestone Deadlines", "Push Notification Feed"],
    },
    {
      title: "Administrative Control Panel",
      category: "Enterprise System",
      desc: "Comprehensive Admin Panel to manage users, monitor workout and nutrition submissions, resolve support tickets, review feedback, and broadcast announcements.",
      icon: <Sliders className="w-6 h-6 text-indigo-400" />,
      badges: ["User Moderation", "System Stats", "Support Ticketing", "Broadcast Alerts"],
    },
    {
      title: "Security, Privacy & Preferences",
      category: "GDPR Compliance",
      desc: "Role-based access control, dark/light theme toggle, metric/imperial unit systems, and complete GDPR data export tools.",
      icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
      badges: ["Bcrypt Encryption", "JWT Verification", "Theme Engine", "Unit Converter"],
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <PageHero eyebrow="Features" title="Every tool you need to" highlight="perform at your best" subtitle="From set-by-set workout logging to detailed analytics and reports - explore everything FitPulse can do." image={IMAGES.gym} />
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureList.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                  {f.icon}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950 text-slate-300 border border-slate-800">
                  {f.category}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                  {f.desc}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                {f.badges.map((b) => (
                  <span
                    key={b}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-950 text-slate-400 border border-slate-800/80"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-950/60 via-slate-900 to-slate-900 border border-brand-500/30 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Ready to test these features?</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Log in with our instant Demo Account to explore all user and administrative modules immediately.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs hover:bg-brand-400 transition"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-xs hover:bg-slate-700 transition"
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
