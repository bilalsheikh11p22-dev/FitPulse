const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['weight', 'workout', 'nutrition', 'running', 'strength', 'endurance', 'general'],
      default: 'weight',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    // Value when the goal was created; lets progress be computed for goals that decrease (e.g. weight loss)
    startValue: {
      type: Number,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'overdue'],
      default: 'in_progress',
    },
    // Set when the goal transitions to completed (also the idempotency anchor for the achievement notification)
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1 });

module.exports = mongoose.model('Goal', goalSchema);
