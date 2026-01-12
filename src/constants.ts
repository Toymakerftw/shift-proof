export type ShiftType = 'Night' | 'Regular' | 'Early Morning' | 'Afternoon' | 'Weekoff';

export interface ScheduleProtocol {
  shiftTime: string;
  sleep: { main: string; anchor?: string };
  workout: string;
  meals: { time: string; label: string; description: string }[];
  priority: string;
}

export const SHIFT_PROTOCOLS: Record<ShiftType, ScheduleProtocol> = {
  'Night': {
    shiftTime: '10:00 PM – 6:00 AM',
    priority: 'Light management & digestion (10 PM – 6 AM)',
    sleep: { main: '7:30 AM – 2:30 PM', anchor: '8:00 PM – 9:00 PM' },
    workout: '8:30 PM – 9:15 PM',
    meals: [
      { time: '9:30 PM', label: 'Pre-Work', description: 'Main large meal (Carbs + Protein)' },
      { time: '1:30 AM', label: 'During Shift', description: 'Light protein snack (Eggs/Nuts)' },
      { time: '6:30 AM', label: 'Post-Shift', description: 'Moderate meal before bed' }
    ]
  },
  'Regular': {
    shiftTime: '9:30 AM – 6:30 PM',
    priority: 'Circadian consistency (9:30 AM – 6:30 PM)',
    sleep: { main: '11:30 PM – 7:30 AM' },
    workout: '7:45 AM – 8:30 AM',
    meals: [
      { time: '8:45 AM', label: 'Breakfast', description: 'High protein energy' },
      { time: '1:30 PM', label: 'Lunch', description: 'Balanced meal at work' },
      { time: '8:00 PM', label: 'Dinner', description: 'Moderate/Light recovery' }
    ]
  },
  'Early Morning': {
    shiftTime: '6:00 AM – 3:00 PM',
    priority: 'Early wind-down (6:00 AM – 3:00 PM)',
    sleep: { main: '9:30 PM – 4:45 AM' },
    workout: '4:00 PM – 4:45 PM',
    meals: [
      { time: '5:15 AM', label: 'Pre-Shift', description: 'Quick protein + slow carbs' },
      { time: '11:00 AM', label: 'Lunch', description: 'Main meal at work' },
      { time: '6:00 PM', label: 'Dinner', description: 'High protein post-workout' }
    ]
  },
  'Afternoon': {
    shiftTime: '1:00 PM – 10:00 PM',
    priority: 'Morning productivity (1:00 PM – 10:00 PM)',
    sleep: { main: '1:30 AM – 9:30 AM' },
    workout: '10:30 AM – 11:15 AM',
    meals: [
      { time: '11:30 AM', label: 'Brunch', description: 'Post-workout massive meal' },
      { time: '5:00 PM', label: 'Work Snack', description: 'Protein focused' },
      { time: '11:00 PM', label: 'Dinner', description: 'Light meal after home' }
    ]
  },
  'Weekoff': {
    shiftTime: 'Off Duty',
    priority: 'Rest & Recreation',
    sleep: { main: '11:00 PM – 8:00 AM' },
    workout: 'Flexible Time',
    meals: [
      { time: '10:00 AM', label: 'Brunch', description: 'Relaxed meal' },
      { time: '2:00 PM', label: 'Snack', description: 'Light snack' },
      { time: '7:00 PM', label: 'Dinner', description: 'Family/Social meal' }
    ]
  }
};

export const WORKOUT_PLAN = [
  { 
    exercise: 'Goblet Squats', 
    sets: 3, 
    reps: '12–15', 
    target: 'Legs/Glutes',
    description: 'Hold a weight close to your chest and squat down.',
    instructions: ['Keep chest up', 'Knees out', 'Depth below parallel']
  },
  { 
    exercise: 'Pull-Ups', 
    sets: 3, 
    reps: 'Failure', 
    target: 'Back/Lats',
    description: 'Pull your body up until chin clears the bar.',
    instructions: ['Full extension at bottom', 'Drive elbows down', 'Core tight']
  },
  { 
    exercise: 'Dumbbell Floor Press', 
    sets: 3, 
    reps: '10–12', 
    target: 'Chest/Triceps',
    description: 'Press weights up from a lying position on the floor.',
    instructions: ['Elbows at 45 degrees', 'Press straight up', 'Control the descent']
  },
  { 
    exercise: 'Standing Overhead Press', 
    sets: 3, 
    reps: '10–12', 
    target: 'Shoulders',
    description: 'Press weights vertically overhead.',
    instructions: ['Core braced', 'Don\'t arch back', 'Full lockout']
  },
  { 
    exercise: 'Single Arm DB Rows', 
    sets: 3, 
    reps: '12 ea.', 
    target: 'Back',
    description: 'Row weight to hip while supporting torso.',
    instructions: ['Flat back', 'Drive with elbow', 'Squeeze at top']
  },
  { 
    exercise: 'Dumbbell Bicep Curls', 
    sets: 3, 
    reps: '12–15', 
    target: 'Arms',
    description: 'Curl weights up focusing on biceps.',
    instructions: ['Elbows tucked', 'No swinging', 'Squeeze at top']
  },
  { 
    exercise: 'Plank', 
    sets: 3, 
    reps: '60 sec', 
    target: 'Core',
    description: 'Hold a straight body position on forearms.',
    instructions: ['Glutes squeezed', 'Core tight', 'Flat back'],
    isTimed: true,
    duration: 60
  }
];

export const WORKOUT_SETTINGS = {
  restBetweenSets: 60,
  restBetweenExercises: 90
};

export const NUTRITION_PLAN = {
  dailyTargets: '~1800 Calories | ~140g Protein',
  hydration: '3–4 Liters daily',
  meals: [
    { label: 'Meal 1: Starter', target: '400 kcal, 25g Protein', items: ['3 Boiled Eggs (2 whites, 1 whole)', '1 Slice Brown Bread with PB OR Oatmeal', 'Multivitamin'] },
    { label: 'Meal 2: Main', target: '600 kcal, 40g Protein', items: ['50g Soya Chunks', '1 Cup Rice OR 2 Rotis', 'Large portion green veggies', '1 small cup low-fat Curd'] },
    { label: 'Meal 3: Snack', target: '200 kcal, 25g Protein', items: ['1 Scoop Whey Protein', '1 Banana or Apple'] },
    { label: 'Meal 4: Dinner', target: '500 kcal, 30g Protein', items: ['150g Paneer OR Tofu', 'Mixed Salad', 'Optional: 1 small Roti'] }
  ],
  supplements: [
    { name: 'Whey Protein', purpose: 'Hit 140g protein' },
    { name: 'Creatine', purpose: 'Strength (3-5g daily)' },
    { name: 'ZMA', purpose: 'Deep sleep (30 mins before)' },
    { name: 'Vitamin D3', purpose: 'Lack of sun exposure' }
  ]
};
