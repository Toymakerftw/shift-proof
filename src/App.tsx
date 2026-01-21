import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Home, Bell, ChevronLeft, ChevronRight, RotateCcw, Dumbbell, Utensils, BarChart3, CheckCircle, Circle, Play, Pause, Minus, ExternalLink, Info, Trophy, Flame } from 'lucide-react';
import { SHIFT_PROTOCOLS, type ShiftType, type ScheduleProtocol, WORKOUT_PLAN, WORKOUT_SETTINGS, NUTRITION_PLAN } from './constants';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays, subDays, isTomorrow, isYesterday } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'today' | 'calendar' | 'workouts' | 'nutrition' | 'stats';

interface DayShift {
  date: string;
  type: ShiftType;
}

// Helper to get current day ID
const getTodayId = () => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
};

/* ---------------- WORKOUT SCHEDULE DATA ---------------- */
const workoutSchedule = [
  {
    id: "mon",
    day: "Monday",
    title: "Pull + Forearms",
    focus: "Back & Biceps (V-Shape)",
    exercises: [
      {
        name: "Dead Hang",
        goal: "5 × 20 sec",
        videoUrl: "https://www.youtube.com/watch?v=kOw9c6AjJYA",
        tip: "Squeeze the bar hard to engage forearms.",
      },
      {
        name: "Bent-Over DB Row",
        goal: "4 × 10–12",
        videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
        tip: "Pull towards your hip, not your chest.",
      },
      {
        name: "Dumbbell Hammer Curls",
        goal: "4 × 10–12",
        videoUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4",
        tip: "Keep elbows pinned to your sides.",
      },
      {
        name: "Dumbbell Bicep Curls",
        goal: "3 × 10",
        videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
        tip: "Rotate palms up at the top.",
      },
      {
        name: "Dumbbell Holds (Heavy)",
        goal: "3 × 30–45 sec",
        videoUrl: "https://www.youtube.com/watch?v=Fkzk_RqlYig",
        tip: "Stand tall with shoulders back.",
      },
    ],
  },
  {
    id: "tue",
    day: "Tuesday",
    title: "Lower Body + Core",
    focus: "Legs & Abs Foundation",
    exercises: [
      {
        name: "Romanian Deadlift (DB)",
        goal: "4 × 10–12",
        videoUrl: "https://www.youtube.com/watch?v=hQgFixeXdZo",
        tip: "Hinge at hips, feel stretch in hamstrings.",
      },
      {
        name: "Standing Lunges",
        goal: "3 × 10 / leg",
        videoUrl: "https://www.youtube.com/watch?v=fydLSJlGx-0",
        tip: "Keep front knee tracked over mid-foot.",
      },
      {
        name: "Goblet Squats",
        goal: "3 × 12",
        videoUrl: "https://www.youtube.com/watch?v=MeIiIdhvXT4",
        tip: "Elbows should touch inside of knees.",
      },
      {
        name: "Plank",
        goal: "3 × 30 sec",
        videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
        tip: "Squeeze glutes and core; don't sag.",
      },
      {
        name: "Lying Leg Raises",
        goal: "3 × 12",
        videoUrl: "https://www.youtube.com/watch?v=JB2oyawG9KI",
        tip: "Keep lower back pressed into the floor.",
      },
    ],
  },
  {
    id: "wed",
    day: "Wednesday",
    title: "Active Recovery",
    focus: "Walking & Mobility",
    isRecovery: true,
    exercises: [
      {
        name: "Walk 7k–10k Steps",
        goal: "45-60min",
        videoUrl: "https://www.youtube.com/watch?v=q3JYT_jKs7Y",
        tip: "Steady pace to improve fat metabolism.",
      },
      {
        name: "Light Stretching",
        goal: "Full Body",
        videoUrl: "https://www.youtube.com/watch?v=eT7S9H1uwWo",
        tip: "Hold each stretch for 30 seconds.",
      },
    ],
  },
  {
    id: "thu",
    day: "Thursday",
    title: "Push + Shoulders",
    focus: "Chest & Shoulder Width",
    exercises: [
      {
        name: "Incline Push-ups",
        goal: "4 × Max",
        videoUrl: "https://www.youtube.com/watch?v=49jfZ_z7-us",
        tip: "Use a table or bed for incline.",
      },
      {
        name: "Dumbbell Floor Press",
        goal: "4 × 10–12",
        videoUrl: "https://www.youtube.com/watch?v=uUGDRwge4F8",
        tip: "Lower elbows until they lightly touch the floor.",
      },
      {
        name: "Dumbbell Shoulder Press",
        goal: "3 × 10",
        videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
        tip: "Don't lock elbows out completely at top.",
      },
      {
        name: "Dumbbell Lateral Raises",
        goal: "4 × 12–15",
        videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
        tip: "Pinkies slightly up, lead with elbows.",
      },
      {
        name: "Plank",
        goal: "3 × 30–40 sec",
        videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
        tip: "Increase duration by 5s each week.",
      },
    ],
  },
  {
    id: "fri",
    day: "Friday",
    title: "Arms + Back Pump",
    focus: "Aesthetics & Posture",
    exercises: [
      {
        name: "Bent-Over DB Row",
        goal: "3 × 12",
        videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
        tip: "Slow on the way down.",
      },
      {
        name: "Hammer Curls",
        goal: "3 × 12",
        videoUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4",
        tip: "Focus on the forearm/bicep connection.",
      },
      {
        name: "Slow Bicep Curls",
        goal: "3 × 10",
        videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
        tip: "3 seconds down, 1 second up.",
      },
      {
        name: "Lateral Raises",
        goal: "3 × 15",
        videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
        tip: "Light weight, high reps.",
      },
      {
        name: "Dead Hang",
        goal: "3 × Max Time",
        videoUrl: "https://www.youtube.com/watch?v=kOw9c6AjJYA",
        tip: "Try to beat your Monday record.",
      },
    ],
  },
  {
    id: "sat",
    day: "Saturday",
    title: "Cardio + Core",
    focus: "Heart Health & Abs",
    exercises: [
      {
        name: "Long Walk / Cycle",
        goal: "30–45 min",
        videoUrl: "https://www.youtube.com/watch?v=q3JYT_jKs7Y",
        tip: "Zone 2 cardio - you should be able to talk.",
      },
      {
        name: "Core Circuit",
        goal: "3 Rounds",
        videoUrl: "https://www.youtube.com/watch?v=JB2oyawG9KI",
        tip: "Do rounds with minimal rest.",
      },
    ],
  },
  {
    id: "sun",
    day: "Sunday",
    title: "Rest Day",
    focus: "Recovery",
    isRecovery: true,
    exercises: [
      { name: "Full Rest", goal: "Relax", videoUrl: "", tip: "Get ready for Monday." },
    ],
  },
];

