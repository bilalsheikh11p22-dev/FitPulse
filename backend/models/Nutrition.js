const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      required: [true, 'Meal type is required'],
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unit: {
      type: String,
      default: 'serving', // e.g. grams, serving, cup, oz
    },
    calories: {
      type: Number,
      required: true,
      default: 0,
    },
    protein: {
      type: Number, // in grams
      default: 0,
    },
    carbs: {
      type: Number, // in grams
      default: 0,
    },
    fats: {
      type: Number, // in grams
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

nutritionSchema.index({ user: 1, date: -1 });
nutritionSchema.index({ user: 1, mealType: 1 });

module.exports = mongoose.model('Nutrition', nutritionSchema);
