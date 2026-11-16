const { handleError, calculateStreak, parseTzOffset, localDayRange } = require('../utils/helpers');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');
const Goal = require('../models/Goal');
const { syncGoalStatuses, withProgress } = require('./reminderController');
const A = require('../utils/analytics');

// @desc    Get dashboard summary
// @route   GET /api/analytics/dashboard
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    
    // Total calories & minutes
    const workoutStats = await Workout.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$caloriesBurned' },
        },
      },
    ]);

    const totalDuration = workoutStats.length > 0 ? workoutStats[0].totalDuration : 0;
    const totalCaloriesBurned = workoutStats.length > 0 ? workoutStats[0].totalCalories : 0;

    // Today's nutrition
    // "Today" is the user's local day (the browser sends its timezone offset as ?tzOffset=)
    const now = new Date();
    const tzOffset = parseTzOffset(req.query.tzOffset, now.getTimezoneOffset());
    const { start: startOfToday, end: endOfToday } = localDayRange(now, tzOffset);

    const todayNutrition = await Nutrition.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFats: { $sum: '$fats' },
        },
      },
    ]);

    const dailyNutrition = todayNutrition.length > 0 ? todayNutrition[0] : {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    };

    // Recent workouts
    const recentWorkouts = await Workout.find({ user: userId })
      .sort({ date: -1 })
      .limit(4)
      .lean();

    // Recent nutrition
    const recentNutrition = await Nutrition.find({ user: userId })
      .sort({ date: -1 })
      .limit(4)
      .lean();

    // Latest progress
    const latestProgress = await Progress.findOne({ user: userId }).sort({ date: -1 });

    // Goals: refresh overdue state first so "active" is accurate, then count by status
    await syncGoalStatuses(userId, now);
    const activeGoals = (await Goal.find({ user: userId, status: 'in_progress' }).sort({ deadline: 1 }).limit(3)).map(withProgress);
    const [activeCount, completedCount, overdueCount] = await Promise.all(
      ['in_progress', 'completed', 'overdue'].map((status) => Goal.countDocuments({ user: userId, status }))
    );

    // Workout streak from real workout dates (consecutive days, ending today or yesterday)
    const workoutDates = await Workout.find({ user: userId }).select('date').lean();
    const streak = calculateStreak(workoutDates.map((w) => w.date), now, tzOffset);

    res.json({
      totalWorkouts,
      totalDuration,
      totalCaloriesBurned,
      dailyNutrition,
      recentWorkouts,
      recentNutrition,
      latestProgress,
      activeGoals,
      goalStats: { active: activeCount, completed: completedCount, overdue: overdueCount },
      streak,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get detailed analytics for a date range, computed from the authenticated user's records only
// @route   GET /api/analytics/charts?range=7d|30d|90d|6m|1y|all&granularity=auto|day|week|month&tzOffset=
const getAnalyticsCharts = async (req, res) => {
  try {
    const userId = req.user._id;
    const range = req.query.range === undefined ? '7d' : String(req.query.range);
    const requestedGran = req.query.granularity === undefined ? 'auto' : String(req.query.granularity);
    if (!A.RANGES.includes(range)) return res.status(400).json({ message: `Invalid range. Use one of: ${A.RANGES.join(', ')}` });
    if (!A.GRANULARITIES.includes(requestedGran)) return res.status(400).json({ message: 'Invalid granularity' });

    const now = new Date();
    const tz = parseTzOffset(req.query.tzOffset, now.getTimezoneOffset());

    // Earliest record (only needed for "all time")
    let earliest = null;
    if (range === 'all') {
      const firsts = await Promise.all([Workout, Nutrition, Progress].map((M) => M.findOne({ user: userId }).sort({ date: 1 }).select('date').lean()));
      const times = firsts.filter((f) => f && f.date).map((f) => new Date(f.date).getTime());
      earliest = times.length ? Math.min(...times) : null;
    }

    const win = A.resolveWindow({ range, tzOffset: tz, now, earliest });
    const gran = A.pickGranularity(requestedGran, win.spanDays);
    // Records dated in the future are never counted
    const dateFilter = { $gte: A.idxToInstant(win.startIdx, tz), $lte: new Date(A.idxToInstant(win.todayIdx + 1, tz).getTime() - 1) };

    const [workouts, meals, progressRows] = await Promise.all([
      Workout.find({ user: userId, date: dateFilter }).select('category duration caloriesBurned date exercises').lean(),
      Nutrition.find({ user: userId, date: dateFilter }).select('mealType calories protein carbs fats date').lean(),
      Progress.find({ user: userId, date: dateFilter }).select('date weight bodyMeasurements performanceMetrics').lean(),
    ]);

    const progress = A.buildProgress(progressRows);
    const mealDistribution = A.countBy(meals, 'mealType', 'calories').map((m) => ({ name: m.name, value: m.value, calories: Math.round(m.calories) }));

    res.json({
      range,
      granularity: gran,
      startDate: A.idxToInstant(win.startIdx, tz).toISOString(),
      endDate: now.toISOString(),
      days: win.spanDays,
      summary: {
        workouts: A.summarizeWorkouts(workouts, win.spanDays, tz),
        nutrition: A.summarizeNutrition(meals, tz),
        progress: progress.summary,
      },
      workoutTrends: A.buildWorkoutSeries(workouts, win, gran, tz),
      weeklyActivity: A.buildWorkoutSeries(workouts, win, 'week', tz).slice(-12),
      monthlyActivity: A.buildWorkoutSeries(workouts, win, 'month', tz).slice(-12),
      nutritionTrends: A.buildNutritionSeries(meals, win, gran, tz),
      weightHistory: progress.history,
      categoryBreakdown: A.countBy(workouts, 'category').map((c) => ({ name: c.name, value: c.value })),
      mealDistribution,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getDashboardSummary,
  getAnalyticsCharts,
};
