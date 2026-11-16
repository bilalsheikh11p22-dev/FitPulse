import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Img from '../components/ui/Img';
import { IMAGES } from '../data/images';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  Clock, 
  Target, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';
import api from '../api/api';
import { toNumber, toArray, fmt, fmtDate, getErrorMessage, goalProgress } from '../utils/normalize';
import useFlash from '../utils/useFlash';
import { announceNotifications } from '../utils/notificationEvents';
import WorkoutModal from '../components/WorkoutModal';
import NutritionModal from '../components/NutritionModal';
import ProgressModal from '../components/ProgressModal';

// --- Email Verification Banner ---
function VerificationBanner({ onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [bannerError, setBannerError] = useState('');

  const handleResend = useCallback(async () => {
    setBannerError('');
    setSending(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
    } catch (err) {
      setBannerError(err?.response?.data?.message || 'Could not resend. Please try again.');
    } finally {
      setSending(false);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
      <div className="flex-1 space-y-1.5">
        {sent ? (
          <p className="font-semibold text-emerald-400">
            ✓ Verification email sent! Check your inbox (or backend console in dev mode).
          </p>
        ) : (
          <>
            <p className="font-semibold text-amber-300">Email not verified</p>
            <p className="text-amber-200/70">
              Verify your email to secure your account.{' '}
              <button
                onClick={handleResend}
                disabled={sending}
                className="underline font-semibold text-amber-300 hover:text-amber-100 transition disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Resend verification email'}
              </button>
            </p>
            {bannerError && <p className="text-red-400">{bannerError}</p>}
          </>
        )}
      </div>
      <button
        onClick={() => { setDismissed(true); onDismiss?.(); }}
        className="text-amber-400/60 hover:text-amber-200 transition flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, flash] = useFlash();

  // Modals
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/analytics/dashboard', { params: { tzOffset: new Date().getTimezoneOffset() } });
      setData(res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : null);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateWorkout = async (formData) => {
    // errors propagate to the modal, which stays open and shows the message
    await api.post('/workouts', formData);
    await fetchDashboard();
    flash('Workout saved. Dashboard updated.');
    announceNotifications(); // a new workout creates a notification
  };

  const handleCreateNutrition = async (formData) => {
    // errors propagate to the modal, which stays open and shows the message
    await api.post('/nutrition', formData);
    await fetchDashboard();
    flash('Meal saved. Dashboard updated.');
  };

  const handleCreateProgress = async (formData) => {
    // errors propagate to the modal, which stays open and shows the message
    await api.post('/progress', formData);
    refreshUser();
    await fetchDashboard();
    flash('Check-in saved. Dashboard updated.');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading your fitness dashboard...</p>
        </div>
      </div>
    );
  }

  // The User model has no calorie / macro target fields, so no target is invented.
  const calorieTarget = 0;
  const consumedCalories = toNumber(data?.dailyNutrition?.totalCalories);
  const caloriePercent = calorieTarget > 0 ? Math.min(Math.round((consumedCalories / calorieTarget) * 100), 100) : 0;
  const streak = toNumber(data?.streak);
  const currentWeight = toNumber(data?.latestProgress?.weight, 0) || toNumber(user?.weight, 0);
  const recentWorkouts = toArray(data?.recentWorkouts);
  const recentNutrition = toArray(data?.recentNutrition);
  const activeGoals = toArray(data?.activeGoals);
  const goalStats = {
    completed: toNumber(data?.goalStats?.completed),
    overdue: toNumber(data?.goalStats?.overdue),
  };

  return (
    <div className="page-stagger max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner & Quick Actions */}
      <div className="relative isolate overflow-hidden p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Img src={IMAGES.gymDark} alt="" eager className="absolute inset-0 -z-20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-brand-500/30 blur-[100px] -z-10" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>{streak > 0 ? `${streak} Day Active Workout Streak` : 'No active workout streak yet'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#fff]">
            Welcome back, {user?.name || 'Athlete'}! 💪
          </h1>
          <p className="text-xs sm:text-sm text-[#cbd5e1]">
            Goal: <span className="text-brand-400 capitalize font-medium">{user?.fitnessGoal?.replace('_', ' ') || '--'}</span> • 
            Target Weight: <span className="text-[#fff] font-medium">{user?.targetWeight ?? '--'} kg</span>
          </p>
        </div>

        {/* Quick Log Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setWorkoutModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition shadow-lg shadow-brand-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Workout</span>
          </button>

          <button
            onClick={() => setNutritionModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur text-[#fff] text-xs font-semibold hover:bg-black/70 transition flex items-center gap-1.5 border border-[#fff]/20"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Meal</span>
          </button>

          <button
            onClick={() => setProgressModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur text-[#fff] text-xs font-semibold hover:bg-black/70 transition flex items-center gap-1.5 border border-[#fff]/20"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Check-in</span>
          </button>
        </div>
      </div>

      {/* Email Verification Banner */}
      {user && user.isEmailVerified === false && (
        <VerificationBanner onDismiss={() => refreshUser()} />
      )}

      {success && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Workouts</p>
            <h3 className="text-2xl font-bold text-white mt-1">{fmt(data?.totalWorkouts)}</h3>
            <p className="text-[11px] text-brand-400 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Lifetime logs</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Active Time</p>
            <h3 className="text-2xl font-bold text-white mt-1">{fmt(data?.totalDuration)} <span className="text-sm font-normal text-slate-400">min</span></h3>
            <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Total duration</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Calories Burned</p>
            <h3 className="text-2xl font-bold text-white mt-1">{fmt(data?.totalCaloriesBurned)} <span className="text-sm font-normal text-slate-400">kcal</span></h3>
            <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>From training</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Current Body Weight</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {currentWeight > 0 ? fmt(currentWeight, 1) : '--'} <span className="text-sm font-normal text-slate-400">kg</span>
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Target: {user?.targetWeight ?? '--'} kg</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Nutrition Daily Target Progress & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Nutrition Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Today's Nutrition Accounting</h3>
            </div>
            <Link to="/nutrition" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
              <span>View Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Calorie Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">{calorieTarget > 0 ? 'Daily Calorie Target:' : 'Daily target not set'}</span>
              <span className="font-bold text-white">
                {fmt(consumedCalories)} kcal{calorieTarget > 0 ? ` / ${calorieTarget} kcal (${caloriePercent}%)` : ''}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-brand-400 rounded-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>

          {/* Macros 3 Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-[11px] text-red-400 font-semibold">Protein</p>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {fmt(data?.dailyNutrition?.totalProtein)}g
              </h4>
              <p className="text-[10px] text-slate-500">Target not set</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-[11px] text-cyan-400 font-semibold">Carbohydrates</p>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {fmt(data?.dailyNutrition?.totalCarbs)}g
              </h4>
              <p className="text-[10px] text-slate-500">Target not set</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-[11px] text-yellow-400 font-semibold">Healthy Fats</p>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {fmt(data?.dailyNutrition?.totalFats)}g
              </h4>
              <p className="text-[10px] text-slate-500">Target not set</p>
            </div>
          </div>
        </div>

        {/* Active Goals Column */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Active Goals</h3>
            </div>
            <Link to="/reminders" className="text-xs text-brand-400 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {activeGoals.length > 0 ? (
              activeGoals.map((goal) => {
                const progressPct = goalProgress(goal);
                return (
                  <div key={goal._id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{goal.title}</span>
                      <span className="text-purple-400 font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{goal.currentValue} {goal.unit}</span>
                      <span>Target: {goal.targetValue} {goal.unit}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No active goals yet. Set one in Reminders!</p>
            )}
            {goalStats.completed + goalStats.overdue > 0 && (
              <p className="text-[10px] text-slate-500">
                {goalStats.completed} completed{goalStats.overdue > 0 ? ` • ${goalStats.overdue} overdue` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recent Workouts & Nutrition Logs Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-brand-400" />
              <h3 className="text-base font-bold text-white">Recent Workouts</h3>
            </div>
            <Link to="/workouts" className="text-xs text-brand-400 hover:underline">
              All Workouts
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((w) => (
                <div
                  key={w._id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white">{w.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      {w.category} • {w.duration} mins • {w.exercises?.length || 0} exercises
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                      {w.caloriesBurned} kcal
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {fmtDate(w.date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No workouts logged yet.</p>
            )}
          </div>
        </div>

        {/* Recent Meals */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Recent Nutrition Entries</h3>
            </div>
            <Link to="/nutrition" className="text-xs text-brand-400 hover:underline">
              All Meals
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentNutrition.length > 0 ? (
              recentNutrition.map((m) => (
                <div
                  key={m._id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">
                        {m.mealType}
                      </span>
                      <h4 className="text-xs font-semibold text-white">{m.foodName}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      P: {m.protein}g • C: {m.carbs}g • F: {m.fats}g
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">
                      {m.calories} kcal
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {fmtDate(m.date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No nutrition logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        onSave={handleCreateWorkout}
      />
      <NutritionModal
        isOpen={nutritionModalOpen}
        onClose={() => setNutritionModalOpen(false)}
        onSave={handleCreateNutrition}
      />
      <ProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        onSave={handleCreateProgress}
      />
    </div>
  );
}
