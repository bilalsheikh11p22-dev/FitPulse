const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['workout', 'meal', 'water', 'goal', 'supplement', 'weight', 'general'],
      default: 'workout',
    },
    time: {
      type: String, // e.g. "07:30" or "18:00"
      required: true,
    },
    days: [
      {
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String, // the reminder's description
      default: '',
    },
    // Repeat mode. 'custom' (the original behaviour) = every selected weekday in `days`.
    repeat: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'custom'],
      default: 'custom',
    },
    // One-time reminders only: local calendar date "YYYY-MM-DD" (interpreted in `timezone`)
    runDate: {
      type: String,
      default: '',
    },
    // IANA timezone the `time` / `days` are expressed in (captured from the browser when created)
    timezone: {
      type: String,
      default: 'UTC',
    },
    // Scheduler state
    lastTriggeredAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

reminderSchema.index({ user: 1 });
reminderSchema.index({ isActive: 1, nextTrigger: 1 }); // used by the reminder scheduler

module.exports = mongoose.model('Reminder', reminderSchema);
