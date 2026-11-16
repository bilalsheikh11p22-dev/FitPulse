const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['workout_completion', 'goal_achievement', 'follower', 'forum_reply', 'system', 'reminder'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
    // Optional idempotency key (e.g. "reminder:<id>:<occurrence>"). The unique sparse index guarantees the same
    // event can never produce two notifications, even if two server processes race.
    dedupeKey: {
      type: String,
      index: { unique: true, sparse: true },
    },
  },
  { timestamps: true }
);

// Most queries: user's unread notifications sorted by date
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
