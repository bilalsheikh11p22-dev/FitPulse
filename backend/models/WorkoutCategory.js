const mongoose = require('mongoose');

// An exercise that belongs to a category (the admin-managed exercise library)
const libraryExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  muscleGroup: { type: String, default: '', trim: true, maxlength: 40 },
  equipment: { type: String, default: '', trim: true, maxlength: 40 },
  description: { type: String, default: '', trim: true, maxlength: 300 },
  // defaults pre-filled when a user picks this exercise in the workout form
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  weight: { type: Number, default: 0 },
});

const workoutCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    // lower-cased name: guarantees case-insensitive uniqueness
    nameKey: { type: String, required: true, unique: true },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    active: { type: Boolean, default: true },
    exercises: [libraryExerciseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkoutCategory', workoutCategorySchema);
