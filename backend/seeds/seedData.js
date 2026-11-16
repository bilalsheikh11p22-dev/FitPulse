const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');
const Reminder = require('../models/Reminder');
const SupportTicket = require('../models/SupportTicket');
const Feedback = require('../models/Feedback');

dotenv.config({ path: __dirname + '/../.env' });

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitness_tracker_db');
    console.log('MongoDB Connected for Seeding...');

    // Clean existing data
    await User.deleteMany();
    await Workout.deleteMany();
    await Nutrition.deleteMany();
    await Progress.deleteMany();
    await Goal.deleteMany();
    await Notification.deleteMany();
    await Reminder.deleteMany();
    await SupportTicket.deleteMany();
    await Feedback.deleteMany();

    console.log('Cleared existing collections...');

    // 1. Create Administrator
    const adminUser = await User.create({
      name: 'System Administrator',
      username: 'admin',
      email: 'admin@fitpulse.com',
      password: 'adminpassword123',
      role: 'admin',
      isActive: true,
      bio: 'Head Operations Administrator for FitPulse fitness tracking network.',
      age: 32,
      gender: 'male',
      height: 182,
      weight: 80,
      targetWeight: 80,
      activityLevel: 'very_active',
      fitnessGoal: 'general_fitness',
    });
    console.log(`Admin User created: ${adminUser.email} / adminpassword123`);

    // 2. Create Demo User
    const demoUser = await User.create({
      name: 'Alex Rivera',
      username: 'alexfit',
      email: 'demo@fitpulse.com',
      password: 'password123',
      role: 'user',
      isActive: true,
      bio: 'Hypertrophy & functional fitness athlete. Striving to hit a 120kg bench and run a sub-22 min 5K!',
      age: 26,
      gender: 'male',
      height: 178,
      weight: 74.5,
      targetWeight: 72.0,
      activityLevel: 'very_active',
      fitnessGoal: 'muscle_gain',
      preferences: {
        unitSystem: 'metric',
        theme: 'dark',
        emailNotifications: true,
        reminderAlerts: true,
      },
    });

    // 3. Create Additional User for Admin Management
    const secondUser = await User.create({
      name: 'Sarah Jenkins',
      username: 'sarahj',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'user',
      isActive: true,
      bio: 'Marathon trainee & runner.',
      age: 24,
      gender: 'female',
      height: 165,
      weight: 58,
      targetWeight: 56,
      activityLevel: 'very_active',
      fitnessGoal: 'endurance',
    });

    console.log(`Demo User created: ${demoUser.email} / password123`);

    // 2. Create Workouts
    const workoutsData = [
      {
        user: demoUser._id,
        title: 'Upper Body Hypertrophy (Chest & Triceps)',
        category: 'Strength',
        duration: 60,
        caloriesBurned: 450,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['Chest', 'Triceps', 'Hypertrophy'],
        notes: 'Felt strong on the incline bench. Hit a new personal record of 85kg for 4 reps!',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 80, notes: 'Good tempo and arch' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 30, notes: 'Deep stretch at bottom' },
          { name: 'Cable Chest Flyes', sets: 3, reps: 12, weight: 15, notes: 'Peak contraction 1s' },
          { name: 'Tricep Rope Pushdown', sets: 4, reps: 12, weight: 25, notes: 'Strict form' },
          { name: 'Overhead Tricep Extension', sets: 3, reps: 10, weight: 28, notes: 'Full elbow extension' },
        ],
      },
      {
        user: demoUser._id,
        title: 'Morning HIIT Sprint Intervals',
        category: 'HIIT',
        duration: 35,
        caloriesBurned: 380,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['Cardio', 'FatBurn', 'Endurance'],
        notes: 'Treadmill 30s sprint at 18km/h, 30s walk rest for 15 rounds.',
        exercises: [
          { name: 'Sprint Intervals', sets: 15, reps: 1, duration: 15, notes: 'Max effort sprints' },
          { name: 'Burpees with Jump', sets: 3, reps: 15, weight: 0, notes: 'Explosive jump' },
          { name: 'Mountain Climbers', sets: 3, reps: 30, weight: 0, notes: 'Fast cadence' },
        ],
      },
      {
        user: demoUser._id,
        title: 'Back & Bicep Power Day',
        category: 'Strength',
        duration: 55,
        caloriesBurned: 420,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tags: ['Back', 'Pull', 'Biceps'],
        notes: 'Deadlifts felt solid. Kept core tight and braced thoroughly.',
        exercises: [
          { name: 'Conventional Deadlift', sets: 4, reps: 5, weight: 130, notes: 'Heavy working sets' },
          { name: 'Weighted Pull-Ups', sets: 4, reps: 8, weight: 10, notes: 'Chest to bar' },
          { name: 'Barbell Bent Over Row', sets: 4, reps: 10, weight: 65, notes: '45 degree angle' },
          { name: 'EZ-Bar Bicep Curls', sets: 3, reps: 12, weight: 30, notes: 'Controlled negative' },
          { name: 'Hammer Curls', sets: 3, reps: 12, weight: 16, notes: 'Forearm and brachialis' },
        ],
      },
      {
        user: demoUser._id,
        title: 'Leg Day & Quad Focus',
        category: 'Strength',
        duration: 65,
        caloriesBurned: 520,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        tags: ['Legs', 'Quads', 'Glutes'],
        notes: 'Squats depth was below parallel. Finished with leg extensions till failure.',
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: 6, weight: 110, notes: 'Below parallel' },
          { name: 'Romanian Deadlift', sets: 4, reps: 10, weight: 80, notes: 'Hamstring stretch' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: 10, weight: 20, notes: 'Each leg' },
          { name: 'Standing Calf Raises', sets: 4, reps: 15, weight: 60, notes: 'Pause at top' },
        ],
      },
      {
        user: demoUser._id,
        title: 'Active Recovery Flow & Vinyasa Yoga',
        category: 'Yoga',
        duration: 40,
        caloriesBurned: 180,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ['Mobility', 'Flexibility', 'Recovery'],
        notes: 'Opened up hip flexors and thoracic spine. Feeling energized and flexible.',
        exercises: [
          { name: 'Sun Salutations', sets: 5, reps: 1, duration: 10, notes: 'Breath synchronization' },
          { name: 'Warrior Poses Flow', sets: 3, reps: 1, duration: 15, notes: 'Hold 5 breaths each' },
          { name: 'Pigeon Pose', sets: 2, reps: 1, duration: 10, notes: 'Hip opener' },
        ],
      },
    ];
    await Workout.insertMany(workoutsData);

    // 3. Create Nutrition logs
    const today = new Date();
    const nutritionData = [
      // Today's Meals
      {
        user: demoUser._id,
        date: today,
        mealType: 'Breakfast',
        foodName: 'Oatmeal with Blueberries & Whey Isolate',
        quantity: 1,
        unit: 'bowl',
        calories: 450,
        protein: 36,
        carbs: 58,
        fats: 8,
        notes: 'Added a teaspoon of chia seeds and cinnamon.',
      },
      {
        user: demoUser._id,
        date: today,
        mealType: 'Lunch',
        foodName: 'Grilled Chicken Breast, Brown Rice & Broccoli',
        quantity: 1,
        unit: 'meal',
        calories: 620,
        protein: 52,
        carbs: 65,
        fats: 12,
        notes: 'Seasoned with garlic and lemon olive oil.',
      },
      {
        user: demoUser._id,
        date: today,
        mealType: 'Snacks',
        foodName: 'Greek Yogurt with Almonds & Honey',
        quantity: 1,
        unit: 'cup',
        calories: 240,
        protein: 18,
        carbs: 22,
        fats: 9,
        notes: 'Pre-workout booster.',
      },
      {
        user: demoUser._id,
        date: today,
        mealType: 'Dinner',
        foodName: 'Baked Salmon with Sweet Potato & Asparagus',
        quantity: 1,
        unit: 'plate',
        calories: 580,
        protein: 44,
        carbs: 48,
        fats: 20,
        notes: 'Rich in omega-3 healthy fatty acids.',
      },
      // Previous days
      {
        user: demoUser._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        mealType: 'Breakfast',
        foodName: 'Egg White Omelet with Whole Wheat Toast',
        quantity: 1,
        unit: 'serving',
        calories: 390,
        protein: 32,
        carbs: 35,
        fats: 10,
        notes: '3 whole eggs + 2 whites, spinach and mushrooms.',
      },
      {
        user: demoUser._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        mealType: 'Lunch',
        foodName: 'Turkey & Avocado Quinoa Salad Bowl',
        quantity: 1,
        unit: 'bowl',
        calories: 550,
        protein: 45,
        carbs: 50,
        fats: 16,
        notes: 'Fresh olive oil dressing.',
      },
    ];
    await Nutrition.insertMany(nutritionData);

    // 4. Create Progress history
    const progressData = [
      {
        user: demoUser._id,
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        weight: 78.0,
        bodyMeasurements: { chest: 102, waist: 88, hips: 98, arms: 36, thighs: 59 },
        performanceMetrics: { runningTime5k: 26.5, benchPressMax: 75, squatMax: 95, deadliftMax: 115, pullUpsCount: 8 },
        notes: 'Starting baseline check-in.',
      },
      {
        user: demoUser._id,
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        weight: 77.1,
        bodyMeasurements: { chest: 102.5, waist: 86.5, hips: 97.5, arms: 36.5, thighs: 59 },
        performanceMetrics: { runningTime5k: 25.8, benchPressMax: 77.5, squatMax: 100, deadliftMax: 120, pullUpsCount: 10 },
        notes: 'Consistent nutrition and sleep, endurance feeling better.',
      },
      {
        user: demoUser._id,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        weight: 76.2,
        bodyMeasurements: { chest: 103, waist: 85, hips: 97, arms: 37, thighs: 59.5 },
        performanceMetrics: { runningTime5k: 25.0, benchPressMax: 80, squatMax: 105, deadliftMax: 125, pullUpsCount: 12 },
        notes: 'Waist down by 3cm from start! Arms gaining size.',
      },
      {
        user: demoUser._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        weight: 75.3,
        bodyMeasurements: { chest: 104, waist: 83.5, hips: 96.5, arms: 37.5, thighs: 60 },
        performanceMetrics: { runningTime5k: 24.2, benchPressMax: 82.5, squatMax: 107.5, deadliftMax: 127.5, pullUpsCount: 14 },
        notes: 'Energy is through the roof. Deadlift feels smooth.',
      },
      {
        user: demoUser._id,
        date: new Date(),
        weight: 74.5,
        bodyMeasurements: { chest: 105, waist: 82, hips: 96, arms: 38, thighs: 60.5 },
        performanceMetrics: { runningTime5k: 23.4, benchPressMax: 85, squatMax: 110, deadliftMax: 130, pullUpsCount: 15 },
        notes: 'Current check-in. Body fat visibly leaner, visible vascularity.',
      },
    ];
    await Progress.insertMany(progressData);

    // 5. Create Goals
    const goalsData = [
      {
        user: demoUser._id,
        title: 'Reach 72 kg Target Weight',
        category: 'weight',
        targetValue: 72.0,
        currentValue: 74.5,
        startValue: 78,
        unit: 'kg',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
      },
      {
        user: demoUser._id,
        title: 'Bench Press 100 kg (225 lbs plate)',
        category: 'strength',
        targetValue: 100,
        currentValue: 85,
        startValue: 80,
        unit: 'kg',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
      },
      {
        user: demoUser._id,
        title: 'Sub-22 Minute 5K Outdoor Run',
        category: 'running',
        targetValue: 22,
        currentValue: 23.4,
        startValue: 25,
        unit: 'mins',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
      },
      {
        user: demoUser._id,
        title: 'Complete 20 Workouts This Month',
        category: 'workout',
        targetValue: 20,
        currentValue: 16,
        startValue: 0,
        unit: 'sessions',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
      },
    ];
    await Goal.insertMany(goalsData);

    // 6. Create Notifications
    const notificationsData = [
      {
        user: demoUser._id,
        title: 'Goal Milestone Achieved! 🏆',
        message: 'You have reduced your waist circumference to 82cm. Keep pushing!',
        type: 'goal_achievement',
        link: '/progress',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        user: demoUser._id,
        title: 'Workout Completed 🔥',
        message: 'Upper Body Hypertrophy routine logged: 450 kcal burned across 5 exercises.',
        type: 'workout_completion',
        link: '/workouts',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        user: demoUser._id,
        title: 'New Community Follower 👥',
        message: 'Sarah Jenkins started following your fitness routines.',
        type: 'follower',
        link: '/profile',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
      {
        user: demoUser._id,
        title: 'Forum Response 💬',
        message: 'Coach Marcus commented on your "Bench Press Plateau" discussion post.',
        type: 'forum_reply',
        link: '/support',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      },
    ];
    await Notification.insertMany(notificationsData);

    // 7. Create Reminders
    const remindersData = [
      {
        user: demoUser._id,
        title: 'Morning Gym Session (Push Day)',
        type: 'workout',
        time: '07:00',
        days: ['Mon', 'Wed', 'Fri'],
        active: true,
        notes: 'Drink pre-workout 20 mins prior and warm up rotator cuffs.',
      },
      {
        user: demoUser._id,
        title: 'Post-Workout High Protein Shake',
        type: 'meal',
        time: '09:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        active: true,
        notes: '40g whey protein + 5g creatine monohydrate.',
      },
      {
        user: demoUser._id,
        title: 'Daily Hydration Check (3 Liters)',
        type: 'water',
        time: '14:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        active: true,
        notes: 'Refill 1L insulated sports bottle.',
      },
      {
        user: demoUser._id,
        title: 'Evening Mobility & Stretching',
        type: 'workout',
        time: '21:30',
        days: ['Tue', 'Thu', 'Sun'],
        active: false,
        notes: 'Foam roll quads, lats and hamstrings.',
      },
    ];
    await Reminder.insertMany(remindersData);

    // 8. Create Support Ticket & Feedback
    await SupportTicket.create({
      user: demoUser._id,
      subject: 'Inquiry regarding Apple Watch / Wearable Syncing',
      category: 'feature_request',
      priority: 'medium',
      status: 'in_progress',
      messages: [
        {
          sender: 'user',
          text: 'Hello, are there plans to allow automatic syncing with Apple Health or Garmin devices?',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
        {
          sender: 'support',
          text: 'Hi Alex! Thank you for the feature request. Our development team is currently testing the HealthKit integration for our upcoming v2 release.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ],
    });

    await Feedback.create({
      user: demoUser._id,
      rating: 5,
      category: 'features',
      comments: 'The workout tracker and nutrition logging are intuitive and sleek. Love the dark mode analytics!',
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
