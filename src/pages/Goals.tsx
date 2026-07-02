import React, { useState } from 'react';
import { useDashboard, type Goal } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import { 
  Target, 
  Plus, 
  Trash2, 
  TrendingUp,
  Clock,
  CalendarDays,
  CalendarRange,
  Compass
} from 'lucide-react';

export const Goals: React.FC = () => {
  const { 
    dailyGoals, 
    addDailyGoal, 
    updateDailyGoalProgress, 
    deleteDailyGoal,
    weeklyGoals, 
    addWeeklyGoal, 
    updateWeeklyGoalProgress, 
    deleteWeeklyGoal,
    customGoals,
    addCustomGoal,
    updateCustomGoalProgress,
    deleteCustomGoal,
    settings 
  } = useDashboard();

  const accent = settings.accentColor as AccentColor;

  // Local state
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form inputs
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);
  const [goalCategory, setGoalCategory] = useState<Goal['category']>('daily');
  const [goalPriority, setGoalPriority] = useState<Goal['priority']>('medium');
  const [goalDeadline, setGoalDeadline] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    if (goalCategory === 'daily') {
      addDailyGoal(goalTitle, goalTarget, goalPriority);
    } else if (goalCategory === 'weekly') {
      addWeeklyGoal(goalTitle, goalTarget, goalPriority, goalDeadline || undefined);
    } else {
      addCustomGoal(goalTitle, goalTarget, goalCategory, goalPriority, goalDeadline || undefined);
    }

    // Reset
    setGoalTitle('');
    setGoalTarget(10);
    setGoalCategory('daily');
    setGoalPriority('medium');
    setGoalDeadline('');
    setIsAddOpen(false);
    showToast('Goal created successfully!', 'success');
  };

  // Delete wrapper
  const handleDelete = (id: string, category: Goal['category']) => {
    if (category === 'daily') deleteDailyGoal(id);
    else if (category === 'weekly') deleteWeeklyGoal(id);
    else deleteCustomGoal(id);
    showToast('Goal removed.', 'error');
  };

  // Progress update wrapper
  const handleProgressChange = (id: string, current: number, target: number, category: Goal['category'], amount: number) => {
    const nextVal = Math.max(0, Math.min(target, current + amount));
    if (category === 'daily') {
      updateDailyGoalProgress(id, nextVal);
    } else if (category === 'weekly') {
      updateWeeklyGoalProgress(id, nextVal);
    } else {
      updateCustomGoalProgress(id, nextVal);
    }
  };

  // Compile all goals in one list
  const allGoals: Goal[] = [
    ...dailyGoals.map(g => ({ ...g, category: 'daily' as const })),
    ...weeklyGoals.map(g => ({ ...g, category: 'weekly' as const })),
    ...customGoals
  ];

  const filteredGoals = allGoals.filter(g => {
    if (activeTab === 'all') return true;
    return g.category === activeTab;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/5 border-rose-500/20';
    if (priority === 'medium') return 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20';
    return 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/5 border-blue-500/20';
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'daily') return Clock;
    if (category === 'weekly') return CalendarDays;
    if (category === 'monthly') return CalendarRange;
    return Compass;
  };

  // Summarize stats
  const totalCount = filteredGoals.length;
  const completedCount = filteredGoals.filter(g => g.current >= g.target).length;
  const successPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Target size={20} className="text-amber-500" />
            <span>Goals & Milestones</span>
          </h2>
          <p className="text-xs text-zinc-500">Track and achieve your short-term and long-term milestones</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${getAccentColor(accent, 'bg')} text-zinc-950 hover:scale-105 active:scale-95 duration-150 transition-all shadow-md shadow-emerald-500/5`}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Tabs Menu & Stat Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Tabs Selector (1 col) */}
        <div className="glass-panel p-3 rounded-2xl flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible h-fit">
          {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap text-left flex items-center gap-2 ${
                activeTab === tab
                  ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'text')}`
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 light:text-zinc-600 light:hover:bg-zinc-100'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{tab} goals</span>
            </button>
          ))}
        </div>

        {/* Right: Goals Summary & Details List (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary Card */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Goal Achievement Rate</span>
              <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">
                {completedCount} / {totalCount} achieved
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                <TrendingUp size={12} className={getAccentColor(accent, 'text')} />
                <span>{successPercentage}% success rate on currently filtered goals</span>
              </p>
            </div>
            {/* Progress Bar inside summary */}
            <div className="w-full sm:w-48 h-3 rounded-full overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800">
              <div 
                className={`h-full ${getAccentColor(accent, 'bg')} transition-all duration-700 ease-out`}
                style={{ width: `${successPercentage}%` }}
              />
            </div>
          </div>

          {/* Goals Checklist Grid */}
          {filteredGoals.length === 0 ? (
            <div className="glass-panel py-16 text-center">
              <div className="p-4 rounded-2xl border text-zinc-500 mb-4 inline-block bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <Target size={32} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No goals found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No goals created in this category. Kickstart your productivity by creating a new goal!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredGoals.map(goal => {
                const completionRate = Math.round((goal.current / goal.target) * 100);
                const isAchieved = goal.current >= goal.target;
                const Icon = getCategoryIcon(goal.category);

                return (
                  <div 
                    key={goal.id}
                    className={`glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-zinc-700/60 transition-all ${
                      isAchieved ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/5' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </span>
                        
                        <span className="flex items-center gap-1 text-[9px] text-zinc-500 uppercase tracking-wider font-bold">
                          <Icon size={9} />
                          {goal.category}
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold leading-snug mt-2 truncate ${
                        isAchieved ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'
                      }`} title={goal.title}>
                        {goal.title}
                      </h4>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Progress</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">
                          {goal.current} / {goal.target} ({completionRate}%)
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            isAchieved ? 'bg-emerald-500' : getAccentColor(accent, 'bg')
                          }`}
                          style={{ width: `${Math.min(100, completionRate)}%` }}
                        />
                      </div>

                      {/* Deadline & controls */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-zinc-100 dark:border-zinc-800/80">
                        {/* Deadline */}
                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                          {goal.deadline ? (
                            <>
                              <Clock size={9} />
                              <span>Ends: {goal.deadline}</span>
                            </>
                          ) : (
                            <span>No deadline</span>
                          )}
                        </div>

                        {/* Adjust / Delete buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleProgressChange(goal.id, goal.current, goal.target, goal.category, -1)}
                            disabled={goal.current <= 0}
                            className="w-5 h-5 flex items-center justify-center rounded border text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30 bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleProgressChange(goal.id, goal.current, goal.target, goal.category, 1)}
                            disabled={isAchieved}
                            className="w-5 h-5 flex items-center justify-center rounded border text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30 bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            +
                          </button>
                          
                          <div className="w-[1px] h-4 mx-1 bg-zinc-200 dark:bg-zinc-800/80" />
                          
                          <button
                            onClick={() => handleDelete(goal.id, goal.category)}
                            className="text-zinc-500 hover:text-rose-500 p-0.5 rounded transition-colors"
                            title="Remove Goal"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Establish Goal Milestone"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Goal Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Complete Graph Algorithms topic"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Number</label>
              <input
                type="number"
                min={1}
                required
                value={goalTarget}
                onChange={(e) => setGoalTarget(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Category</label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value as Goal['category'])}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Priority</label>
              <select
                value={goalPriority}
                onChange={(e) => setGoalPriority(e.target.value as Goal['priority'])}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Deadline (Optional)</label>
              <input
                type="date"
                value={goalDeadline}
                disabled={goalCategory === 'daily'}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 disabled:opacity-30 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all text-xs`}
          >
            Create Goal
          </button>
        </form>
      </Modal>
    </div>
  );
};
