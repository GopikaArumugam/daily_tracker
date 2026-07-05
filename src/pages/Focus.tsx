import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { showToast } from '../components/ui/Toast';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Timer, 
  BookOpen, 
  Sparkles
} from 'lucide-react';

export const Focus: React.FC = () => {
  const { addStudyLog, settings } = useDashboard();
  const accent = settings.accentColor as AccentColor;

  // Timer configuration
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [subject, setSubject] = useState('LeetCode');
  const [customSubject, setCustomSubject] = useState('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(true);
  
  // Seconds elapsed or remaining
  const [seconds, setSeconds] = useState(25 * 60); // 25 mins default
  
  // Track stopwatch start & elapsed seconds
  const incrementRef = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedSecondsRef = useRef<number>(0);

  // Default subject options
  const subjects = ['LeetCode', 'DBMS', 'OS', 'React', 'College', 'Other'];

  // Sync default seconds when mode changes
  useEffect(() => {
    if (!isTimerActive) {
      if (timerMode === 'pomodoro') {
        setSeconds(25 * 60);
      } else {
        setSeconds(0);
      }
    }
  }, [timerMode, isTimerActive]);

  // Timer Tick Side-effect
  useEffect(() => {
    if (isTimerActive && !isTimerPaused) {
      incrementRef.current = setInterval(() => {
        setSeconds(prev => {
          if (timerMode === 'pomodoro') {
            if (prev <= 1) {
              // Pomodoro finished!
              handleSessionComplete(25 * 60);
              return 25 * 60;
            }
            return prev - 1;
          } else {
            elapsedSecondsRef.current += 1;
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (incrementRef.current) clearInterval(incrementRef.current);
    }

    return () => {
      if (incrementRef.current) clearInterval(incrementRef.current);
    };
  }, [isTimerActive, isTimerPaused, timerMode]);

  // Start Timer
  const handleStart = () => {
    setIsTimerActive(true);
    setIsTimerPaused(false);
    if (timerMode === 'stopwatch') {
      startTimeRef.current = Date.now() - elapsedSecondsRef.current * 1000;
    }
    showToast('Focus session started! Happy studying!', 'info');
  };

  // Pause Timer
  const handlePause = () => {
    setIsTimerPaused(true);
    showToast('Session paused.', 'info');
  };

  // Reset Timer
  const handleReset = () => {
    setIsTimerActive(false);
    setIsTimerPaused(true);
    elapsedSecondsRef.current = 0;
    if (timerMode === 'pomodoro') {
      setSeconds(25 * 60);
    } else {
      setSeconds(0);
    }
    showToast('Timer reset.', 'info');
  };

  // Finish session manually
  const handleFinish = () => {
    let elapsed = 0;
    if (timerMode === 'pomodoro') {
      elapsed = 25 * 60 - seconds;
    } else {
      elapsed = seconds;
    }

    if (elapsed < 10) {
      showToast('Session too short to record! Try to study a bit longer.', 'error');
      return;
    }

    handleSessionComplete(elapsed);
  };

  // Complete and log session
  const handleSessionComplete = (elapsedSeconds: number) => {
    const finalSubject = subject === 'Other' && customSubject.trim() ? customSubject.trim() : subject;
    const hours = parseFloat((elapsedSeconds / 3600).toFixed(2));
    
    // Auto add log to database
    addStudyLog(hours, finalSubject);

    // Stop timer
    setIsTimerActive(false);
    setIsTimerPaused(true);
    elapsedSecondsRef.current = 0;

    // Trigger visual confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#a78bfa', '#c084fc', '#3b82f6']
    });

    showToast(`🎉 Logged ${hours} hours of study for ${finalSubject}! Great job!`, 'success');
  };

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <Timer className={getAccentColor(accent, 'text')} size={24} />
          <span>Focus Mode</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Lock in and block distractions. Start a countdown timer or stopwatch session to auto-track your study hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Setup Panel (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-5 flex flex-col bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div>
            <h3 className="text-sm font-semibold text-zinc-850 dark:text-zinc-200">Session Setup</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Customize your current study session</p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Timer Mode</label>
            <div className="flex bg-zinc-100/80 dark:bg-zinc-950/50 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 text-xs font-bold select-none h-[38px] items-center">
              <button
                type="button"
                disabled={isTimerActive}
                onClick={() => setTimerMode('pomodoro')}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  timerMode === 'pomodoro' 
                    ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm font-bold' 
                    : 'text-zinc-500 opacity-60'
                }`}
              >
                Pomodoro (25m)
              </button>
              <button
                type="button"
                disabled={isTimerActive}
                onClick={() => setTimerMode('stopwatch')}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  timerMode === 'stopwatch' 
                    ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm font-bold' 
                    : 'text-zinc-500 opacity-60'
                }`}
              >
                Stopwatch (Count Up)
              </button>
            </div>
            {isTimerActive && (
              <p className="text-[9px] text-zinc-400 italic">* Pause and Reset to toggle mode</p>
            )}
          </div>

          {/* Subject Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Subject</label>
            <select
              value={subject}
              disabled={isTimerActive}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100/50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:focus:border-zinc-700"
            >
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Custom Subject Input */}
          {subject === 'Other' && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Custom Subject Name</label>
              <input
                type="text"
                placeholder="Enter subject (e.g. System Design)"
                value={customSubject}
                disabled={isTimerActive}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100/50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:focus:border-zinc-700"
              />
            </div>
          )}

          {/* Subject card visual display */}
          <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/20 dark:bg-zinc-950/10">
            <div className="text-center space-y-2">
              <div className={`mx-auto p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 w-fit text-zinc-500`}>
                <BookOpen size={24} />
              </div>
              <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200">
                {subject === 'Other' && customSubject ? customSubject : subject}
              </h4>
              <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Focus Subject</p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Timer Display (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-8 rounded-2xl flex flex-col items-center justify-center space-y-8 bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40 min-h-[420px]">
          {/* Main Visual Pulsing Clock Display */}
          <div className="relative flex items-center justify-center w-64 h-64">
            {/* Animated breathing glow border */}
            <div className={`absolute inset-0 rounded-full border border-zinc-200/40 dark:border-zinc-800/40 transition-all duration-1000 ${
              isTimerActive && !isTimerPaused 
                ? 'animate-ping opacity-15 border-purple-500 bg-purple-500/10' 
                : 'opacity-100'
            }`} />
            
            <div className={`absolute inset-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 backdrop-blur-xs flex flex-col items-center justify-center space-y-1 shadow-inner transition-all duration-300 ${
              isTimerActive && !isTimerPaused 
                ? 'border-purple-400 dark:border-purple-900 shadow-purple-500/5 bg-white dark:bg-zinc-950/40 scale-105' 
                : 'scale-100'
            }`}>
              {/* Mode Icon header inside dial */}
              <div className="text-zinc-400 flex items-center gap-1">
                {timerMode === 'pomodoro' ? <Clock size={12} /> : <Timer size={12} />}
                <span className="text-[9px] uppercase font-bold tracking-widest">{timerMode}</span>
              </div>

              {/* Glowing Digit display */}
              <h2 className={`text-4xl font-extrabold font-mono tracking-tighter text-zinc-800 dark:text-zinc-100 transition-colors ${
                isTimerActive && !isTimerPaused ? 'text-purple-650 dark:text-purple-400' : ''
              }`}>
                {formatTime(seconds)}
              </h2>

              {/* Pulse status indicator */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`w-2 h-2 rounded-full ${
                  !isTimerActive ? 'bg-zinc-400' : isTimerPaused ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'
                }`} />
                <span className="text-[10px] text-zinc-500 font-medium uppercase">
                  {!isTimerActive ? 'Idle' : isTimerPaused ? 'Paused' : 'Lock-in'}
                </span>
              </div>
            </div>
          </div>

          {/* Play/Pause/Reset Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Reset Button */}
            <button
              onClick={handleReset}
              disabled={!isTimerActive}
              className={`p-3 rounded-2xl border transition-all text-zinc-500 bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 hover:scale-105 active:scale-95 ${
                !isTimerActive ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
              }`}
              title="Reset Session"
            >
              <RotateCcw size={18} />
            </button>

            {/* Play / Pause Toggle Button */}
            {!isTimerActive || isTimerPaused ? (
              <button
                onClick={handleStart}
                className={`p-4.5 rounded-3xl text-zinc-950 font-bold transition-all shadow-md hover:scale-105 active:scale-95 ${getAccentColor(accent, 'bg')}`}
                title="Start Focus Mode"
              >
                <Play size={22} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="p-4.5 rounded-3xl bg-zinc-800 hover:bg-zinc-750 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold transition-all shadow-md hover:scale-105 active:scale-95"
                title="Pause Session"
              >
                <Pause size={22} fill="currentColor" />
              </button>
            )}

            {/* Complete / Save Button */}
            <button
              onClick={handleFinish}
              disabled={!isTimerActive}
              className={`p-3 rounded-2xl border transition-all text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-450 hover:scale-105 active:scale-95 ${
                !isTimerActive ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
              }`}
              title="Finish & Save Session"
            >
              <CheckCircle2 size={18} />
            </button>
          </div>

          {/* Bottom helper guidelines */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Sparkles size={13} className="text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Finish and complete the session to log your study hours automatically!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
