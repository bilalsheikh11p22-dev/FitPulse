import { IMAGES } from './images';

// Content for the program detail pages (/programs/:slug).
// `icon` values are keys into the icon map in pages/public/ProgramDetail.jsx.
// Guidance is general fitness information, not personalised medical advice.

export const PROGRAMS = [
  /* ------------------------------------------------------------------ */
  {
    slug: 'strength',
    title: 'Strength',
    fullTitle: 'Strength Training',
    tag: 'Build power',
    img: IMAGES.strength,
    heroImg: IMAGES.gymDark,
    subtitle:
      'Lift with a plan, add a little more over time, and let your logbook prove it. Strength training builds muscle, bone density and confidence.',
    tracker: { path: '/workouts', label: 'Log a strength workout' },
    facts: [
      { label: 'Frequency', value: '3–4 days / week' },
      { label: 'Session length', value: '45–60 minutes' },
      { label: 'Level', value: 'Beginner to advanced' },
      { label: 'Logged in FitPulse as', value: 'Strength' },
    ],
    overview: [
      'Strength training means working your muscles against resistance, whether that is a barbell, dumbbells, a cable machine, resistance bands or your own bodyweight.',
      'The idea behind every good programme is progressive overload: gradually asking your body to do slightly more than last time, through more weight, more reps or more sets. Without a record of what you did last week, that is very hard to do, which is exactly why logging matters.',
    ],
    benefits: [
      { icon: 'dumbbell', title: 'Muscle and strength', desc: 'Regular resistance work builds and maintains muscle, which keeps everyday tasks easier at every age.' },
      { icon: 'shield', title: 'Stronger bones and joints', desc: 'Loading your skeleton helps maintain bone density and supports the joints you rely on.' },
      { icon: 'flame', title: 'Healthy metabolism', desc: 'More lean mass supports your energy use at rest and improves body composition over time.' },
      { icon: 'trophy', title: 'Visible progress', desc: 'Weights go up in small steps, so every personal record is a clear, motivating win.' },
    ],
    movementsTitle: 'Key movements to build around',
    movementsIntro: 'Most programmes are built on a handful of compound lifts that train several muscle groups at once.',
    movements: [
      { name: 'Squat', note: 'Quads, glutes and core. The foundation of lower-body strength.' },
      { name: 'Deadlift', note: 'Hamstrings, glutes and back. Teaches you to lift heavy objects safely from the floor.' },
      { name: 'Bench press', note: 'Chest, shoulders and triceps. The classic upper-body pressing lift.' },
      { name: 'Overhead press', note: 'Shoulders, triceps and upper back, plus a lot of core stability.' },
      { name: 'Row', note: 'Upper back and biceps. Balances all the pressing you do.' },
      { name: 'Pull-up or lat pulldown', note: 'Lats and arms. Builds a strong, healthy shoulder girdle.' },
    ],
    weekTitle: 'A sample training week',
    weekIntro: 'A simple 3-day structure with room to recover. Adjust it around your own schedule.',
    week: [
      { label: 'Mon', focus: 'Lower body', detail: 'Squat, Romanian deadlift, lunges, calf raises' },
      { label: 'Tue', focus: 'Rest', detail: 'Easy walk or light stretching' },
      { label: 'Wed', focus: 'Upper body', detail: 'Bench press, row, overhead press, pull-ups' },
      { label: 'Thu', focus: 'Rest', detail: 'Sleep, eat well, recover' },
      { label: 'Fri', focus: 'Full body', detail: 'Deadlift, incline press, split squat, core work' },
      { label: 'Sat', focus: 'Optional', detail: 'Mobility work or an easy cardio session' },
      { label: 'Sun', focus: 'Rest', detail: 'Plan next week and log your numbers' },
    ],
    tracks: [
      'Every exercise with sets, reps and weight',
      'Session duration and calories burned',
      'Bench press, squat and deadlift personal records on the Progress page',
      'Training volume trends in Analytics',
    ],
    tips: [
      'Add a small amount of weight or one extra rep each week instead of jumping up in big steps.',
      'Warm up with lighter sets of the first lift before your working sets.',
      'Leave one to three reps in reserve on most sets so your form stays clean.',
      'Aim for 7 to 9 hours of sleep. Muscle is built during recovery, not during the workout.',
      'Write every set down. If it is not logged, you cannot beat it next time.',
    ],
    faqs: [
      { q: 'How many reps should I do?', a: 'As a general guide, around 3 to 6 reps with heavier weights emphasises maximal strength, 6 to 12 reps is a common range for building muscle, and 12 or more builds muscular endurance. Most people benefit from mixing these.' },
      { q: 'Do I need a gym?', a: 'No. Dumbbells, resistance bands and bodyweight exercises like push-ups, squats and rows are enough to build real strength, especially when you are starting out.' },
      { q: 'How soon will I see results?', a: 'Beginners usually get noticeably stronger within 4 to 8 weeks, largely because the nervous system learns the movements. Visible changes in muscle size typically take 8 to 12 weeks or more of consistent training and good nutrition.' },
      { q: 'How many rest days do I need?', a: 'Most people do well with at least one to two days between sessions that train the same muscles. Listen to persistent soreness or fatigue and rest when you need it.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'cardio',
    title: 'Cardio',
    fullTitle: 'Cardio & Endurance',
    tag: 'Boost endurance',
    img: IMAGES.cardio,
    heroImg: IMAGES.running,
    subtitle:
      'Run, ride, row or swim. Build a stronger heart, more stamina and better energy, and watch your pace improve week after week.',
    tracker: { path: '/workouts', label: 'Log a cardio session' },
    facts: [
      { label: 'Frequency', value: '3–5 days / week' },
      { label: 'Session length', value: '20–60 minutes' },
      { label: 'Level', value: 'All levels' },
      { label: 'Logged in FitPulse as', value: 'Cardio or HIIT' },
    ],
    overview: [
      'Cardio, or aerobic exercise, is any sustained activity that raises your heart rate: running, cycling, swimming, rowing, brisk walking or a high-energy class.',
      'Health guidelines such as those from the World Health Organization suggest adults aim for roughly 150 to 300 minutes of moderate-intensity activity per week, or 75 to 150 minutes of vigorous activity, or a mix of both. FitPulse lets you see how close you are every week.',
    ],
    benefits: [
      { icon: 'heart', title: 'Heart and lung health', desc: 'Regular aerobic work strengthens your heart and improves how efficiently your body uses oxygen.' },
      { icon: 'zap', title: 'More energy and stamina', desc: 'Everyday activities feel easier as your aerobic base grows.' },
      { icon: 'flame', title: 'Calorie burn', desc: 'Cardio is an effective way to increase the energy you use across the week.' },
      { icon: 'sparkles', title: 'Mood and stress relief', desc: 'Many people find regular cardio improves mood, focus and sleep quality.' },
    ],
    movementsTitle: 'Ways to do your cardio',
    movementsIntro: 'Different sessions train different qualities. A good week usually mixes a few of them.',
    movements: [
      { name: 'Steady easy cardio (Zone 2)', note: 'A conversational pace for 30 to 60 minutes. Builds your aerobic base and is easy to recover from.' },
      { name: 'Interval training (HIIT)', note: 'Short hard efforts followed by easier recovery, for example 30 seconds hard and 90 seconds easy, repeated 6 to 8 times.' },
      { name: 'Tempo effort', note: '20 to 30 minutes at a comfortably hard pace. Improves the speed you can sustain.' },
      { name: 'Low-impact options', note: 'Cycling, rowing, swimming or an incline walk are kind to your joints and still count fully.' },
      { name: 'Long easy session', note: 'One longer, relaxed session per week builds endurance and mental toughness.' },
    ],
    weekTitle: 'A sample training week',
    weekIntro: 'Most of your cardio should feel easy. Keep the hard days genuinely hard, and everything else relaxed.',
    week: [
      { label: 'Mon', focus: 'Easy cardio', detail: '40 minutes at a conversational pace' },
      { label: 'Tue', focus: 'Rest or strength', detail: 'Optional strength session or full rest' },
      { label: 'Wed', focus: 'Intervals', detail: '5 min warm-up, 6 × (30s hard, 90s easy), cool-down' },
      { label: 'Thu', focus: 'Rest', detail: 'Walk, stretch, recover' },
      { label: 'Fri', focus: 'Tempo', detail: '20–30 minutes at a comfortably hard pace' },
      { label: 'Sat', focus: 'Long easy', detail: '60 minutes, relaxed and steady' },
      { label: 'Sun', focus: 'Rest', detail: 'Active recovery or complete rest' },
    ],
    tracks: [
      'Duration and calories burned for every session',
      'Cardio and HIIT sessions tagged by category',
      'Weekly totals so you can compare against the 150-minute guideline',
      'Weight and body trends alongside your training in Analytics',
    ],
    tips: [
      'Use the talk test: on easy days you should be able to speak in full sentences.',
      'Increase your weekly time or distance gradually, by around 10 percent at most.',
      'Limit hard interval sessions to one to three per week and leave recovery between them.',
      'Drink water before, during and after longer sessions, especially in hot weather.',
      'Choose supportive footwear and replace running shoes when they wear out.',
    ],
    faqs: [
      { q: 'Is cardio or weight training better for fat loss?', a: 'Both help. Cardio increases the energy you burn, while strength training helps you keep muscle. What you eat has a large effect too, so the best plan combines training you enjoy with consistent nutrition.' },
      { q: 'Can I do HIIT every day?', a: 'It is not recommended. HIIT is demanding, and most people do best with one to three sessions a week with easier days or rest in between.' },
      { q: 'What heart rate should I train at?', a: 'A rough estimate of maximum heart rate is 220 minus your age, but individuals vary a lot. The talk test and how you feel are often more practical guides for easy versus hard effort.' },
      { q: 'I am a complete beginner. Where do I start?', a: 'Start with brisk walking for 20 to 30 minutes, three or four times a week. Add a few minutes each week and mix in light jogging or cycling when it feels comfortable.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'yoga',
    title: 'Mobility & Yoga',
    fullTitle: 'Mobility & Yoga',
    tag: 'Move better',
    img: IMAGES.yoga,
    heroImg: IMAGES.yoga,
    subtitle:
      'Move through a fuller range, stand taller and recover faster. A few calm minutes a day can change how the rest of your training feels.',
    tracker: { path: '/workouts', label: 'Log a yoga session' },
    facts: [
      { label: 'Frequency', value: '3–6 days / week' },
      { label: 'Session length', value: '10–45 minutes' },
      { label: 'Level', value: 'All levels' },
      { label: 'Logged in FitPulse as', value: 'Yoga or Flexibility' },
    ],
    overview: [
      'Mobility work and yoga combine stretching, controlled movement and steady breathing. They improve how freely your joints move and help your body recover between harder sessions.',
      'Short, regular sessions beat occasional long ones. Ten minutes every morning will do more for your flexibility than one hour once a week.',
    ],
    benefits: [
      { icon: 'activity', title: 'Flexibility and range of motion', desc: 'Regular practice helps hips, hamstrings, shoulders and spine move more freely.' },
      { icon: 'target', title: 'Posture and balance', desc: 'Holding and flowing through poses builds body awareness, balance and stability.' },
      { icon: 'sparkles', title: 'Calm and better sleep', desc: 'Slow breathing and gentle movement help many people unwind, especially in the evening.' },
      { icon: 'heart', title: 'Recovery support', desc: 'Light movement keeps you loose between strength and cardio days.' },
    ],
    movementsTitle: 'Core poses and movements',
    movementsIntro: 'A small set of poses covers the areas most people find tight. Move slowly and breathe steadily.',
    movements: [
      { name: 'Cat–Cow', note: 'Gently mobilises the spine. A great way to start any session.' },
      { name: 'Downward dog', note: 'Lengthens the hamstrings, calves and shoulders while strengthening the arms.' },
      { name: 'Low lunge (hip flexor stretch)', note: 'Opens the front of the hips, which tighten from long periods of sitting.' },
      { name: 'Warrior II', note: 'Builds leg strength and hip mobility while improving balance.' },
      { name: 'Pigeon pose', note: 'A deep stretch for the glutes and outer hips. Ease in gradually.' },
      { name: "Child's pose", note: 'A restful stretch for the back, hips and shoulders to finish with.' },
    ],
    weekTitle: 'A sample week of practice',
    weekIntro: 'Short sessions most days, with one longer practice when you have time.',
    week: [
      { label: 'Mon', focus: 'Morning flow', detail: '10 minutes of gentle full-body movement' },
      { label: 'Tue', focus: 'Hips and hamstrings', detail: '20 minutes focused on lower-body mobility' },
      { label: 'Wed', focus: 'Rest or walk', detail: 'An easy walk is plenty' },
      { label: 'Thu', focus: 'Full flow', detail: '30 minutes, slow and controlled' },
      { label: 'Fri', focus: 'Shoulders and back', detail: '15 minutes to undo desk posture' },
      { label: 'Sat', focus: 'Long restorative', detail: '45 minutes of slow holds and deep breathing' },
      { label: 'Sun', focus: 'Breath and stretch', detail: '10 minutes to reset for the week' },
    ],
    tracks: [
      'Yoga and Flexibility sessions with duration',
      'Consistency across the week so you can see your streak build',
      'Reminders to keep your practice on schedule',
      'Notes on how your body feels in your progress check-ins',
    ],
    tips: [
      'Never push into sharp pain. A stretch should feel like gentle tension, not discomfort.',
      'Hold static stretches for roughly 20 to 45 seconds and breathe slowly through the nose.',
      'Warm up with a few minutes of easy movement before deeper stretches.',
      'Consistency matters more than depth. Small daily sessions add up quickly.',
      'Pair a short routine with an existing habit, like right after you wake up.',
    ],
    faqs: [
      { q: 'Can yoga replace strength training?', a: 'Not entirely. Yoga builds some strength and a lot of control, but progressive resistance training is more effective for building muscle. The two complement each other well.' },
      { q: 'I am not flexible. Can I still start?', a: 'Yes. Flexibility is a result of practice, not a requirement. Start with gentle poses and use blocks, cushions or a wall for support.' },
      { q: 'What is the best time of day?', a: 'Whenever you will actually do it. Many people like a short morning flow to loosen up and a calmer evening session to wind down.' },
      { q: 'What if I have an injury?', a: 'Speak with a doctor or physiotherapist before starting, and avoid any movement that causes pain. A qualified instructor can suggest safe modifications.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'nutrition',
    title: 'Nutrition',
    fullTitle: 'Nutrition & Macros',
    tag: 'Fuel right',
    img: IMAGES.nutrition,
    heroImg: IMAGES.nutrition,
    subtitle:
      'Training builds the signal and food builds the result. Track meals, understand your macros and fuel your goals with confidence.',
    tracker: { path: '/nutrition', label: 'Log a meal' },
    facts: [
      { label: 'Rhythm', value: 'Daily habit' },
      { label: 'Meals', value: '3 meals + snacks' },
      { label: 'Level', value: 'All levels' },
      { label: 'Logged in FitPulse as', value: 'Breakfast, Lunch, Dinner, Snacks' },
    ],
    overview: [
      'Good nutrition does not need to be complicated. It comes down to eating enough, getting enough protein, choosing mostly whole foods and being consistent for weeks, not days.',
      'Tracking is simply a way to see what you actually eat. After a few weeks of logging, most people learn what their usual portions look like and can adjust with confidence.',
    ],
    benefits: [
      { icon: 'zap', title: 'Energy for training', desc: 'Eating enough carbohydrates and calories keeps your workouts strong and your mood steady.' },
      { icon: 'dumbbell', title: 'Recovery and muscle repair', desc: 'Protein across the day supplies the building blocks your muscles use to repair and grow.' },
      { icon: 'target', title: 'Goal awareness', desc: 'Seeing your calories and macros makes it easier to move toward fat loss, maintenance or muscle gain.' },
      { icon: 'trend', title: 'Better habits', desc: 'Patterns become obvious once you log them, from skipped breakfasts to late-night snacking.' },
    ],
    movementsTitle: 'The building blocks of your plate',
    movementsIntro: 'Understand these five and you understand most of what matters.',
    movements: [
      { name: 'Protein', note: 'Supports repair and fullness. A commonly used range for active people is roughly 1.6 to 2.2 grams per kilogram of body weight per day.' },
      { name: 'Carbohydrates', note: 'Your main fuel for training. Rice, roti, oats, fruit and potatoes all fit.' },
      { name: 'Healthy fats', note: 'Important for hormones and absorbing vitamins. Nuts, seeds, olive oil and fish are good sources.' },
      { name: 'Fibre and vegetables', note: 'Support digestion and fullness and bring vitamins and minerals. Aim for colour on every plate.' },
      { name: 'Water', note: 'Drink regularly through the day. Pale yellow urine is a simple sign you are hydrated.' },
    ],
    weekTitle: 'A sample day of eating',
    weekIntro: 'An example of how a balanced day can look. Portions depend on your goal and body size.',
    week: [
      { label: 'Breakfast', focus: 'Protein plus slow carbs', detail: 'Eggs or yogurt with oats or paratha, and fruit' },
      { label: 'Lunch', focus: 'Balanced plate', detail: 'Chicken or daal, rice or roti, vegetables or salad' },
      { label: 'Snack', focus: 'Easy protein', detail: 'Yogurt, boiled eggs, roasted chickpeas or a handful of nuts' },
      { label: 'Pre-workout', focus: 'Light carbs', detail: 'A banana or dates about an hour before training' },
      { label: 'Dinner', focus: 'Protein and veg', detail: 'Fish, chicken or lentils with vegetables and a modest carb portion' },
      { label: 'Hydration', focus: 'All day', detail: 'Water between meals, more when training or in the heat' },
    ],
    tracks: [
      'Meals by type: Breakfast, Lunch, Dinner and Snacks',
      'Calories, protein, carbs and fats for every entry',
      'Daily totals against your targets',
      'Nutrition trends next to your weight and training in Analytics',
    ],
    tips: [
      'Build most meals around a protein source, a carb source and vegetables.',
      'Log as you eat, not at the end of the day, so nothing gets forgotten.',
      'Avoid cutting calories too aggressively. Slow, steady change is easier to keep up.',
      'Judge your weight by weekly trends, not by one day on the scale.',
      'Plan a few go-to meals so busy days do not derail your week.',
    ],
    faqs: [
      { q: 'How many calories should I eat?', a: 'It depends on your size, activity and goal. Use your goals in FitPulse as a starting point, watch how your weight trends over two to three weeks, and adjust gradually.' },
      { q: 'Do I need supplements?', a: 'Most people can meet their needs from food. Protein powder can be a convenient way to reach your protein target, but it is optional.' },
      { q: 'Should I avoid carbohydrates?', a: 'Not necessarily. Carbohydrates fuel training and recovery. Choosing mostly whole-food sources and sensible portions works well for most people.' },
      { q: 'Is this medical advice?', a: 'No. This is general information. If you have a medical condition, are pregnant, or have a history of disordered eating, speak with a doctor or registered dietitian before changing your diet.' },
    ],
  },
];

export const getProgram = (slug) => PROGRAMS.find((p) => p.slug === slug) || null;
