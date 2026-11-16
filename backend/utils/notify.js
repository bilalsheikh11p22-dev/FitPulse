const Notification = require('../models/Notification');

// Create a notification for `user`. If `dedupeKey` is given the event can only ever notify once:
// a duplicate-key error (E11000) is treated as "already notified" and returns null.
// Notification failures never break the action that triggered them.
const createNotification = async ({ user, title, message, type = 'system', link = '', dedupeKey }) => {
  try {
    const doc = { user, title, message, type, link };
    if (dedupeKey) doc.dedupeKey = dedupeKey;
    return await Notification.create(doc);
  } catch (error) {
    if (error && error.code === 11000) return null;
    console.error('Could not create notification:', error.message || error);
    return null;
  }
};

module.exports = { createNotification };
