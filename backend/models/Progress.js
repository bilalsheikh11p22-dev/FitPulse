const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
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
    weight: {
      type: Number, // in kg
      required: true,
    },
    bodyMeasurements: {
      chest: { type: Number, default: 0 },
      waist: { type: Number, default: 0 },
      hips: { type: Number, default: 0 },
      arms: { type: Number, default: 0 },
      thighs: { type: Number, default: 0 },
    },
    performanceMetrics: {
      runningTime5k: { type: Number, default: 0 }, // in minutes
      benchPressMax: { type: Number, default: 0 }, // in kg
      squatMax: { type: Number, default: 0 }, // in kg
      deadliftMax: { type: Number, default: 0 }, // in kg
      pullUpsCount: { type: Number, default: 0 },
    },
    notes: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
