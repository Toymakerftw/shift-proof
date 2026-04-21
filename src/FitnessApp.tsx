import { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  Flame,
  Calendar,
  Info,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Minus,
  Utensils,
  ExternalLink,
  Zap,
  BarChart3,
  ArrowLeft
} from "lucide-react";

const APP_ID = "fitness-chapter-2-local";

// --- Helper to get current day ID ---
const getTodayId = () => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
};

const getFormattedDate = () => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
};

/* ---------------- HELPER: VIDEO PLAYER ---------------- */

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

/* ---------------- HELPER: TIMER COMPONENT ---------------- */

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive) {
      interval = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
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
  );
};

/* ---------------- WORKOUT DATA (Original IDs) ---------------- */

const workoutSchedule = [
  {
    id: "mon",
    day: "Monday",
    title: "PUSH DAY",
    focus: "CHEST · SHOULDERS · TRICEPS",
    exercises: [
      {
        name: "Push-ups",
        goal: "3 × MAX",
        videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
        tip: "Keep core tight.",
      },
      {
        name: "DB Shoulder Press",
        goal: "3 × 10 @ 5kg",
        videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
        tip: "Don't lock elbows out completely at top.",
      },
      {
        name: "DB Lateral Raise",
        goal: "3 × 12 @ 3kg",
        videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
        tip: "Pinkies slightly up, lead with elbows.",
      },
      {
        name: "DB Chest Flyes (Floor)",
        goal: "3 × 10 @ 5kg",
        videoUrl: "https://www.youtube.com/watch?v=eozdVDA78K0",
        tip: "Slight bend in elbows.",
      },
      {
        name: "Diamond Push-ups",
        goal: "3 × 8–12",
        videoUrl: "https://youtu.be/kGhDnFwMY3E?si=DEJb7BvjlnPDqgAL",
        tip: "Hands close together forming a diamond.",
      },
      {
        name: "DB Front Raise",
        goal: "2 × 10 @ 3kg",
        videoUrl: "https://www.youtube.com/watch?v=-t7fuZ0KhDA",
        tip: "Control the weight on the way down.",
      },
    ],
  },
  {
    id: "tue",
    day: "Tuesday",
    title: "Rest Day",
    focus: "Recovery",
    isRecovery: true,
    exercises: [
      { name: "Full Rest", goal: "Relax", videoUrl: "", tip: "Get ready for Pull Day." },
    ],
  },
  {
    id: "wed",
    day: "Wednesday",
    title: "PULL DAY",
    focus: "BACK · BICEPS · REAR DELTS",
    exercises: [
      {
        name: "Pull-ups / Chin-ups",
        goal: "3 × MAX",
        videoUrl: "https://youtu.be/XeErfmGSwfE?si=Yb2EjBUj8rbAp9ZT",
        tip: "Jump up and lower slowly if you can't do full reps.",
      },
      {
        name: "DB Bent-over Row",
        goal: "3 × 10 @ 10kg",
        videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
        tip: "Pull towards your hip, not your chest.",
      },
      {
        name: "Single-arm DB Row",
        goal: "3 × 10 each @ 10kg",
        videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
        tip: "Keep back straight and parallel to the floor.",
      },
      {
        name: "DB Bicep Curls",
        goal: "3 × 10 @ 5kg",
        videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
        tip: "Rotate palms up at the top.",
      },
      {
        name: "DB Hammer Curls",
        goal: "3 × 10 @ 5kg",
        videoUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4",
        tip: "Keep elbows pinned to your sides.",
      },
      {
        name: "DB Reverse Flye",
        goal: "3 × 12 @ 3kg",
        videoUrl: "https://youtube.com/shorts/A-x6_0VrT18?si=nie3pCmha5wFqncJ",
        tip: "Focus on squeezing shoulder blades.",
      },
    ],
  },
  {
    id: "thu",
    day: "Thursday",
    title: "Rest Day",
    focus: "Recovery",
    isRecovery: true,
    exercises: [
      { name: "Full Rest", goal: "Relax", videoUrl: "", tip: "Get ready for Leg Day." },
    ],
  },
  {
    id: "fri",
    day: "Friday",
    title: "LEG DAY",
    focus: "QUADS · HAMSTRINGS · GLUTES · CORE",
    exercises: [
      {
        name: "DB Goblet Squat",
        goal: "4 × 12 @ 10kg",
        videoUrl: "https://www.youtube.com/watch?v=MeIiIdhvXT4",
        tip: "Elbows should touch inside of knees.",
      },
      {
        name: "DB Romanian Deadlift",
        goal: "3 × 10 @ 10kg each",
        videoUrl: "https://www.youtube.com/watch?v=hQgFixeXdZo",
        tip: "Hinge at hips, feel stretch in hamstrings.",
      },
      {
        name: "DB Reverse Lunge",
        goal: "3 × 10 each @ 5kg",
        videoUrl: "https://www.youtube.com/watch?v=fydLSJlGx-0",
        tip: "Keep front knee tracked over mid-foot.",
      },
      {
        name: "Glute Bridge",
        goal: "3 × 15",
        videoUrl: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E",
        tip: "Squeeze glutes at the top.",
      },
      {
        name: "Calf Raises (bodyweight)",
        goal: "3 × 20",
        videoUrl: "https://www.youtube.com/watch?v=-M4-G8p8fmc",
        tip: "Pause at the top for a second.",
      },
      {
        name: "Plank",
        goal: "3 × 30–45 sec",
        videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
        tip: "Squeeze glutes and core; don't sag.",
      },
      {
        name: "Dead Bug",
        goal: "2 × 8 each side",
        videoUrl: "https://www.youtube.com/watch?v=4XLEnwUr1d8",
        tip: "Keep lower back flat against the floor.",
      },
    ],
  },
  {
    id: "sat",
    day: "Saturday",
    title: "CARDIO DAY",
    focus: "PICK ONE · LOW INTENSITY",
    exercises: [
      {
        name: "Cycling",
        goal: "30–45 min",
        videoUrl: "https://www.youtube.com/watch?v=q3JYT_jKs7Y",
        tip: "Conversational speed. Best for IBS.",
      },
      {
        name: "Skipping Intervals",
        goal: "10 Rounds",
        videoUrl: "https://www.youtube.com/watch?v=u3zgHI8QnqE",
        tip: "30 sec on, 30 sec rest. Avoid on empty stomach.",
      },
      {
        name: "Brisk Walk",
        goal: "30 min",
        videoUrl: "https://www.youtube.com/watch?v=q3JYT_jKs7Y",
        tip: "Do this EVERY day if possible.",
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
      { name: "Full Rest", goal: "Relax", videoUrl: "", tip: "Get ready for Push Day." },
    ],
  },
];

/* ---------------- MAIN APP COMPONENT ---------------- */

interface FitnessAppProps {
  onExit: () => void;
}

export default function FitnessApp({ onExit }: FitnessAppProps) {
  // Initialize activeTab based on browser date
  const [activeTab, setActiveTab] = useState(() => getTodayId());
  const [currentView, setCurrentView] = useState("workouts");
  const [showTip, setShowTip] = useState<string | null>(null);

  // Store today's ID for visual highlighting
  const todayId = getTodayId();

  // Local State replacing Firebase Data
  const [localData, setLocalData] = useState({
    completed: {} as Record<string, boolean>,
    logs: {} as Record<string, { weight?: string; reps?: string }>,
    diet: { calories: 0, protein: 0 },
    stats: { streak: 0, level: 1, xp: 0 },
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`${APP_ID}-progress`);
    if (saved) {
      try {
        setLocalData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem(`${APP_ID}-progress`, JSON.stringify(localData));
  }, [localData]);

  const toggleComplete = (exName: string) => {
    const key = `${activeTab}-${exName}`;
    const isCurrentlyDone = !!localData.completed[key];
    
    // XP Logic
    const xpGain = !isCurrentlyDone ? 50 : -50;
    const newXp = Math.max(0, localData.stats.xp + xpGain);
    const newLevel = Math.floor(newXp / 1000) + 1;

    setLocalData((prev) => ({
      ...prev,
      completed: { ...prev.completed, [key]: !isCurrentlyDone },
      stats: { ...prev.stats, xp: newXp, level: newLevel },
    }));
  };

  const updateLog = (exName: string, field: string, val: string) => {
    const key = `${activeTab}-${exName}`;
    setLocalData((prev) => ({
      ...prev,
      logs: {
        ...prev.logs,
        [key]: { ...(prev.logs[key] || {}), [field]: val },
      },
    }));
  };

  const updateDiet = (type: "calories" | "protein", amount: number) => {
    setLocalData((prev) => {
      const current = prev.diet[type] || 0;
      return {
        ...prev,
        diet: {
          ...prev.diet,
          [type]: Math.max(0, current + amount),
        },
      };
    });
  };

  const currentWorkout = workoutSchedule.find((d) => d.id === activeTab);

  if (!currentWorkout) return null;

  const doneCount = currentWorkout.exercises.filter(
    (ex) => localData.completed[`${activeTab}-${ex.name}`]
  ).length;
  const progress = Math.round(
    (doneCount / currentWorkout.exercises.length) * 100
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-32 selection:bg-blue-500/30 fixed inset-0 z-50 overflow-y-auto">
      {/* Dynamic Progress Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <button onClick={onExit} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft size={20} />
               </button>
              <div className="relative">
                <Zap className="text-yellow-400 fill-yellow-400" size={24} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-sm font-black tracking-widest uppercase text-slate-400">
                  Level {localData.stats.level}
                </h1>
                <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${(localData.stats.xp % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-right">
               <div className="text-xs font-bold text-blue-400">{getFormattedDate()}</div>
               <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{currentWorkout.day} Focus</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {currentView === "workouts" && (
          <div className="space-y-6">
            {/* Horizontal Calendar */}
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-4 px-4">
              {workoutSchedule.map((day) => {
                const isToday = day.id === todayId;
                return (
                <button
                  key={day.id}
                  onClick={() => setActiveTab(day.id)}
                  className={`flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all border relative ${
                    activeTab === day.id
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
              )})}
            </div>

            {/* Workout Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Trophy size={100} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white leading-tight">
                  {currentWorkout.title}
                </h2>
                <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mt-1 mb-6">
                  {currentWorkout.focus}
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

                <Timer />
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
              {currentWorkout.exercises.map((ex, idx) => {
                const key = `${activeTab}-${ex.name}`;
                const isDone = localData.completed[key];
                const log = localData.logs[key] || { weight: "", reps: "" };

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
                          onClick={() => toggleComplete(ex.name)}
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
                          " {ex.tip} "
                        </div>
                      )}

                      {!currentWorkout.isRecovery && (
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Weight"
                              value={log.weight}
                              onChange={(e) =>
                                updateLog(ex.name, "weight", e.target.value)
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
                              value={log.reps}
                              onChange={(e) =>
                                updateLog(ex.name, "reps", e.target.value)
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

        {currentView === "diet" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Utensils className="text-orange-500" /> Fuel Intake
              </h2>

              <div className="space-y-10">
                {(["calories", "protein"] as const).map((type) => {
                  const target = type === "calories" ? 2200 : 160;
                  const current = localData.diet[type] || 0;
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
                              updateDiet(type, val);
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
                            updateDiet(type, -val);
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

        {currentView === "stats" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center shadow-xl">
                <Flame
                  size={32}
                  className="text-orange-500 mb-4 fill-orange-500/10"
                />
                <div className="text-3xl font-black">{localData.stats.streak}</div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                  Day Streak
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center shadow-xl">
                <Trophy
                  size={32}
                  className="text-yellow-400 mb-4 fill-yellow-400/10"
                />
                <div className="text-3xl font-black">{localData.stats.level}</div>
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
                {Object.keys(localData.completed)
                  .slice(-5)
                  .reverse()
                  .map((key) => {
                    if (!localData.completed[key]) return null; // Only show completed
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
                {Object.keys(localData.completed).filter(
                  (k) => localData.completed[k]
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

      {/* Futuristic Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-3xl border-t border-white/5 px-8 pb-8 pt-4 flex justify-between items-center z-50">
        <button
          onClick={() => setCurrentView("workouts")}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${
            currentView === "workouts"
              ? "text-blue-400 scale-110"
              : "text-slate-600"
          }`}
        >
          <div
            className={`p-2 rounded-xl transition-colors ${
              currentView === "workouts" ? "bg-blue-600/10" : ""
            }`}
          >
            <Calendar
              size={24}
              className={currentView === "workouts" ? "fill-blue-400/10" : ""}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            Training
          </span>
        </button>

        <button
          onClick={() => setCurrentView("diet")}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${
            currentView === "diet" ? "text-orange-400 scale-110" : "text-slate-600"
          }`}
        >
          <div
            className={`p-2 rounded-xl transition-colors ${
              currentView === "diet" ? "bg-orange-600/10" : ""
            }`}
          >
            <Utensils
              size={24}
              className={currentView === "diet" ? "fill-orange-400/10" : ""}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            Fuel
          </span>
        </button>

        <button
          onClick={() => setCurrentView("stats")}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${
            currentView === "stats"
              ? "text-green-400 scale-110"
              : "text-slate-600"
          }`}
        >
          <div
            className={`p-2 rounded-xl transition-colors ${
              currentView === "stats" ? "bg-green-600/10" : ""
            }`}
          >
            <BarChart3
              size={24}
              className={currentView === "stats" ? "fill-green-400/10" : ""}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            Growth
          </span>
        </button>
      </nav>
    </div>
  );
}