const getDailyProtocol = (date: Date, shifts: DayShift[]): ScheduleProtocol | null => {
  const currentShift = shifts.find(s => isSameDay(new Date(s.date), date))?.type;
  if (!currentShift) return null;

  if (currentShift !== 'Weekoff') {
    return SHIFT_PROTOCOLS[currentShift];
  }

  // Dynamic Weekoff Logic
  const prevDate = subDays(date, 1);
  const nextDate = addDays(date, 1);
  const prevShift = shifts.find(s => isSameDay(new Date(s.date), prevDate))?.type;
  const nextShift = shifts.find(s => isSameDay(new Date(s.date), nextDate))?.type;

  const baseWeekoff: ScheduleProtocol = {
    shiftTime: 'Off Duty',
    priority: 'Rest & Recreation',
    sleep: { main: '11:00 PM – 8:00 AM' },
    workout: 'Flexible Time',
    meals: [
      { time: '10:00 AM', label: 'Brunch', description: 'Relaxed meal' },
      { time: '2:00 PM', label: 'Snack', description: 'Light snack' },
      { time: '7:00 PM', label: 'Dinner', description: 'Family/Social meal' }
    ]
  };

  // Scenario 1: Recovering from Night Shift
  if (prevShift === 'Night') {
    return {
      ...baseWeekoff,
      priority: 'Recovery from Night Shift',
      sleep: { main: 'As much as needed', anchor: 'Try to wake by 12:00 PM to reset' },
      workout: 'Light recovery walk / Yoga',
      meals: [
        { time: 'Upon Waking', label: 'Breakfast', description: 'Hydrate immediately' },
        { time: '2:00 PM', label: 'Lunch', description: 'Nutrient dense' },
        { time: '8:00 PM', label: 'Dinner', description: 'Light & early' }
      ]
    };
  }

  // Scenario 2: Preparing for Night Shift
  if (nextShift === 'Night') {
    return {
      ...baseWeekoff,
      priority: 'Pre-Night Shift Prep',
      sleep: { main: 'Normal night sleep', anchor: 'Nap 2:00 PM – 4:00 PM' },
      workout: 'Training allowed (Morning)',
      meals: [
        { time: '9:00 AM', label: 'Breakfast', description: 'Normal' },
        { time: '1:00 PM', label: 'Lunch', description: 'Carb heavy before nap' },
        { time: '9:00 PM', label: 'Dinner', description: 'Late dinner to adapt' }
      ]
    };
  }

  return baseWeekoff;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [shifts, setShifts] = useState<DayShift[]>(() => {
    const saved = localStorage.getItem('shifts');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

  // Fitness tracking state
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('completedExercises');
    return saved ? JSON.parse(saved) : {};
  });
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, { weight?: string; reps?: string }>>(() => {
    const saved = localStorage.getItem('exerciseLogs');
    return saved ? JSON.parse(saved) : {};
  });
  const [dietTracking, setDietTracking] = useState(() => {
    const saved = localStorage.getItem('dietTracking');
    return saved ? JSON.parse(saved) : { calories: 0, protein: 0 };
  });
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('stats');
    return saved ? JSON.parse(saved) : { streak: 0, level: 1, xp: 0 };
  });

  // Workout state
  const [activeWorkoutDay, setActiveWorkoutDay] = useState(() => getTodayId());
  const [showTip, setShowTip] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    localStorage.setItem('exerciseLogs', JSON.stringify(exerciseLogs));
    localStorage.setItem('dietTracking', JSON.stringify(dietTracking));
    localStorage.setItem('stats', JSON.stringify(stats));
  }, [shifts, completedExercises, exerciseLogs, dietTracking, stats]);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    if (permission === 'granted') {
      new Notification("Notifications Enabled!", {
        body: "You will now receive shift-based reminders.",
        icon: "/pwa-192x192.png"
      });
    }
  };

  const currentShift = shifts.find(s => isSameDay(new Date(s.date), selectedDate))?.type;
  const protocol = getDailyProtocol(selectedDate, shifts);

  const handleSetShift = (type: ShiftType) => {
    const newShifts = shifts.filter(s => !isSameDay(new Date(s.date), selectedDate));
    newShifts.push({ date: selectedDate.toISOString(), type });
    setShifts(newShifts);
  };

  // Get today's workout based on the day of the week
  const getTodaysWorkout = () => {
    const todayId = getTodayId();
    return workoutSchedule.find(w => w.id === todayId);
  };

  const toggleExerciseComplete = (key: string, exerciseName: string) => {
    const isCurrentlyDone = !!completedExercises[key];

    // Calculate XP gain/loss
    const xpChange = isCurrentlyDone ? -50 : 50;
    const newXp = Math.max(0, stats.xp + xpChange);
    const newLevel = Math.floor(newXp / 1000) + 1;

    // Update stats if completing an exercise
    if (!isCurrentlyDone) {
      setStats(prev => ({
        ...prev,
        xp: newXp,
        level: newLevel,
        streak: prev.streak + 1
      }));
    } else {
      setStats(prev => ({
        ...prev,
        xp: newXp,
        level: newLevel,
        streak: Math.max(0, prev.streak - 1)
      }));
    }

    setCompletedExercises(prev => ({
      ...prev,
      [key]: !isCurrentlyDone
    }));
  };

  const updateDietTracking = (type: 'calories' | 'protein', amount: number) => {
    setDietTracking(prev => {
      const current = prev[type] || 0;
      return {
        ...prev,
        [type]: Math.max(0, current + amount)
      };
    });
  };

  // Additional workout helpers
  const currentWorkout = workoutSchedule.find(w => w.id === activeWorkoutDay);

  const doneCount = currentWorkout?.exercises.filter(
    (ex) => completedExercises[`${activeWorkoutDay}-${ex.name}`]
  ).length || 0;

  const progress = currentWorkout
    ? Math.round((doneCount / currentWorkout.exercises.length) * 100)
    : 0;

  const updateExerciseLog = (key: string, field: string, val: string) => {
    setExerciseLogs(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: val },
    }));
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Video Player Component
  const VideoPlayer = ({ url, title }: { url: string; title: string }) => {
    if (!url)
      return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700 italic text-sm">
          No video available
        </div>
      );

    // Direct MP4
    if (url.endsWith(".mp4")) {
      return (
        <video
          className="w-full h-full object-cover"
          controls
          playsInline
          muted
          loop
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Instagram
    if (url.includes("instagram.com")) {
      const embedUrl = url.endsWith("/") ? `${url}embed/` : `${url}/embed/`;
      return (
        <iframe
          className="w-full h-full"
          src={embedUrl}
          frameBorder="0"
          scrolling="no"
          title={title}
        />
      );
    }

    // YouTube
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    }

    if (videoId) {
      return (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
          title={title}
          allowFullScreen
        />
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-900 text-blue-400 hover:bg-slate-800 transition-colors"
      >
        <ExternalLink size={24} />
        <span className="text-xs font-bold uppercase">Watch Tutorial</span>
      </a>
    );
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = getDay(monthStart); // 0 = Sunday, 1 = Monday...

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 p-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-indigo-600">Shift-Proof</h1>
          <div className="flex gap-2">
            <button
              onClick={requestNotificationPermission}
              className={cn(
                "p-2 rounded-full transition-colors",
                notificationsEnabled ? "text-emerald-500 bg-emerald-50" : "text-gray-400 hover:bg-gray-100"
              )}
              title={notificationsEnabled ? "Notifications Active" : "Enable Notifications"}
            >
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {activeTab === 'today' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <section>
              <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-xl border shadow-sm">
                <button
                  onClick={() => setSelectedDate(prev => subDays(prev, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {isSameDay(selectedDate, new Date())
                      ? "Today"
                      : isTomorrow(selectedDate)
                      ? "Tomorrow"
                      : isYesterday(selectedDate)
                      ? "Yesterday"
                      : format(selectedDate, 'EEE, MMM d')}
                  </h2>
                  {!isSameDay(selectedDate, new Date()) && (
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="text-xs font-medium text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-0.5 rounded-full transition-colors"
                    >
                      <RotateCcw size={12} /> Return to Today
                    </button>
                  )}
                  {isSameDay(selectedDate, new Date()) && (
                    <span className="text-xs font-normal text-gray-500">
                      {format(selectedDate, 'MMM d')}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {!currentShift ? (
                <div className="bg-white rounded-xl border shadow-sm p-6 animate-in fade-in">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900">No shift set for {isSameDay(selectedDate, new Date()) ? 'today' : 'this day'}</h3>
                    <p className="text-sm text-gray-500">Select a shift type to generate your schedule.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(['Regular', 'Early Morning', 'Afternoon', 'Night', 'Weekoff'] as ShiftType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => handleSetShift(type)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all hover:border-indigo-300 hover:bg-indigo-50",
                          type === 'Weekoff' && "col-span-2 hover:border-emerald-300 hover:bg-emerald-50"
                        )}
                      >
                        <div className="text-sm font-bold flex justify-between">
                          {type}
                          {type === 'Weekoff' && <span className="text-emerald-600 text-xs">Rest Day</span>}
                        </div>
                        <div className="text-[10px] text-gray-500 line-clamp-1">
                          {type === 'Weekoff' ? 'Dynamic Recovery Plan' : SHIFT_PROTOCOLS[type]?.shiftTime}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Active Shift</span>
                    <h3 className="text-2xl font-bold">{currentShift}</h3>
                    <p className="text-sm text-gray-500 mt-1">Priority: {protocol?.priority}</p>
                    <p className="text-xs text-indigo-600 font-medium mt-1">{protocol?.shiftTime}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-900">Sleep</h4>
                      <p className="text-sm text-blue-800">{protocol?.sleep.main}</p>
                      {protocol?.sleep.anchor && (
                        <p className="text-xs text-blue-700 mt-1">Nap: {protocol.sleep.anchor}</p>
                      )}
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <h4 className="font-bold text-orange-900">Workout</h4>
                      <p className="text-sm text-orange-800">{protocol?.workout}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                      <h4 className="font-bold">Meal Schedule</h4>
                    </div>
                    <div className="divide-y">
                      {protocol?.meals.map((meal, idx) => (
                        <div key={idx} className="p-4 flex gap-4">
                          <div className="text-sm font-bold text-indigo-600 min-w-[70px]">{meal.time}</div>
                          <div>
                            <div className="font-semibold text-sm">{meal.label}</div>
                            <div className="text-xs text-gray-500">{meal.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fitness Section - Integrated into today's view */}
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                      <h4 className="font-bold">Today's Fitness</h4>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-semibold text-sm">Recommended Workout</h5>
                        <span className="text-xs text-indigo-600">{protocol?.workout}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {currentShift === 'Weekoff'
                          ? 'Rest day - consider light activity or stretching'
                          : 'Follow your shift-based workout schedule'}
                      </p>

                      {/* Show today's workout based on the day of the week */}
                      <div className="space-y-3">
                        {getTodaysWorkout()?.exercises.slice(0, 3).map((ex, idx) => {
                          const key = `${getTodayId()}-${ex.name}`;
                          const isDone = completedExercises[key];

                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-sm">{ex.name}</div>
                                <div className="text-xs text-gray-500">{ex.goal}</div>
                              </div>
                              <button
                                onClick={() => toggleExerciseComplete(key, ex.name)}
                                className={`w-6 h-6 rounded-full border ${isDone ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                              >
                                {isDone && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedDate(subDays(startOfMonth(selectedDate), 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <CalendarIcon size={20} className="rotate-180" />
                </button>
                <h2 className="text-lg font-bold">{format(selectedDate, 'MMMM yyyy')}</h2>
                <button
                  onClick={() => setSelectedDate(addDays(endOfMonth(selectedDate), 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <CalendarIcon size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-xs font-bold text-gray-400 py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {daysInMonth.map(day => {
                  const dayShift = shifts.find(s => isSameDay(new Date(s.date), day));
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  // Color coding for calendar
                  let shiftColor = "bg-indigo-400";
                  if (dayShift?.type === 'Weekoff') shiftColor = "bg-emerald-400";
                  if (dayShift?.type === 'Night') shiftColor = "bg-purple-400";

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "aspect-square rounded-lg text-sm flex flex-col items-center justify-center relative transition-colors",
                        isSelected ? "bg-indigo-600 text-white" : "hover:bg-gray-100",
                        isToday && !isSelected && "border border-indigo-200 text-indigo-600"
                      )}
                    >
                      <span>{format(day, 'd')}</span>
                      <div className="flex gap-0.5 mt-1">
                        {dayShift && (
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected ? "bg-white" : shiftColor
                          )} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <h3 className="font-bold mb-4">Set Shift for {format(selectedDate, 'MMM d')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['Regular', 'Early Morning', 'Afternoon', 'Night', 'Weekoff'] as ShiftType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => handleSetShift(type)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      currentShift === type
                        ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                        : "border-gray-200 hover:border-indigo-300",
                      type === 'Weekoff' && "col-span-2 bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                    )}
                  >
                    <div className="text-sm font-bold flex justify-between">
                      {type}
                      {type === 'Weekoff' && <span className="text-emerald-600 text-xs">Rest Day</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 line-clamp-1">
                      {type === 'Weekoff' ? 'Dynamic Recovery Plan' : SHIFT_PROTOCOLS[type]?.shiftTime}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Workouts Tab - Full Featured */}
        {activeTab === 'workouts' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Horizontal Calendar for Days */}
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-4 px-4">
              {workoutSchedule.map((day) => {
                const isToday = day.id === getTodayId();
                return (
                  <button
                    key={day.id}
                    onClick={() => setActiveWorkoutDay(day.id)}
                    className={`flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all border relative ${
                      activeWorkoutDay === day.id
                        ? "bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-900/40 scale-105"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}
                  >
                    {/* Today Indicator Dot */}
                    {isToday && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
                    )}

                    <span className="text-[10px] font-bold uppercase mb-1">
                      {day.day.substring(0, 1)}
                    </span>
                    <span className="text-sm font-black">
                      {day.id === "wed"
                        ? "⚡"
                        : day.id === "sun"
                        ? "Rest"
                        : day.day.substring(0, 1)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Workout Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Trophy size={100} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white leading-tight">
                  {currentWorkout?.title}
                </h2>
                <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mt-1 mb-6">
                  {currentWorkout?.focus}
                </p>

                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Daily Quest
                  </span>
                  <span className="text-xs font-black text-white">
                    {progress}% Complete
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Timer Component */}
                <div className="bg-slate-800/50 p-4 rounded-3xl flex items-center justify-between border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setSeconds(0);
                        setIsActive(false);
                      }}
                      className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90 transition-transform"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                        Rest Phase
                      </div>
                      <div className="text-2xl font-mono font-black text-white">
                        {formatTime(seconds)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                      isActive
                        ? "bg-orange-500 shadow-orange-900/20"
                        : "bg-blue-600 shadow-blue-900/20"
                    }`}
                  >
                    {isActive ? (
                      <Pause size={28} className="text-white" />
                    ) : (
                      <Play size={28} className="text-white ml-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
              {currentWorkout?.exercises.map((ex, idx) => {
                const key = `${activeWorkoutDay}-${ex.name}`;
                const isDone = completedExercises[key];

                return (
                  <div
                    key={idx}
                    className={`bg-slate-900 rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                      isDone
                        ? "border-green-500/30 opacity-75 grayscale-[0.5]"
                        : "border-slate-800"
                    }`}
                  >
                    {/* Responsive Video Container */}
                    <div className="aspect-video w-full bg-black relative group">
                      <VideoPlayer url={ex.videoUrl} title={ex.name} />
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                          <h3
                            className={`text-xl font-black leading-tight mb-1 ${
                              isDone ? "text-green-400 line-through" : "text-white"
                            }`}
                          >
                            {ex.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-600/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                              Goal: {ex.goal}
                            </span>
                            <button
                              onClick={() =>
                                setShowTip(showTip === ex.name ? null : ex.name)
                              }
                              className="text-slate-600 hover:text-blue-400 transition-colors"
                            >
                              <Info size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleExerciseComplete(key, ex.name)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                            isDone
                              ? "bg-green-500 text-white"
                              : "bg-slate-800 text-slate-600"
                          }`}
                        >
                          {isDone ? <CheckCircle size={28} /> : <Circle size={28} />}
                        </button>
                      </div>

                      {showTip === ex.name && (
                        <div className="mb-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/50 text-xs text-slate-400 italic leading-relaxed animate-in fade-in slide-in-from-top-2">
                          "{ex.tip}"
                        </div>
                      )}

                      {!currentWorkout.isRecovery && (
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Weight"
                              value={exerciseLogs[key]?.weight || ""}
                              onChange={(e) =>
                                updateExerciseLog(key, "weight", e.target.value)
                              }
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700 pointer-events-none">
                              KG
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Reps"
                              value={exerciseLogs[key]?.reps || ""}
                              onChange={(e) =>
                                updateExerciseLog(key, "reps", e.target.value)
                              }
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700 pointer-events-none">
                              REPS
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nutrition Tab - Enhanced */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Utensils className="text-orange-500" /> Fuel Intake
              </h2>

              <div className="space-y-10">
                {(["calories", "protein"] as const).map((type) => {
                  const target = type === "calories" ? 2200 : 160;
                  const current = dietTracking[type] || 0;
                  const pct = Math.min(100, (current / target) * 100);
                  const color = type === "calories" ? "orange" : "blue";

                  return (
                    <div key={type}>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                          {type}
                        </span>
                        <span className="text-2xl font-black text-white">
                          {current}
                          {type === "protein" ? "g" : ""}{" "}
                          <span className="text-xs text-slate-600">/ {target}</span>
                        </span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-6">
                        <div
                          className={`h-full bg-${color}-500 transition-all duration-1000`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex gap-2">
                        {[10, 50, 100].map((inc) => (
                          <button
                            key={inc}
                            onClick={() => {
                              const val = type === "calories" ? inc : inc / 5;
                              updateDietTracking(type, val);
                            }}
                            className="flex-1 bg-slate-800/50 border border-slate-800 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 active:scale-95 transition-all"
                          >
                            +
                            {type === "calories"
                              ? inc
                              : (inc / 5).toFixed(0) + "g"}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            const val = type === "calories" ? 50 : 10;
                            updateDietTracking(type, -val);
                          }}
                          className="px-4 bg-slate-800/50 border border-slate-800 rounded-2xl text-slate-600 hover:text-red-400 active:scale-95 transition-all"
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab - Enhanced */}
        {activeTab === 'stats' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center shadow-xl">
                <Flame
                  size={32}
                  className="text-orange-500 mb-4 fill-orange-500/10"
                />
                <div className="text-3xl font-black">{stats.streak}</div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                  Day Streak
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center shadow-xl">
                <Trophy
                  size={32}
                  className="text-yellow-400 mb-4 fill-yellow-400/10"
                />
                <div className="text-3xl font-black">{stats.level}</div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                  Global Rank
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {Object.keys(completedExercises)
                  .slice(-5)
                  .reverse()
                  .map((key) => {
                    if (!completedExercises[key]) return null; // Only show completed
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800/30 animate-in slide-in-from-left-2"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-black text-white">
                              {key.split("-")[1]}
                            </div>
                            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                              {key.split("-")[0]} SESSION
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-blue-500">
                          +50 XP
                        </span>
                      </div>
                    );
                  })}
                {Object.keys(completedExercises).filter(
                  (k) => completedExercises[k]
                ).length === 0 && (
                  <div className="py-12 text-center text-slate-600 italic text-sm font-medium">
                    No activity logged. Push your limits today!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Unified Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 pb-6 safe-area-bottom">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <NavButton
            active={activeTab === 'today'}
            onClick={() => {
              if (activeTab === 'today') setSelectedDate(new Date());
              setActiveTab('today');
            }}
            icon={<Home size={24} />}
            label="Schedule"
          />
          <NavButton
            active={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            icon={<CalendarIcon size={24} />}
            label="Calendar"
          />
          <NavButton
            active={activeTab === 'workouts'}
            onClick={() => setActiveTab('workouts')}
            icon={<Dumbbell size={24} />}
            label="Workouts"
          />
          <NavButton
            active={activeTab === 'nutrition'}
            onClick={() => setActiveTab('nutrition')}
            icon={<Utensils size={24} />}
            label="Nutrition"
          />
          <NavButton
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
            icon={<BarChart3 size={24} />}
            label="Stats"
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-indigo-600" : "text-gray-400"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
