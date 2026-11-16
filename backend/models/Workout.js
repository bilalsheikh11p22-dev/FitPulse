const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  weight: { type: Number, default: 0 }, // in kg
  duration: { type: Number, default: 0 }, // in seconds/minutes if cardio
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: true },
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Workout title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Flexibility', 'Crossfit'],
      default: 'Strength',
    },
    duration: {
      type: Number, // total minutes
      required: true,
      default: 45,
    },
    caloriesBurned: {
      type: Number,
      default: 300,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

// Index: all user queries filter by user + sort by date — compound index serves both
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
