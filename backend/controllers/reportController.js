const { handleError, isValidDate } = require('../utils/helpers');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');
const User = require('../models/User');

const TYPES = ['all', 'workouts', 'nutrition', 'progress'];

// @desc    Get complete report data for export (PDF/CSV/print)
// @route   GET /api/reports/export?startDate=&endDate=&type=
const getExportReportData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const type = TYPES.includes(req.query.type) ? req.query.type : 'all';
    const userId = req.user._id;

    const range = {};
    if (startDate) {
      if (!isValidDate(startDate)) return res.status(400).json({ message: 'Invalid start date' });
      range.$gte = new Date(`${startDate}`.length === 10 ? `${startDate}T00:00:00` : startDate);
    }
    if (endDate) {
      if (!isValidDate(endDate)) return res.status(400).json({ message: 'Invalid end date' });
      // make the end date inclusive of the whole day
      const end = new Date(`${endDate}`.length === 10 ? `${endDate}T00:00:00` : endDate);
      end.setHours(23, 59, 59, 999);
      range.$lte = end;
    }
    if (range.$gte && range.$lte && range.$gte > range.$lte) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    const dateFilter = Object.keys(range).length ? { date: range } : {};

    const user = await User.findById(userId).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const wantWorkouts = type === 'all' || type === 'workouts';
    const wantNutrition = type === 'all' || type === 'nutrition';
    const wantProgress = type === 'all' || type === 'progress';

    const [workouts, nutrition, progress] = await Promise.all([
      wantWorkouts ? Workout.find({ user: userId, ...dateFilter }).sort({ date: -1 }).lean() : [],
      wantNutrition ? Nutrition.find({ user: userId, ...dateFilter }).sort({ date: -1 }).lean() : [],
      wantProgress ? Progress.find({ user: userId, ...dateFilter }).sort({ date: 1 }).lean() : [],
    ]);

    const totalWorkoutMinutes = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
    const totalCaloriesBurned = workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
    const workoutDays = new Set(workouts.map((w) => new Date(w.date).toISOString().split('T')[0])).size;
    const workoutsByCategory = workouts.reduce((acc, w) => {
      const cat = w.category || 'Strength';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const totalCaloriesConsumed = nutrition.reduce((acc, n) => acc + (n.calories || 0), 0);
    const totalProtein = nutrition.reduce((acc, n) => acc + (n.protein || 0), 0);
    const totalCarbs = nutrition.reduce((acc, n) => acc + (n.carbs || 0), 0);
    const totalFats = nutrition.reduce((acc, n) => acc + (n.fats || 0), 0);
    const distinctDays = new Set(nutrition.map((n) => new Date(n.date).toISOString().split('T')[0])).size;
    const avgDailyCalories = distinctDays > 0 ? Math.round(totalCaloriesConsumed / distinctDays) : 0;
    const latestProgress = progress.length ? progress[progress.length - 1] : null;

    res.json({
      generatedAt: new Date(),
      type,
      range: { startDate: startDate || null, endDate: endDate || null },
      user: {
        name: user.name,
        email: user.email,
        currentWeight: latestProgress ? latestProgress.weight : user.weight,
        targetWeight: user.targetWeight,
        height: user.height,
        goal: user.fitnessGoal,
      },
      summary: {
        totalWorkouts: workouts.length,
        workoutDays,
        totalWorkoutMinutes,
        totalCaloriesBurned,
        workoutsByCategory,
        totalMealsLogged: nutrition.length,
        totalCaloriesConsumed,
        totalProtein,
        totalCarbs,
        totalFats,
        avgDailyCalories,
        progressEntries: progress.length,
      },
      workouts,
      nutrition,
      progress,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getExportReportData };
