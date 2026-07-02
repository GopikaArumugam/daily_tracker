import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { showToast } from '../components/ui/Toast';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare, 
  Code2, 
  FileText,
  Smile,
  Clock,
  Plus
} from 'lucide-react';

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '⚙️', label: 'Productive' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🧠', label: 'Focused' },
  { emoji: '🛠️', label: 'Coding' },
  { emoji: '📈', label: 'Stressed' }
];

export const Calendar: React.FC = () => {
  const { tasks, studyLogs, leetCodeStats, notes, settings, addStudyLog } = useDashboard();
  const accent = settings.accentColor as AccentColor;

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  // Mood logs state (persisted)
  const [moods, setMoods] = useLocalStorage<Record<string, string>>('dashboard_moods', {
    [new Date().toISOString().split('T')[0]]: '⚙️'
  });

  // Study log input
  const [newStudyHours, setNewStudyHours] = useState<number>(1);
  const [newStudySubject, setNewStudySubject] = useState<string>('LeetCode');

  // Month traversal
  const prevMonth = () => {
    setCurrentMonthDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return next;
    });
  };

  const nextMonth = () => {
    setCurrentMonthDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  };

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create dates array
  const calendarCells: (Date | null)[] = [];
  
  // Padding cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }

  // Days in month cells
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(new Date(year, month, i));
  }

  // Next month padding cells to complete final row
  const totalCells = Math.ceil(calendarCells.length / 7) * 7;
  const paddingCount = totalCells - calendarCells.length;
  for (let i = 0; i < paddingCount; i++) {
    calendarCells.push(null);
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Compile day stats for a date
  const getCellStats = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const hasTasks = tasks.some(t => t.dueDate === dateStr);
    const hasStudy = studyLogs.some(log => log.date === dateStr);
    const hasLeetCode = (leetCodeStats.history[dateStr] || 0) > 0;
    const hasNotes = notes.some(n => n.date === dateStr);
    const mood = moods[dateStr] || null;

    return { dateStr, hasTasks, hasStudy, hasLeetCode, hasNotes, mood };
  };

  // Details for selectedDate
  const selectedTasks = tasks.filter(t => t.dueDate === selectedDate);
  const selectedStudy = studyLogs.filter(log => log.date === selectedDate);
  const selectedLeetCodeSolved = leetCodeStats.history[selectedDate] || 0;
  const selectedNotes = notes.filter(n => n.date === selectedDate);
  const selectedMood = moods[selectedDate] || null;

  const handleMoodSelect = (emoji: string) => {
    setMoods(prev => ({
      ...prev,
      [selectedDate]: emoji
    }));
    showToast(`Logged mood ${emoji} for today!`, 'success');
  };

  const handleStudySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudyHours <= 0 || !newStudySubject.trim()) return;

    addStudyLog(newStudyHours, newStudySubject, selectedDate);
    setNewStudyHours(1);
    setNewStudySubject('LeetCode');
    showToast(`Logged ${newStudyHours}h study for ${newStudySubject}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <CalendarDays size={20} className={getAccentColor(accent, 'text')} />
          <span>Calendar Logbook</span>
        </h2>
        <p className="text-xs text-zinc-500">Log study hours, track mood, and audit tasks day by day</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Monthly Grid (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-5 rounded-2xl space-y-4">
          {/* Header Month navigation */}
          <div className="flex items-center justify-between pb-3 border-zinc-100 dark:border-zinc-800/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {formatMonthYear(currentMonthDate)}
            </h3>
            
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg border text-slate-450 hover:text-zinc-200 border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg border text-slate-450 hover:text-zinc-200 border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Weekdays row */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                if (cell === null) {
                  return <div key={`empty-${idx}`} className="aspect-square opacity-0 pointer-events-none" />;
                }

                const { dateStr, hasTasks, hasStudy, hasLeetCode, hasNotes, mood } = getCellStats(cell);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const dayNum = cell.getDate();

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square relative rounded-xl border flex flex-col items-center justify-center transition-all p-1.5 ${
                      isSelected
                        ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'border')} font-bold text-zinc-800 dark:text-zinc-100`
                        : isToday
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold dark:bg-zinc-900 light:bg-zinc-200 light:border-slate-350'
                        : 'bg-zinc-950/20 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-800 dark:bg-zinc-950/20 dark:border-zinc-800 dark:hover:bg-zinc-900 light:bg-zinc-50 light:border-zinc-200'
                    }`}
                  >
                    {/* Day number */}
                    <span className="text-xs">{dayNum}</span>

                    {/* Mood emoji if set */}
                    {mood && (
                      <span className="absolute top-1 right-1 text-[10px]" title={`Mood: ${mood}`}>
                        {mood}
                      </span>
                    )}

                    {/* Bottom Indicator dots */}
                    <div className="flex gap-0.5 mt-1 shrink-0">
                      {hasTasks && <span className="w-1 h-1 rounded-full bg-emerald-500" title="Tasks" />}
                      {hasStudy && <span className="w-1 h-1 rounded-full bg-blue-500" title="Study Log" />}
                      {hasLeetCode && <span className="w-1 h-1 rounded-full bg-yellow-500" title="LeetCode solve" />}
                      {hasNotes && <span className="w-1 h-1 rounded-full bg-purple-500" title="Note" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Daily Log Detail Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-2xl space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Logbook: {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-[11px] text-zinc-500">Record values, track mood, and overview schedule</p>
            </div>

            {/* Mood Tracker */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                <Smile size={12} />
                <span>Daily Mood Indicator</span>
              </label>
              
              <div className="flex gap-1.5 flex-wrap">
                {MOODS.map(m => (
                  <button
                    key={m.label}
                    onClick={() => handleMoodSelect(m.emoji)}
                    className={`p-2 rounded-xl text-sm border hover:scale-110 active:scale-95 duration-100 transition-all ${
                      selectedMood === m.emoji
                        ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'border')}`
                        : 'bg-zinc-950/40 border-zinc-800 dark:bg-zinc-950/40 dark:border-zinc-800 light:bg-zinc-50 light:border-zinc-200'
                    }`}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick study logger */}
            <form onSubmit={handleStudySubmit} className="space-y-2 pt-3 border-zinc-100 dark:border-zinc-800/60">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                <Clock size={12} />
                <span>Log Study Hours</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  required
                  placeholder="Hours"
                  value={newStudyHours}
                  onChange={(e) => setNewStudyHours(parseFloat(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg border focus:outline-none focus:border-zinc-700 bg-white border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
                />
                
                <input
                  type="text"
                  required
                  placeholder="Subject (e.g. DBMS, LeetCode)"
                  value={newStudySubject}
                  onChange={(e) => setNewStudySubject(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border focus:outline-none focus:border-zinc-700 bg-white border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
                />
                
                <button
                  type="submit"
                  className={`px-3.5 py-1.5 rounded-lg ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:scale-105 active:scale-95 transition-all text-xs flex items-center justify-center`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </form>

            {/* Day activity summary list */}
            <div className="space-y-3.5 pt-3 max-h-[220px] overflow-y-auto pr-1 border-zinc-100 dark:border-zinc-800/60">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Activity Summary</label>
              
              {/* Tasks List */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] text-zinc-400 flex items-center gap-1 font-semibold">
                  <CheckSquare size={11} />
                  <span>Tasks ({selectedTasks.length})</span>
                </h4>
                {selectedTasks.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic pl-4">No tasks due.</p>
                ) : (
                  selectedTasks.map(t => (
                    <div key={t.id} className="text-[11px] pl-4 flex items-center justify-between text-zinc-700 dark:text-slate-350">
                      <span className={t.completed ? 'line-through text-zinc-500' : ''}>• {t.text}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">{t.completed ? 'Done' : 'Pending'}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Study Hours List */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] text-zinc-400 flex items-center gap-1 font-semibold">
                  <Clock size={11} />
                  <span>Study Log</span>
                </h4>
                {selectedStudy.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic pl-4">No hours logged.</p>
                ) : (
                  selectedStudy.map(log => (
                    <div key={log.id} className="text-[11px] pl-4 flex items-center justify-between text-zinc-700 dark:text-slate-350">
                      <span>• {log.subject}</span>
                      <span className="font-mono font-semibold">{log.hours}h</span>
                    </div>
                  ))
                )}
              </div>

              {/* LeetCode count */}
              {selectedLeetCodeSolved > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] text-zinc-400 flex items-center gap-1 font-semibold">
                    <Code2 size={11} />
                    <span>LeetCode</span>
                  </h4>
                  <p className="text-[11px] pl-4 text-zinc-700 dark:text-slate-350 flex justify-between">
                    <span>• Problems Solved:</span>
                    <span className="font-mono font-bold text-yellow-500">+{selectedLeetCodeSolved}</span>
                  </p>
                </div>
              )}

              {/* Quick Notes List */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] text-zinc-400 flex items-center gap-1 font-semibold">
                  <FileText size={11} />
                  <span>Quick Notes ({selectedNotes.length})</span>
                </h4>
                {selectedNotes.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic pl-4">No notes created.</p>
                ) : (
                  selectedNotes.map(n => (
                    <div key={n.id} className="text-[11px] pl-4 flex items-center text-zinc-700 dark:text-slate-350 truncate">
                      • {n.title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
