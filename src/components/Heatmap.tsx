import React, { useState } from 'react';
import { useDashboard, type DayStats } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { ChevronLeft, ChevronRight, CheckSquare, Flame, Award, Calendar } from 'lucide-react';

export const Heatmap: React.FC = () => {
  const { getDayStats, settings, tasks, leetCodeStats } = useDashboard();
  const accent = settings.accentColor as AccentColor;

  const [yearOffset, setYearOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [metric, setMetric] = useState<'overall' | 'tasks' | 'study' | 'leetcode'>('overall');

  // simulated TODAY date
  const SIMULATED_TODAY = '2026-07-01';

  // Generate grid dates based on yearOffset
  // 53 weeks * 7 = 371 days
  const numWeeks = 53;
  const totalDays = numWeeks * 7;
  
  // Anchor heatmap to July 6th, 2027 so the calendar starts exactly on July 1st, 2026
  const referenceDate = new Date('2027-07-06');
  referenceDate.setDate(referenceDate.getDate() - (yearOffset * 364));

  const startDate = new Date(referenceDate);
  startDate.setDate(referenceDate.getDate() - totalDays + 1);
  
  // Align start date to previous Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const dates: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayVal = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${dayVal}`);
  }

  interface MonthData {
    name: string;
    year: number;
    dates: string[];
    startPadding: number;
    endPadding: number;
  }

  const getMonthsData = (): MonthData[] => {
    const monthsList: MonthData[] = [];
    
    // We want July 2026 to July 2027 shifted back by yearOffset
    const startY = 2026 - yearOffset;
    const startM = 6; // July
    const endY = 2027 - yearOffset;
    const endM = 6; // July
    
    let currentY = startY;
    let currentM = startM;
    
    while (true) {
      const monthDates: string[] = [];
      const daysInMonth = new Date(currentY, currentM + 1, 0).getDate();
      
      for (let d = 1; d <= daysInMonth; d++) {
        const monthStr = String(currentM + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const dateStr = `${currentY}-${monthStr}-${dayStr}`;
        
        const dateObj = new Date(dateStr);
        if (dateObj >= new Date(`${startY}-07-01`) && dateObj <= new Date(`${endY}-07-06`)) {
          monthDates.push(dateStr);
        }
      }
      
      if (monthDates.length > 0) {
        const firstDate = new Date(monthDates[0]);
        const startPadding = firstDate.getDay();
        
        const lastDate = new Date(monthDates[monthDates.length - 1]);
        const endPadding = 6 - lastDate.getDay();
        
        const monthName = firstDate.toLocaleString('en-US', { month: 'short' });
        monthsList.push({
          name: monthName,
          year: currentY,
          dates: monthDates,
          startPadding,
          endPadding
        });
      }
      
      if (currentY === endY && currentM === endM) break;
      
      currentM++;
      if (currentM > 11) {
        currentM = 0;
        currentY++;
      }
    }
    
    return monthsList;
  };

  const monthsData = getMonthsData();

  // Calculate cell color based on active metric
  const getCustomColorClass = (percent: number, color: AccentColor) => {
    if (percent === 0) {
      return 'bg-zinc-100 border border-zinc-200/50 dark:bg-zinc-900/60 dark:border-zinc-800/40';
    }
    
    // Map of colors (highly distinct tint gradients)
    const colors = {
      green: [
        'bg-[#f0fdf4] border-[#bbf7d0] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30',
        'bg-[#bbf7d0] border-[#86efac] dark:bg-emerald-800/40 dark:border-emerald-700/30',
        'bg-[#86efac] border-[#4ade80] dark:bg-emerald-600',
        'bg-[#4ade80] border-[#22c55e] text-white shadow-sm shadow-emerald-500/10 dark:bg-emerald-450 dark:text-zinc-950'
      ],
      blue: [
        'bg-[#f0f9ff] border-[#bae6fd] dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/30',
        'bg-[#bae6fd] border-[#7dd3fc] dark:bg-sky-800/40 dark:border-sky-700/30',
        'bg-[#7dd3fc] border-[#38bdf8] dark:bg-sky-600',
        'bg-[#38bdf8] border-[#0ea5e9] text-white shadow-sm shadow-sky-500/10 dark:bg-sky-450 dark:text-zinc-950'
      ],
      purple: [
        'bg-[#f5f3ff] border-[#ddd6fe] dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/30',
        'bg-[#ddd6fe] border-[#c4b5fd] dark:bg-violet-850/40 dark:border-violet-750/30',
        'bg-[#c4b5fd] border-[#a78bfa] dark:bg-violet-600',
        'bg-[#a78bfa] border-[#8b5cf6] text-white shadow-sm shadow-violet-500/10 dark:bg-violet-450 dark:text-zinc-950'
      ],
      rose: [
        'bg-[#fff1f2] border-[#fecdd3] dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30',
        'bg-[#fecdd3] border-[#fda4af] dark:bg-rose-800/40 dark:border-rose-700/30',
        'bg-[#fda4af] border-[#fb7185] dark:bg-rose-600',
        'bg-[#fb7185] border-[#f43f5e] text-white shadow-sm shadow-rose-500/10 dark:bg-rose-450 dark:text-zinc-950'
      ],
      amber: [
        'bg-[#fffbeb] border-[#fde68a] dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30',
        'bg-[#fde68a] border-[#fcd34d] dark:bg-amber-800/40 dark:border-amber-700/30',
        'bg-[#fcd34d] border-[#fbbf24] dark:bg-amber-500',
        'bg-[#fbbf24] border-[#d97706] text-white shadow-sm shadow-amber-500/10 dark:bg-amber-450 dark:text-zinc-950'
      ]
    };

    const palette = colors[color] || colors.purple;
    
    if (percent > 0 && percent <= 25) return palette[0];
    if (percent > 25 && percent <= 50) return palette[1];
    if (percent > 50 && percent <= 75) return palette[2];
    return palette[3];
  };

  // Convert stats to percentage based on metric
  const getCellMetricPercentage = (stats: DayStats) => {
    switch (metric) {
      case 'tasks':
        return stats.tasksTotal === 0 ? 0 : Math.round((stats.tasksCompleted / stats.tasksTotal) * 100);
      case 'study':
        return stats.studyHours === 0 ? 0 : Math.round(Math.min(100, (stats.studyHours / 4) * 100));
      case 'leetcode':
        return stats.leetCodeSolved === 0 ? 0 : Math.round(Math.min(100, (stats.leetCodeSolved / 3) * 100));
      case 'overall':
      default:
        return stats.completionPercentage;
    }
  };



  // Date range label
  const dateRangeLabel = () => {
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);
    return `${firstDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  // Dynamic Inspector Date resolution
  const inspectorDate = hoveredDate || selectedDate || SIMULATED_TODAY;
  const inspectorStats = getDayStats(inspectorDate);
  const inspectorTasks = tasks.filter(t => t.dueDate === inspectorDate);
  const inspectorLeetCodeCount = leetCodeStats.history[inspectorDate] || 0;

  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate active statistics
  let activeDaysCount = 0;
  let totalTasksCompleted = 0;
  let totalHoursStudied = 0;
  let totalLeetCodeSolves = 0;

  dates.forEach(dateStr => {
    const stats = getDayStats(dateStr);
    const hasActivity = stats.tasksCompleted > 0 || stats.studyHours > 0 || stats.leetCodeSolved > 0;
    if (hasActivity) activeDaysCount++;
    totalTasksCompleted += stats.tasksCompleted;
    totalHoursStudied += stats.studyHours;
    totalLeetCodeSolves += stats.leetCodeSolved;
  });

  const consistencyRate = Math.round((activeDaysCount / dates.length) * 100);

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side: Heatmap Grid (3 columns) */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
          
          {/* Header toolbar */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Consistency Heatmap
              </h3>
              <p className="text-xs text-zinc-500">{dateRangeLabel()}</p>
            </div>

            {/* Metrics Selector */}
            <div className="flex flex-wrap items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/60 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-[11px] font-medium self-stretch sm:self-auto justify-start">
              <button
                onClick={() => setMetric('overall')}
                className={`px-3 py-1 rounded-lg transition-all ${metric === 'overall' ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                Overall
              </button>
              <button
                onClick={() => setMetric('tasks')}
                className={`px-3 py-1 rounded-lg transition-all ${metric === 'tasks' ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                Tasks
              </button>
              <button
                onClick={() => setMetric('study')}
                className={`px-3 py-1 rounded-lg transition-all ${metric === 'study' ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                Study
              </button>
              <button
                onClick={() => setMetric('leetcode')}
                className={`px-3 py-1 rounded-lg transition-all ${metric === 'leetcode' ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                LeetCode
              </button>
            </div>
            
            {/* Year traversal navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setYearOffset(prev => prev + 1)}
                className="p-1.5 rounded-lg border text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800"
                title="Previous Year"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setYearOffset(0)}
                disabled={yearOffset === 0}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border text-zinc-550 hover:text-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800"
              >
                Current
              </button>
              <button
                onClick={() => setYearOffset(prev => Math.max(0, prev - 1))}
                disabled={yearOffset === 0}
                className="p-1.5 rounded-lg border text-zinc-555 hover:text-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800"
                title="Next Year"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-zinc-200/50 dark:border-zinc-850/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
                <Calendar size={16} />
              </div>
              <div>
                <div className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Active Days</div>
                <div className="text-sm font-bold text-zinc-850 dark:text-zinc-200">{activeDaysCount} / {dates.length} days</div>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-200/80 dark:border-zinc-850/80 pt-3 sm:pt-0 sm:pl-4">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Award size={16} />
              </div>
              <div>
                <div className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Consistency Rate</div>
                <div className="text-sm font-bold text-zinc-850 dark:text-zinc-200">{consistencyRate}%</div>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-200/80 dark:border-zinc-850/80 pt-3 sm:pt-0 sm:pl-4">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Flame size={16} fill="currentColor" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-555 uppercase tracking-wider font-bold">Streak Record</div>
                <div className="text-sm font-bold text-zinc-850 dark:text-zinc-200">{leetCodeStats.longestStreak} days</div>
              </div>
            </div>
          </div>

          {/* Grid View grouped month-by-month (like LeetCode) */}
          <div className="overflow-x-auto select-none py-1">
            <div className="flex gap-4 items-start select-none min-w-[720px]">
              
              {/* Days labels column (Sun, Tue, Thu, Sat) */}
              <div className="flex flex-col justify-between text-[9px] text-zinc-500 h-[92px] py-1.5 w-5 font-mono select-none leading-none mt-5 shrink-0">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* Month Blocks Container */}
              <div className="flex gap-4 flex-1">
                {monthsData.map((month, mIdx) => {
                  const totalCells = month.startPadding + month.dates.length + month.endPadding;
                  const numCols = totalCells / 7;
                  
                  return (
                    <div key={mIdx} className="flex flex-col flex-1 min-w-[28px]">
                      {/* Month Label */}
                      <span className="text-[10px] text-zinc-550 font-bold mb-1 pl-0.5 select-none">
                        {month.name}
                      </span>
                      
                      {/* Month Grid Column-Flow */}
                      <div 
                        className="grid grid-flow-col grid-rows-7 gap-[3px] h-[92px]"
                        style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
                      >
                        {/* Start Padding (Empty cells before the 1st of month) */}
                        {Array.from({ length: month.startPadding }).map((_, pIdx) => (
                          <div key={`start-${pIdx}`} className="bg-transparent opacity-0 pointer-events-none" />
                        ))}
                        
                        {/* Active Date Cells */}
                        {month.dates.map((dateStr) => {
                          const stats = getDayStats(dateStr);
                          const cellPercent = getCellMetricPercentage(stats);
                          const colorClass = getCustomColorClass(cellPercent, accent);
                          const isToday = dateStr === new Date().toISOString().split('T')[0];

                          return (
                            <button
                              key={dateStr}
                              onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                              onMouseEnter={() => setHoveredDate(dateStr)}
                              onMouseLeave={() => setHoveredDate(null)}
                              className={`heatmap-cell rounded-[3px] transition-all duration-200 cursor-pointer ${colorClass} ${
                                isToday ? 'ring-2 ring-offset-1 ring-zinc-400 dark:ring-zinc-555 dark:ring-offset-zinc-950' : ''
                              } ${
                                selectedDate === dateStr ? 'ring-2 ring-zinc-800 dark:ring-white scale-110 z-10' : ''
                              }`}
                              title={`${formatDateString(dateStr)}: ${cellPercent}% activity`}
                              aria-label={`Date: ${dateStr}, Completion: ${cellPercent}%`}
                            />
                          );
                        })}
                        
                        {/* End Padding (Empty cells after the last of month) */}
                        {Array.from({ length: month.endPadding }).map((_, pIdx) => (
                          <div key={`end-${pIdx}`} className="bg-transparent opacity-0 pointer-events-none" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Map Legend */}
          <div className="flex justify-end items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-[2.5px] border border-zinc-200/50 bg-zinc-100 dark:bg-zinc-900/60 dark:border-zinc-800/40" />
            <div className={`w-2.5 h-2.5 rounded-[2.5px] ${getCustomColorClass(20, accent)}`} />
            <div className={`w-2.5 h-2.5 rounded-[2.5px] ${getCustomColorClass(45, accent)}`} />
            <div className={`w-2.5 h-2.5 rounded-[2.5px] ${getCustomColorClass(70, accent)}`} />
            <div className={`w-2.5 h-2.5 rounded-[2.5px] ${getCustomColorClass(90, accent)}`} />
            <span>More</span>
          </div>

        </div>

        {/* Right Side: Day Details Inspector (1 column) */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-zinc-200/60 dark:border-zinc-800 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Inspector Header */}
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block mb-0.5">
                {hoveredDate ? 'Hover Details' : selectedDate ? 'Pinned Details' : 'Today'}
              </span>
              <h4 className={`text-xs font-bold font-sans ${getAccentColor(accent, 'text')}`}>
                {formatDateString(inspectorDate)}
              </h4>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/40 dark:border-zinc-850">
                <div className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5">Tasks</div>
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{inspectorStats.tasksCompleted}/{inspectorStats.tasksTotal}</div>
              </div>
              <div className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/40 dark:border-zinc-850">
                <div className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 font-sans">LeetCode</div>
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">+{inspectorLeetCodeCount}</div>
              </div>
              <div className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/40 dark:border-zinc-850">
                <div className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5">Study</div>
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{inspectorStats.studyHours}h</div>
              </div>
            </div>

            {/* Tasks Completed checklist */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <h5 className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1.5 mb-1.5">
                <CheckSquare size={10} />
                <span>Today's Tasks ({inspectorTasks.length})</span>
              </h5>
              
              {inspectorTasks.length === 0 ? (
                <div className="text-[10px] text-zinc-400 italic py-4 text-center border border-dashed border-zinc-200 rounded-xl dark:border-zinc-800 flex-1 flex items-center justify-center">
                  No tasks recorded for this day.
                </div>
              ) : (
                <div className="max-h-[120px] overflow-y-auto space-y-1 pr-0.5">
                  {inspectorTasks.map(t => (
                    <div key={t.id} className="flex items-start gap-1.5 text-[10px] leading-tight truncate">
                      <span className={`text-[10px] font-bold shrink-0 ${t.completed ? 'text-emerald-500' : 'text-zinc-350'}`}>
                        {t.completed ? '✓' : '○'}
                      </span>
                      <span className={`truncate ${t.completed ? 'line-through text-zinc-400 font-normal' : 'text-zinc-750 dark:text-zinc-200 font-medium'}`}>
                        {t.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Prompt info */}
          <p className="text-[9px] text-zinc-400 dark:text-zinc-550 italic leading-none border-t border-zinc-200/50 dark:border-zinc-850/80 pt-2.5 mt-2 select-none">
            {selectedDate ? 'Click again to unpin selection.' : 'Hover over cells for quick inspection.'}
          </p>
        </div>

      </div>
    </div>
  );
};
