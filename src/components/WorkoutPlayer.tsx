import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, CheckCircle, Timer, RotateCcw } from 'lucide-react';
import { WORKOUT_PLAN, WORKOUT_SETTINGS } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkoutPlayerProps {
  onClose: () => void;
  onComplete: () => void;
}

type Stage = 'get-ready' | 'work' | 'rest' | 'complete';

export default function WorkoutPlayer({ onClose, onComplete }: WorkoutPlayerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [stage, setStage] = useState<Stage>('get-ready');
  const [timeLeft, setTimeLeft] = useState(5); // 5s get ready
  const [isActive, setIsActive] = useState(true);
  
  const timerRef = useRef<number | null>(null);
  const currentExercise = WORKOUT_PLAN[currentExerciseIndex];
  const totalSets = currentExercise.sets;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, stage]);

  const handleTimerComplete = () => {
    if (stage === 'get-ready') {
      setStage('work');
      // If timed exercise (Plank), set duration
      if (currentExercise.isTimed) {
        setTimeLeft(currentExercise.duration || 60);
      } else {
        setIsActive(false); // Stop timer for reps-based, wait for user input
      }
    } else if (stage === 'work') {
      // Work timer finished (for timed exercises)
      handleSetComplete();
    } else if (stage === 'rest') {
      // Rest finished
      startNextSet();
    }
  };

  const startNextSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1);
      setStage('work');
      if (currentExercise.isTimed) {
        setTimeLeft(currentExercise.duration || 60);
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    } else {
      // Exercise complete, move to next exercise
      if (currentExerciseIndex < WORKOUT_PLAN.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        setStage('work');
        if (WORKOUT_PLAN[currentExerciseIndex + 1].isTimed) {
          setTimeLeft(WORKOUT_PLAN[currentExerciseIndex + 1].duration || 60);
          setIsActive(true);
        } else {
          setIsActive(false);
        }
      } else {
        setStage('complete');
        onComplete();
      }
    }
  };

  const handleSetComplete = () => {
    // If it's the last set of the last exercise, finish immediately
    if (currentExerciseIndex === WORKOUT_PLAN.length - 1 && currentSet === totalSets) {
      setStage('complete');
      onComplete();
      return;
    }

    setStage('rest');
    // Determine rest time
    const isLastSet = currentSet === totalSets;
    const restTime = isLastSet ? WORKOUT_SETTINGS.restBetweenExercises : WORKOUT_SETTINGS.restBetweenSets;
    setTimeLeft(restTime);
    setIsActive(true);
  };

  const skipRest = () => {
    handleTimerComplete();
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  if (stage === 'complete') {
    return (
      <div className="fixed inset-0 bg-indigo-600 z-50 flex flex-col items-center justify-center text-white p-6 animate-in fade-in">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-indigo-600">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Workout Complete!</h2>
        <p className="text-indigo-100 mb-8">Great job sticking to the plan.</p>
        <button 
          onClick={onClose}
          className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors"
        >
          Finish
        </button>
      </div>
    );
  }

  const progress = ((currentExerciseIndex) / WORKOUT_PLAN.length) * 100;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
        <button onClick={onClose} className="ml-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700">
          <X size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {stage === 'get-ready' ? (
          <div className="animate-in zoom-in duration-300">
            <h3 className="text-gray-400 font-bold uppercase tracking-wider mb-4">Get Ready</h3>
            <div className="text-8xl font-black tabular-nums text-indigo-400 mb-8">
              {timeLeft}
            </div>
            <h2 className="text-2xl font-bold">{currentExercise.exercise}</h2>
          </div>
        ) : stage === 'rest' ? (
          <div className="animate-in fade-in">
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider mb-4">Rest</h3>
            <div className="text-8xl font-black tabular-nums mb-8">
              {timeLeft}
            </div>
            <p className="text-gray-400 mb-2">Next Up:</p>
            <h2 className="text-xl font-bold">
              {currentSet === totalSets 
                ? (WORKOUT_PLAN[currentExerciseIndex + 1]?.exercise || 'Finish') 
                : currentExercise.exercise}
            </h2>
            <button 
              onClick={skipRest}
              className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white px-4 py-2 border border-gray-700 rounded-full"
            >
              <SkipForward size={16} /> Skip Rest
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md animate-in slide-in-from-bottom-8">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                Set {currentSet} / {totalSets}
              </span>
              {currentExercise.isTimed && (
                <span className="bg-gray-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Timer size={12} /> Timed
                </span>
              )}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentExercise.exercise}</h2>
            
            {currentExercise.isTimed ? (
              <div className="text-7xl font-black tabular-nums text-indigo-400 mb-8">
                {timeLeft}
              </div>
            ) : (
              <div className="text-5xl font-black text-indigo-400 mb-8">
                {currentExercise.reps}
              </div>
            )}

            <div className="bg-gray-800/50 p-6 rounded-2xl mb-8 text-left">
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                {currentExercise.description}
              </p>
              <ul className="space-y-2">
                {currentExercise.instructions?.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 pb-safe-area-bottom bg-gray-800 border-t border-gray-700">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={toggleTimer}
            className={cn(
              "p-4 rounded-full transition-colors",
              isActive ? "bg-gray-700 text-white" : "bg-emerald-600 text-white"
            )}
            disabled={stage === 'work' && !currentExercise.isTimed} // Disable pause for untimed work (since it's manual completion)
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {stage === 'work' && (
            <button 
              onClick={handleSetComplete}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              {currentExercise.isTimed ? 'Finish Early' : 'Set Complete'} <CheckCircle size={20} />
            </button>
          )}
          
          {stage === 'rest' && (
             <button 
             onClick={() => setTimeLeft(prev => prev + 10)}
             className="p-4 bg-gray-700 rounded-full text-white hover:bg-gray-600"
           >
             <RotateCcw size={24} /> <span className="sr-only">+10s</span>
           </button>
          )}
        </div>
      </div>
    </div>
  );
}