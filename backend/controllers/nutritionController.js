const { handleError, escapeRegex, toNumber, isValidDate, parseTzOffset, localDayRange } = require('../utils/helpers');
const Nutrition = require('../models/Nutrition');

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

// Returns an error message or null for the numeric macro fields that are present
const validateMacros = (b) => {
  for (const key of ['quantity', 'calories', 'protein', 'carbs', 'fats']) {
    if (b[key] !== undefined && b[key] !== '' && !(Number.isFinite(Number(b[key])) && Number(b[key]) >= 0)) {
      return `${key} must be a non-negative number`;
    }
  }
  return null;
};

// @desc    Get nutrition logs
// @route   GET /api/nutrition
const getNutritionLogs = async (req, res) => {
  try {
    const { mealType, date, search, limit } = req.query;
    const query = { user: req.user._id };

    if (mealType && mealType !== 'All') query.mealType = String(mealType);

    if (date) {
      if (!isValidDate(date)) return res.status(400).json({ message: 'Invalid date filter' });
      // day boundaries in the user's local timezone (?tzOffset= minutes, like Date#getTimezoneOffset)
      const base = new Date(`${date}`.length === 10 ? `${date}T12:00:00Z` : date);
      const { start, end } = localDayRange(base, parseTzOffset(req.query.tzOffset, base.getTimezoneOffset()));
      query.date = { $gte: start, $lte: end };
    }

    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ foodName: rx }, { notes: rx }];
    }

    const nutritionQuery = Nutrition.find(query).sort({ date: -1 });
    const lim = parseInt(limit, 10);
    if (lim > 0) nutritionQuery.limit(Math.min(lim, 500));

    res.json(await nutritionQuery.exec());
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Add a nutrition log
// @route   POST /api/nutrition
const addNutritionLog = async (req, res) => {
  try {
    const { mealType, foodName, quantity, unit, calories, protein, carbs, fats, notes, date } = req.body;

    if (!MEAL_TYPES.includes(mealType)) return res.status(400).json({ message: 'Meal type is required' });
    if (typeof foodName !== 'string' || !foodName.trim()) return res.status(400).json({ message: 'Food name is required' });
    if (date !== undefined && date !== '' && !isValidDate(date)) return res.status(400).json({ message: 'Invalid date' });
    const macroError = validateMacros(req.body);
    if (macroError) return res.status(400).json({ message: macroError });

    const log = new Nutrition({
      user: req.user._id,
      mealType,
      foodName: foodName.trim(),
      quantity: toNumber(quantity, 1) || 1,
      unit: typeof unit === 'string' && unit.trim() ? unit.trim() : 'serving',
      calories: toNumber(calories, 0),
      protein: toNumber(protein, 0),
      carbs: toNumber(carbs, 0),
      fats: toNumber(fats, 0),
      notes: typeof notes === 'string' ? notes : '',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(await log.save());
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update a nutrition log
// @route   PUT /api/nutrition/:id
const updateNutritionLog = async (req, res) => {
  try {
    const log = await Nutrition.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ message: 'Nutrition entry not found' });

    const { mealType, foodName, quantity, unit, calories, protein, carbs, fats, notes, date } = req.body;

    if (mealType !== undefined && !MEAL_TYPES.includes(mealType)) return res.status(400).json({ message: 'Invalid meal type' });
    if (foodName !== undefined && (typeof foodName !== 'string' || !foodName.trim())) return res.status(400).json({ message: 'Food name cannot be empty' });
    if (date !== undefined && date !== '' && !isValidDate(date)) return res.status(400).json({ message: 'Invalid date' });
    const macroError = validateMacros(req.body);
    if (macroError) return res.status(400).json({ message: macroError });

    if (mealType !== undefined) log.mealType = mealType;
    if (foodName !== undefined) log.foodName = foodName.trim();
    if (quantity !== undefined) log.quantity = toNumber(quantity, log.quantity);
    if (unit) log.unit = String(unit);
    if (calories !== undefined) log.calories = toNumber(calories, 0);
    if (protein !== undefined) log.protein = toNumber(protein, 0);
    if (carbs !== undefined) log.carbs = toNumber(carbs, 0);
    if (fats !== undefined) log.fats = toNumber(fats, 0);
    if (notes !== undefined) log.notes = typeof notes === 'string' ? notes : '';
    if (date) log.date = new Date(date);

    res.json(await log.save());
  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete a nutrition log
// @route   DELETE /api/nutrition/:id
const deleteNutritionLog = async (req, res) => {
  try {
    const log = await Nutrition.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ message: 'Nutrition entry not found' });
    res.json({ message: 'Nutrition entry deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getNutritionLogs, addNutritionLog, updateNutritionLog, deleteNutritionLog };
