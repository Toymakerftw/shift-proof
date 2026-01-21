import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Home, Bell, ChevronLeft, ChevronRight, RotateCcw, Dumbbell, Utensils, BarChart3, CheckCircle, Circle, Play, Pause, Minus, ExternalLink, Info, Trophy, Flame, Moon, Sun, Briefcase } from 'lucide-react';
import { SHIFT_PROTOCOLS, type ShiftType, type ScheduleProtocol } from './constants';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays, subDays } from 'date-fns';
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

// --- Helper to get current day ID ---
const getTodayId = () => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
};

/* ---------------- WORKOUT DATA ---------------- */
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

// --- Reusable UI Components ---

function GlassCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-card)] border border-white/5 bg-surface p-6 transition-all",
        onClick && "active:scale-98 cursor-pointer hover:bg-slate-800/50",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon?: any, title: string, subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {Icon && <Icon size={20} className="text-primary" />}
      <div>
        <h2 className="text-lg font-bold text-white leading-none">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- Main App ---

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



  const toggleExerciseComplete = (key: string) => {
    const isCurrentlyDone = !!completedExercises[key];
    const xpChange = isCurrentlyDone ? -50 : 50;
    const newXp = Math.max(0, stats.xp + xpChange);
    const newLevel = Math.floor(newXp / 1000) + 1;

    if (!isCurrentlyDone) {
      setStats((prev: { xp: number; level: number; streak: number }) => ({ ...prev, xp: newXp, level: newLevel, streak: prev.streak + 1 }));
    } else {
      setStats((prev: { xp: number; level: number; streak: number }) => ({ ...prev, xp: newXp, level: newLevel, streak: Math.max(0, prev.streak - 1) }));
    }

    setCompletedExercises(prev => ({ ...prev, [key]: !isCurrentlyDone }));
  };

  const updateDietTracking = (type: 'calories' | 'protein', amount: number) => {
    setDietTracking((prev: { calories: number; protein: number }) => {
      const current = prev[type] || 0;
      return { ...prev, [type]: Math.max(0, current + amount) };
    });
  };

  const currentWorkout = workoutSchedule.find(w => w.id === activeWorkoutDay);
  const doneCount = currentWorkout?.exercises.filter((ex) => completedExercises[`${activeWorkoutDay}-${ex.name}`]).length || 0;
  const progress = currentWorkout ? Math.round((doneCount / currentWorkout.exercises.length) * 100) : 0;

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

  // Timer Effect
  useEffect(() => {
    let interval: number | null = null;
    if (isActive) {
      interval = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive]);

  const VideoPlayer = ({ url, title }: { url: string; title: string }) => {
    if (!url) return <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700 italic text-sm">No video</div>;
    if (url.endsWith(".mp4")) return <video className="w-full h-full object-cover" controls playsInline muted loop><source src={url} type="video/mp4" /></video>;
    
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];

    if (videoId) return <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`} title={title} allowFullScreen />;

    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-900 text-primary hover:bg-slate-800 transition-colors">
        <ExternalLink size={24} /> <span className="text-xs font-bold uppercase">Watch Tutorial</span>
      </a>
    );
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = getDay(monthStart);

  return (
    <div className="min-h-screen pb-32 font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
            SHIFT<span className="text-primary">PROOF</span>
          </h1>
          <button
            onClick={requestNotificationPermission}
            className={cn(
              "p-2 rounded-full transition-all active:scale-95",
              notificationsEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-surface text-slate-400"
            )}
          >
            <Bell size={20} className={notificationsEnabled ? "fill-current" : ""} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {activeTab === 'today' && (
          <div className="animate-in space-y-6">
            {/* Date Strip */}
            <div className="flex items-center justify-between bg-surface p-2 rounded-2xl border border-white/5">
              <button onClick={() => setSelectedDate(prev => subDays(prev, 1))} className="p-3 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
              <div className="flex flex-col items-center">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isSameDay(selectedDate, new Date()) ? "Today" : format(selectedDate, 'EEE, MMM d')}
                </h2>
                {!isSameDay(selectedDate, new Date()) && (
                  <button onClick={() => setSelectedDate(new Date())} className="text-[10px] font-bold text-primary mt-1 flex items-center gap-1 hover:underline">
                    <RotateCcw size={10} /> RETURN
                  </button>
                )}
              </div>
              <button onClick={() => setSelectedDate(prev => addDays(prev, 1))} className="p-3 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"><ChevronRight size={20} /></button>
            </div>

            {!currentShift ? (
              <GlassCard className="text-center py-10 border-dashed border-slate-700">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <CalendarIcon size={32} />
                </div>
                <h3 className="font-bold text-white text-lg">No Shift Scheduled</h3>
                <p className="text-slate-400 text-sm mt-2 mb-6">Select your shift type to generate your protocol.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['Regular', 'Early Morning', 'Afternoon', 'Night', 'Weekoff'] as ShiftType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => handleSetShift(type)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95",
                        type === 'Weekoff' 
                          ? "col-span-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-surface-hover border-white/5 text-slate-300 hover:bg-slate-700"
                      )}
                    >
                      <div className="text-sm font-bold">{type}</div>
                      <div className="text-[10px] opacity-60 mt-1">
                         {type === 'Weekoff' ? 'Recovery Mode' : SHIFT_PROTOCOLS[type]?.shiftTime}
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <>
                {/* Hero Shift Card */}
                <div className="relative group">
                   <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-[var(--radius-card)] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                   <GlassCard className="relative bg-gradient-to-br from-surface to-slate-900 border-primary/20">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">Active Protocol</span>
                        <h3 className="text-3xl font-black text-white">{currentShift}</h3>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        {currentShift === 'Night' ? <Moon size={24} /> : currentShift === 'Weekoff' ? <CheckCircle size={24} /> : <Sun size={24} />}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <Briefcase size={16} className="mt-0.5 text-slate-400" />
                        <div>
                           <div className="text-xs font-bold text-slate-300">Shift Time</div>
                           <div className="text-sm font-medium text-slate-400">{protocol?.shiftTime}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <Moon size={16} className="mt-0.5 text-slate-400" />
                        <div>
                           <div className="text-xs font-bold text-slate-300">Sleep Window</div>
                           <div className="text-sm font-medium text-slate-400">{protocol?.sleep.main}</div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Timeline / Meals */}
                <GlassCard>
                  <SectionHeader title="Daily Schedule" subtitle="Meals & Actions" />
                  <div className="relative pl-4 space-y-6 border-l border-white/10 ml-2">
                    {protocol?.meals.map((meal, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-800 border border-slate-600"></div>
                        <div className="text-xs font-bold text-primary mb-0.5">{meal.time}</div>
                        <div className="text-sm font-bold text-white">{meal.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{meal.description}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-in">
             <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setSelectedDate(subDays(startOfMonth(selectedDate), 1))} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><ChevronLeft size={20} /></button>
                <h2 className="text-lg font-bold text-white">{format(selectedDate, 'MMMM yyyy')}</h2>
                <button onClick={() => setSelectedDate(addDays(endOfMonth(selectedDate), 1))} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><ChevronRight size={20} /></button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[10px] font-bold text-slate-500 uppercase">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                {daysInMonth.map(day => {
                  const dayShift = shifts.find(s => isSameDay(new Date(s.date), day));
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  
                  let dotColor = "bg-slate-700";
                  if (dayShift?.type === 'Night') dotColor = "bg-purple-500";
                  else if (dayShift?.type === 'Weekoff') dotColor = "bg-emerald-500";
                  else if (dayShift) dotColor = "bg-primary";

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "aspect-square rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-1 transition-all",
                        isSelected ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface-hover text-slate-400 hover:bg-slate-700",
                        isToday && !isSelected && "ring-1 ring-primary text-primary"
                      )}
                    >
                      <span>{format(day, 'd')}</span>
                      <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : dotColor)} />
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="space-y-6 animate-in">
             {/* Horizontal Calendar */}
             <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar -mx-4 px-4">
              {workoutSchedule.map((day) => {
                const isToday = day.id === getTodayId();
                const isActive = activeWorkoutDay === day.id;
                return (
                  <button
                    key={day.id}
                    onClick={() => setActiveWorkoutDay(day.id)}
                    className={cn(
                      "flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border relative",
                      isActive 
                        ? "bg-primary border-primary text-white shadow-xl shadow-primary/30 scale-105 z-10" 
                        : "bg-surface border-white/5 text-slate-500 hover:bg-surface-hover"
                    )}
                  >
                    {isToday && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>}
                    <span className="text-[10px] font-bold uppercase mb-1 opacity-60">{day.day.substring(0, 3)}</span>
                    <span className="text-lg font-black">{day.id === "wed" ? "⚡" : day.id === "sun" ? "R" : day.day.substring(0, 1)}</span>
                  </button>
                )
              })}
            </div>

            {/* Workout Header Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-surface to-slate-950 border border-white/5 p-8 shadow-2xl">
               <div className="absolute -right-8 -top-8 text-white/5"><Trophy size={140} /></div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-black text-white leading-tight mb-2">{currentWorkout?.title}</h2>
                  <p className="text-primary font-bold text-xs uppercase tracking-widest mb-6">{currentWorkout?.focus}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-8">
                     <div className="flex justify-between text-xs font-bold mb-2 text-slate-400">
                        <span>PROGRESS</span>
                        <span className="text-white">{progress}%</span>
                     </div>
                     <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                     </div>
                  </div>

                  {/* Built-in Timer */}
                   <div className="bg-slate-900/50 p-4 rounded-3xl flex items-center justify-between border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                         <button onClick={() => { setSeconds(0); setIsActive(false); }} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><RotateCcw size={16} /></button>
                         <div className="font-mono text-2xl font-black text-white tabular-nums">{formatTime(seconds)}</div>
                      </div>
                      <button onClick={() => setIsActive(!isActive)} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95", isActive ? "bg-warning text-white" : "bg-primary text-white")}>
                         {isActive ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                      </button>
                   </div>
               </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              {currentWorkout?.exercises.map((ex, idx) => {
                const key = `${activeWorkoutDay}-${ex.name}`;
                const isDone = completedExercises[key];
                
                return (
                  <GlassCard key={idx} className={cn("p-0 overflow-hidden", isDone && "opacity-60 grayscale")}>
                     {/* Video Area */}
                     <div className="aspect-video bg-black relative">
                        <VideoPlayer url={ex.videoUrl} title={ex.name} />
                     </div>
                     
                     {/* Content */}
                     <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex-1 pr-4">
                              <h3 className={cn("text-lg font-bold leading-tight mb-1", isDone ? "text-emerald-500 line-through" : "text-white")}>{ex.name}</h3>
                              <div className="flex items-center gap-2">
                                 <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">{ex.goal}</span>
                                 <button onClick={() => setShowTip(showTip === ex.name ? null : ex.name)} className="text-slate-500 hover:text-white transition-colors"><Info size={14} /></button>
                              </div>
                           </div>
                           <button onClick={() => toggleExerciseComplete(key)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90", isDone ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-slate-600")}>
                              {isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
                           </button>
                        </div>
                        
                        {showTip === ex.name && (
                           <div className="bg-slate-900/50 p-3 rounded-xl text-xs text-slate-400 italic mb-4 border border-white/5 animate-in">"{ex.tip}"</div>
                        )}

                        {!currentWorkout.isRecovery && (
                           <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                 <input type="text" placeholder="0" value={exerciseLogs[key]?.weight || ""} onChange={(e) => updateExerciseLog(key, "weight", e.target.value)} 
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary transition-all text-center" />
                                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 pointer-events-none">KG</span>
                              </div>
                              <div className="relative">
                                 <input type="text" placeholder="0" value={exerciseLogs[key]?.reps || ""} onChange={(e) => updateExerciseLog(key, "reps", e.target.value)} 
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary transition-all text-center" />
                                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 pointer-events-none">REPS</span>
                              </div>
                           </div>
                        )}
                     </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-6 animate-in">
             <GlassCard className="p-8">
                <SectionHeader icon={Utensils} title="Fuel Intake" subtitle="Daily Targets" />
                <div className="space-y-8 mt-6">
                  {(["calories", "protein"] as const).map((type) => {
                     const target = type === "calories" ? 2200 : 160;
                     const current = dietTracking[type] || 0;
                     const pct = Math.min(100, (current / target) * 100);
                     const color = type === "calories" ? "bg-warning" : "bg-primary";
                     
                     return (
                        <div key={type}>
                           <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{type}</span>
                              <span className="text-xl font-black text-white">{current}<span className="text-xs text-slate-500 font-medium ml-1">/ {target}</span></span>
                           </div>
                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                              <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${pct}%` }}></div>
                           </div>
                           <div className="flex gap-2">
                              {[10, 50, 100].map(inc => (
                                 <button key={inc} onClick={() => updateDietTracking(type, type === "calories" ? inc : inc/5)} className="flex-1 py-2 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all">
                                    +{type === "calories" ? inc : (inc/5).toFixed(0)}
                                 </button>
                              ))}
                              <button onClick={() => updateDietTracking(type, type === "calories" ? -50 : -10)} className="px-3 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 active:scale-95 transition-all"><Minus size={14} /></button>
                           </div>
                        </div>
                     )
                  })}
                </div>
             </GlassCard>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6 animate-in">
             <div className="grid grid-cols-2 gap-4">
                <GlassCard className="flex flex-col items-center justify-center p-8">
                   <Flame size={32} className="text-orange-500 mb-3" />
                   <div className="text-4xl font-black text-white">{stats.streak}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Day Streak</div>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center p-8">
                   <Trophy size={32} className="text-yellow-400 mb-3" />
                   <div className="text-4xl font-black text-white">{stats.level}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Level</div>
                </GlassCard>
             </div>
             
             <GlassCard>
                <SectionHeader title="Recent Activity" />
                <div className="space-y-3 mt-4">
                  {Object.keys(completedExercises).slice(-5).reverse().map(key => {
                     if (!completedExercises[key]) return null;
                     return (
                        <div key={key} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-white/5">
                           <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle size={16} /></div>
                           <div>
                              <div className="text-sm font-bold text-white">{key.split("-")[1]}</div>
                              <div className="text-[9px] font-bold text-slate-500 uppercase">{key.split("-")[0]} SESSION</div>
                           </div>
                        </div>
                     )
                  })}
                  {Object.keys(completedExercises).filter(k => completedExercises[k]).length === 0 && (
                     <div className="text-center py-8 text-sm text-slate-500 italic">No activity recorded yet.</div>
                  )}
                </div>
             </GlassCard>
          </div>
        )}
      </main>

      {/* Floating Dock Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-2xl z-50 flex items-center gap-1 shadow-black/50">
         <NavButton active={activeTab === 'today'} onClick={() => setActiveTab('today')} icon={<Home size={20} />} />
         <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={20} />} />
         
         <div className="w-px h-8 bg-white/10 mx-1"></div>
         
         <NavButton active={activeTab === 'workouts'} onClick={() => setActiveTab('workouts')} icon={<Dumbbell size={24} />} isMain />
         
         <div className="w-px h-8 bg-white/10 mx-1"></div>

         <NavButton active={activeTab === 'nutrition'} onClick={() => setActiveTab('nutrition')} icon={<Utensils size={20} />} />
         <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={20} />} />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, isMain }: { active: boolean; onClick: () => void; icon: React.ReactNode, isMain?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center transition-all duration-300 rounded-xl",
        isMain ? "w-14 h-14" : "w-12 h-12",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/25 scale-110" 
          : "text-slate-400 hover:text-white hover:bg-white/5",
        !active && isMain && "bg-surface-hover border border-white/5 text-slate-300"
      )}
    >
      {icon}
      {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50"></span>}
    </button>
  );
}