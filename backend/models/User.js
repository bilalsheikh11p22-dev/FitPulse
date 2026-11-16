const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    // Empty by default: no stock / generated picture is ever assigned. The UI shows initials instead.
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'Fitness enthusiast working towards a healthier, stronger lifestyle!',
    },
    age: {
      type: Number,
      default: 25,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'male',
    },
    height: {
      type: Number, // in cm
      default: 175,
    },
    weight: {
      type: Number, // in kg
      default: 72,
    },
    targetWeight: {
      type: Number,
      default: 70,
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'very_active', 'extra_active'],
      default: 'moderate',
    },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'maintenance', 'general_fitness'],
      default: 'muscle_gain',
    },
    preferences: {
      unitSystem: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      reminderAlerts: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
