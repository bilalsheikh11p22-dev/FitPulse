const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitness_tracker_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Existing accounts that were given the old stock default picture are reset to "no picture"
    // so they show initials like new accounts do. Safe to run repeatedly.
    try {
      const User = require('../models/User');
      const { LEGACY_DEFAULT_AVATARS } = require('../utils/helpers');
      const r = await User.updateMany({ avatar: { $in: LEGACY_DEFAULT_AVATARS } }, { $set: { avatar: '' } });
      if (r.modifiedCount) console.log(`Cleared legacy default avatar on ${r.modifiedCount} account(s)`);
    } catch (e) {
      console.warn('[DB] Legacy avatar cleanup skipped:', e.message);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
