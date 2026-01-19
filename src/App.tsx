import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ClipboardList, Utensils, Home, Bell, Circle, Play, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { SHIFT_PROTOCOLS, WORKOUT_PLAN, NUTRITION_PLAN, type ShiftType, type ScheduleProtocol } from './constants';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays, subDays, isTomorrow, isYesterday } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import WorkoutPlayer from './components/WorkoutPlayer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'today' | 'calendar' | 'workout' | 'nutrition';

interface DayShift {
  date: string;
  type: ShiftType;
}

interface CompletedWorkout {
  date: string;
  timestamp: number;
}

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
  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkout[]>(() => {
    const saved = localStorage.getItem('workoutHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

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

  const handleWorkoutComplete = () => {
    setWorkoutHistory(prev => [...prev, { date: new Date().toISOString(), timestamp: Date.now() }]);
    setIsWorkoutActive(false);
  };

  const currentShift = shifts.find(s => isSameDay(new Date(s.date), selectedDate))?.type;
  const protocol = getDailyProtocol(selectedDate, shifts);

  const handleSetShift = (type: ShiftType) => {
    const newShifts = shifts.filter(s => !isSameDay(new Date(s.date), selectedDate));
    newShifts.push({ date: selectedDate.toISOString(), type });
    setShifts(newShifts);
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = getDay(monthStart); // 0 = Sunday, 1 = Monday...

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 font-sans">
      {/* Workout Player Overlay */}
      {isWorkoutActive && (
        <WorkoutPlayer 
          onClose={() => setIsWorkoutActive(false)} 
          onComplete={handleWorkoutComplete}
        />
      )}

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
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
                  <p className="text-indigo-900 mb-4">No shift set for {isSameDay(selectedDate, new Date()) ? 'today' : 'this day'}</p>
                  <button 
                    onClick={() => setActiveTab('calendar')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Assign Shift
                  </button>
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
                  const hasWorkout = workoutHistory.some(w => isSameDay(new Date(w.date), day));
                  
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
                        {hasWorkout && (
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected ? "bg-white" : "bg-orange-400"
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

        {activeTab === 'workout' && (
          <div className="space-y-4 animate-in fade-in">
             <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Push/Pull/Legs</h2>
                    <p className="text-indigo-100 text-sm mt-1">3 Days Per Week • Full Body Hybrid</p>
                  </div>
                  <div className="text-center bg-indigo-500/30 p-2 rounded-lg backdrop-blur-sm">
                    <div className="text-xs text-indigo-200 uppercase tracking-wider">Done</div>
                    <div className="text-xl font-bold">{workoutHistory.length}</div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4 text-xs font-medium">
                  <span className="bg-indigo-500 px-2 py-1 rounded">Rest: 60-90s</span>
                  <span className="bg-indigo-500 px-2 py-1 rounded">Tempo: 3s down / 1s up</span>
                </div>

                <button 
                  onClick={() => setIsWorkoutActive(true)}
                  className="mt-6 w-full bg-white text-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
                >
                  <Play size={20} fill="currentColor" /> Start Workout
                </button>
             </div>

             <div className="space-y-2">
               {WORKOUT_PLAN.map((ex, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl border flex items-center justify-between group">
                    <div className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{ex.exercise}</h4>
                        <p className="text-xs text-gray-500">{ex.target}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-600">{ex.sets} × {ex.reps}</div>
                    </div>
                 </div>
               ))}
             </div>
             
             <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
               <p className="text-xs text-amber-800">
                 <strong>Note:</strong> If you get Resistance Bands, add Face Pulls (3 sets of 20) at the end for posture.
               </p>
             </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Daily Target</span>
                <div className="text-lg font-bold text-emerald-900">~1800 kcal</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-blue-600 uppercase">Protein</span>
                <div className="text-lg font-bold text-blue-900">~140g</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold px-1">Meal Template (Ovo-Vegetarian)</h3>
              {NUTRITION_PLAN.meals.map((meal, idx) => (
                <div key={idx} className="bg-white rounded-xl border overflow-hidden shadow-sm">
                  <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <h4 className="font-bold text-sm">{meal.label}</h4>
                    <span className="text-[10px] font-medium text-gray-500">{meal.target}</span>
                  </div>
                  <ul className="p-3 space-y-2">
                    {meal.items.map((item, i) => (
                      <li key={i} className="text-xs flex gap-2">
                        <div className="mt-1"><Circle size={8} className="fill-indigo-400 text-indigo-400" /></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <ClipboardList size={18} />
                Supplements
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {NUTRITION_PLAN.supplements.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-indigo-800 pb-2 last:border-0 last:pb-0">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-[10px] text-indigo-300">{s.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
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
            active={activeTab === 'workout'} 
            onClick={() => setActiveTab('workout')}
            icon={<ClipboardList size={24} />}
            label="Workout"
          />
          <NavButton 
            active={activeTab === 'nutrition'} 
            onClick={() => setActiveTab('nutrition')}
            icon={<Utensils size={24} />}
            label="Eats"
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