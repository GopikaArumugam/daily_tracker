import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { 
  ComposedChart,
  Area, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  Clock, 
  CheckSquare, 
  Zap, 
  Activity 
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { tasks, studyLogs, leetCodeStats, getDayStats, settings } = useDashboard();
  const accent = settings.accentColor as AccentColor;

  // 1. Compile 7-day data
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const stats = getDayStats(dateStr);
    
    weeklyData.push({
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: dateStr,
      tasks: stats.tasksCompleted,
      study: stats.studyHours,
      leetcode: stats.leetCodeSolved,
      goals: stats.dailyGoalsCompleted
    });
  }

  // 1.5. Compile LeetCode cumulative and daily trend data starting from July 1, 2026
  const leetCodeTrendData = [];
  const startTrendDate = new Date('2026-07-01');
  const todayTrendDate = new Date();
  
  // Calculate base solved count (Total Solved - sum of solves recorded on/after July 1st)
  let loggedSolvesSum = 0;
  Object.entries(leetCodeStats.history).forEach(([dateStr, count]) => {
    if (dateStr >= '2026-07-01') {
      loggedSolvesSum += count;
    }
  });
  
  let baseSolves = leetCodeStats.totalSolved - loggedSolvesSum;
  if (baseSolves < 0) baseSolves = 0;

  let tempDate = new Date(startTrendDate);
  let cumulativeSolves = baseSolves;

  // Fallback to today if user's local date is set before July 1st, 2026 to avoid infinite loop
  if (tempDate > todayTrendDate) {
    tempDate = new Date(todayTrendDate);
  }

  while (tempDate <= todayTrendDate) {
    const dateStr = tempDate.toISOString().split('T')[0];
    const dailyCount = leetCodeStats.history[dateStr] || 0;
    cumulativeSolves += dailyCount;

    leetCodeTrendData.push({
      name: tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: dateStr,
      dailySolved: dailyCount,
      totalSolved: cumulativeSolves
    });

    tempDate.setDate(tempDate.getDate() + 1);
  }

  // 2. Category distribution
  const categoryCounts: { [cat: string]: number } = {};
  tasks.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });
  
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value
  })).slice(0, 5); // limit to top 5

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  // 3. Productivity statistics calculations
  const totalTasksCompleted = tasks.filter(t => t.completed).length;
  const totalStudyHours = studyLogs.reduce((sum, log) => sum + log.hours, 0);
  

  // Find Best/Worst days
  let bestDay = { date: 'N/A', count: 0 };
  let worstDay = { date: 'N/A', count: 999 };
  
  weeklyData.forEach(day => {
    if (day.tasks > bestDay.count) {
      bestDay = { date: day.name, count: day.tasks };
    }
    if (day.tasks < worstDay.count) {
      worstDay = { date: day.name, count: day.tasks };
    }
  });

  if (worstDay.count === 999) worstDay.count = 0;

  // Custom Chart components for Dark/Light modes
  const chartGridColor = settings.theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const chartTextColor = settings.theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <BarChart3 size={20} className={getAccentColor(accent, 'text')} />
          <span>Productivity Analytics</span>
        </h2>
        <p className="text-xs text-zinc-500">Visualize study hours, LeetCode performance, and task progress charts</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Done */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckSquare size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Tasks Done</span>
            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-200">{totalTasksCompleted}</h3>
          </div>
        </div>

        {/* Total Study hours logged */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Study Time</span>
            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-200">{totalStudyHours}h</h3>
          </div>
        </div>

        {/* Best Productive Day */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-500">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Most Productive Day</span>
            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-200">
              {bestDay.date !== 'N/A' ? `${bestDay.date} (${bestDay.count} tasks)` : 'N/A'}
            </h3>
          </div>
        </div>

        {/* Average Daily solves */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
            <Zap size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Solving streak</span>
            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-200">{leetCodeStats.currentStreak} days</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Study hours vs Tasks Completed (Area + Bar) */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Study Hours & Task Completions</h3>
            <p className="text-[11px] text-zinc-500">Dual chart overlay showing task count against logged hours</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="name" stroke={chartTextColor} fontSize={10} />
                <YAxis stroke={chartTextColor} fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: settings.theme === 'dark' ? '#1e293b' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                <Area type="monotone" dataKey="study" name="Study Hours" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStudy)" strokeWidth={2} />
                <Bar dataKey="tasks" name="Tasks Done" fill={getAccentColor(accent, 'bg').replace('bg-', '#')} radius={[4, 4, 0, 0]} maxBarSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: LeetCode solves over time */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">LeetCode Solved Trend (Since July 1st)</h3>
            <p className="text-[11px] text-zinc-500">Daily solves and cumulative progress from July 1, 2026</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={leetCodeTrendData} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="name" stroke={chartTextColor} fontSize={10} />
                <YAxis yAxisId="left" stroke={chartTextColor} fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                <YAxis yAxisId="right" orientation="right" stroke={chartTextColor} fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: settings.theme === 'dark' ? '#1e293b' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                <Bar yAxisId="right" dataKey="dailySolved" name="Daily Solved" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={15} opacity={0.6} />
                <Line yAxisId="left" type="monotone" dataKey="totalSolved" name="Cumulative Total" stroke="#eab308" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Category distribution donut */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Task Categories Distribution</h3>
            <p className="text-[11px] text-zinc-500">Share of tasks across different workspace sections</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <span className="text-xs text-zinc-500 italic">No tasks created yet to distribute.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: settings.theme === 'dark' ? '#1e293b' : '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Daily Goals completion trend */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Daily Goal Completion Trend</h3>
            <p className="text-[11px] text-zinc-500">Number of daily goals completed successfully</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="name" stroke={chartTextColor} fontSize={10} />
                <YAxis stroke={chartTextColor} fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: settings.theme === 'dark' ? '#1e293b' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                <Line type="monotone" dataKey="goals" name="Goals Achieved" stroke="#ec4899" strokeWidth={2} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
