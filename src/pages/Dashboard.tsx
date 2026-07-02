import React, { useState, useEffect } from 'react';
import { useDashboard, type Task, type Goal, getLocalDateString } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Heatmap } from '../components/Heatmap';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Target, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Award, 
  Search,
  Check,
  Flame,
  ListTodo,
  Clock
} from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Clean code always looks like it was written by someone who cares.", author: "Michael Feathers" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" }
];

export const Dashboard: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    reorderTasks,
    dailyGoals, 
    updateDailyGoalProgress,
    addDailyGoal,
    weeklyGoals, 
    settings,
    leetCodeStats
  } = useDashboard();

  const accent = settings.accentColor as AccentColor;

  // Local state
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [taskQuery, setTaskQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [taskDayTab, setTaskDayTab] = useState<'today' | 'yesterday'>('today');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  // New task inputs
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('Study');
  const [newTaskTime, setNewTaskTime] = useState('12:00');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // New goal inputs
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(5);
  const [newGoalPriority, setNewGoalPriority] = useState<Goal['priority']>('medium');

  // Load a quote on mount
  useEffect(() => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  const handleToggle = (id: string) => {
    const achievedAll = toggleTask(id);
    if (achievedAll) {
      // Complete daily tasks celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#6ee7b7']
      });
      showToast("🎉 Awesome! You completed all today's tasks! Confetti triggered!", 'success');
    }
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const targetDayStr = taskDayTab === 'today' ? todayStr : getLocalDateString(new Date(Date.now() - 86400000));
    addTask(newTaskText, newTaskPriority, newTaskCategory, targetDayStr, newTaskTime, newTaskNotes);
    
    // Reset fields
    setNewTaskText('');
    setNewTaskPriority('medium');
    setNewTaskCategory('Study');
    setNewTaskNotes('');
    setIsAddTaskOpen(false);
    showToast('Task added successfully!', 'success');
  };

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    addDailyGoal(newGoalTitle, newGoalTarget, newGoalPriority);
    
    // Reset
    setNewGoalTitle('');
    setNewGoalTarget(5);
    setNewGoalPriority('medium');
    setIsAddGoalOpen(false);
    showToast('Daily goal added!', 'success');
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    reorderTasks(draggedIndex, index);
    setDraggedIndex(null);
  };

  // Filtered Tasks (Today or Yesterday depending on tab)
  const todayStr = getLocalDateString();
  const yesterdayStr = getLocalDateString(new Date(Date.now() - 86405000));
  
  const targetDayStr = taskDayTab === 'today' ? todayStr : yesterdayStr;
  const activeDayTasks = tasks.filter(t => t.dueDate === targetDayStr);

  const filteredTasks = activeDayTasks.filter(task => {
    const matchesQuery = task.text.toLowerCase().includes(taskQuery.toLowerCase()) || 
                         task.category.toLowerCase().includes(taskQuery.toLowerCase());
    
    if (taskFilter === 'pending') return matchesQuery && !task.completed;
    if (taskFilter === 'completed') return matchesQuery && task.completed;
    return matchesQuery;
  });

  // Calculate Overall Progress
  const totalTasks = activeDayTasks.length;
  const completedTasks = activeDayTasks.filter(t => t.completed).length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalDaily = dailyGoals.length;
  const completedDaily = dailyGoals.filter(g => g.current >= g.target).length;
  const dailyProgress = totalDaily > 0 ? (completedDaily / totalDaily) * 100 : 0;

  const totalWeekly = weeklyGoals.length;
  const completedWeekly = weeklyGoals.filter(g => g.current >= g.target).length;
  const weeklyProgress = totalWeekly > 0 ? (completedWeekly / totalWeekly) * 100 : 0;

  const overallProgress = (
    (activeDayTasks.length > 0 ? taskProgress : 0) +
    (dailyGoals.length > 0 ? dailyProgress : 0) +
    (weeklyGoals.length > 0 ? weeklyProgress : 0)
  ) / (
    (activeDayTasks.length > 0 ? 1 : 0) +
    (dailyGoals.length > 0 ? 1 : 0) +
    (weeklyGoals.length > 0 ? 1 : 0) || 1
  );

  return (
    <div className="space-y-6">
      {/* 1. Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl border backdrop-blur-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
        {/* Shimmer glow effect */}
        <div className={`absolute -right-20 -top-20 w-60 h-60 rounded-full blur-3xl opacity-10 ${getAccentColor(accent, 'bg')}`} />
        
        <div className="space-y-2 max-w-xl z-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            Good Morning, Gopika 👋
          </h2>
          <p className="italic text-zinc-600 dark:text-zinc-400">
            "{quote.text}" — <span className="font-semibold">{quote.author}</span>
          </p>
        </div>

        {/* Streaks Widget */}
        <div className="flex gap-4 z-10">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-zinc-50 border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-800">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
              <Flame size={16} fill="currentColor" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Current Streak</div>
              <div className="text-base font-bold text-zinc-700 dark:text-zinc-200">{leetCodeStats.currentStreak} days</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-zinc-50 border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-800">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Award size={16} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Longest Streak</div>
              <div className="text-base font-bold text-zinc-700 dark:text-zinc-200">{leetCodeStats.longestStreak} days</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Progress Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall card */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Overall Completion</span>
            <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">{Math.round(overallProgress)}%</h3>
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <TrendingUp size={12} className={getAccentColor(accent, 'text')} />
              <span>Great consistency today!</span>
            </p>
          </div>
          <ProgressRing percentage={overallProgress} colorClass={getAccentColor(accent, 'bg').replace('bg-', 'text-')} />
        </div>

        {/* Tasks card */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Tasks Done</span>
            <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">{completedTasks} / {totalTasks}</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Today's checklist</p>
          </div>
          <ProgressRing percentage={taskProgress} colorClass="text-indigo-400" />
        </div>

        {/* Daily Goals card */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Daily Goals</span>
            <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">{completedDaily} / {totalDaily}</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Goal milestones</p>
          </div>
          <ProgressRing percentage={dailyProgress} colorClass="text-amber-500" />
        </div>

        {/* Weekly Goals card */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Weekly Goals</span>
            <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">{completedWeekly} / {totalWeekly}</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Resets on Monday</p>
          </div>
          <ProgressRing percentage={weeklyProgress} colorClass="text-rose-450 text-rose-500" />
        </div>
      </div>

      {/* 3. Heatmap Widget */}
      <Heatmap />

      {/* 4. Split Layout for Today's Tasks & Daily Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's Tasks List (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-2xl space-y-4 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <CheckSquare size={16} className={getAccentColor(accent, 'text')} />
                <span>{taskDayTab === 'today' ? "Today's Tasks" : "Yesterday's Tasks"}</span>
              </h3>
              
              {/* Day Selector Tabs */}
              <div className="flex items-center gap-0.5 bg-zinc-100/80 dark:bg-zinc-950/40 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-850/80 text-[10px] font-bold select-none shrink-0">
                <button
                  type="button"
                  onClick={() => setTaskDayTab('today')}
                  className={`px-2 py-0.5 rounded-md transition-all ${taskDayTab === 'today' ? 'bg-white dark:bg-zinc-800 text-zinc-850 dark:text-zinc-100 shadow-sm' : 'text-zinc-400 dark:text-zinc-550'}`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setTaskDayTab('yesterday')}
                  className={`px-2 py-0.5 rounded-md transition-all ${taskDayTab === 'yesterday' ? 'bg-white dark:bg-zinc-800 text-zinc-850 dark:text-zinc-100 shadow-sm' : 'text-zinc-400 dark:text-zinc-555'}`}
                >
                  Yesterday
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Task search input */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Find task..."
                  value={taskQuery}
                  onChange={(e) => setTaskQuery(e.target.value)}
                  className="pl-8 pr-2.5 py-1 rounded-xl border placeholder-zinc-500 focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:focus:border-zinc-700"
                />
              </div>
              
              <button
                onClick={() => setIsAddTaskOpen(true)}
                className={`p-1.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:scale-105 transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center`}
                title="Add Task"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex pb-2 gap-4 text-xs font-medium border-zinc-200 dark:border-zinc-800/80">
            <button 
              onClick={() => setTaskFilter('all')}
              className={`pb-1.5 transition-colors relative ${taskFilter === 'all' ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-50'}`}
            >
              All ({activeDayTasks.length})
              {taskFilter === 'all' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${getAccentColor(accent, 'bg')}`} />
              )}
            </button>
            <button 
              onClick={() => setTaskFilter('pending')}
              className={`pb-1.5 transition-colors relative ${taskFilter === 'pending' ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-50'}`}
            >
              Pending ({activeDayTasks.filter(t => !t.completed).length})
              {taskFilter === 'pending' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${getAccentColor(accent, 'bg')}`} />
              )}
            </button>
            <button 
              onClick={() => setTaskFilter('completed')}
              className={`pb-1.5 transition-colors relative ${taskFilter === 'completed' ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-50'}`}
            >
              Completed ({activeDayTasks.filter(t => t.completed).length})
              {taskFilter === 'completed' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${getAccentColor(accent, 'bg')}`} />
              )}
            </button>
          </div>

          {/* Tasks Grid / Drag-Drop List */}
          {filteredTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-2xl border text-zinc-500 mb-3 bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <ListTodo size={28} />
              </div>
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {taskDayTab === 'today' ? "No tasks for today" : "No tasks for yesterday"}
              </h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                {taskQuery ? "No results match your search." : `Create a task for ${taskDayTab === 'today' ? 'today' : 'yesterday'} using the plus icon.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 max-h-[300px] overflow-y-auto pr-1 select-none">
              {filteredTasks.map((task, index) => {
                const priorityColor = 
                  task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                  task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                  'bg-blue-500/10 text-blue-500 border-blue-500/20';

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing hover:translate-x-1 duration-150 ${
                    task.completed 
                      ? 'bg-zinc-50 border-zinc-200/50 text-zinc-400 line-through dark:bg-zinc-900/20 dark:border-zinc-800/40' 
                      : 'bg-white border-zinc-200 text-zinc-750 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200'
                  }`}
                  >
                    {/* Reorder grip indicator */}
                    <div className="flex flex-col gap-0.5 text-zinc-600 dark:text-slate-650 cursor-grab">
                      <span className="w-2.5 h-0.5 bg-current rounded-full" />
                      <span className="w-2.5 h-0.5 bg-current rounded-full" />
                      <span className="w-2.5 h-0.5 bg-current rounded-full" />
                    </div>

                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(task.id)}
                      className={`custom-checkbox ${
                        task.completed 
                          ? `${getAccentColor(accent, 'bg')} border-transparent text-zinc-950` 
                          : 'hover:border-zinc-500 text-transparent'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>

                    {/* Task Title */}
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-medium truncate">{task.text}</p>
                      {task.notes && (
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-normal">
                          {task.notes}
                        </p>
                      )}
                    </div>

                    {/* Details badges */}
                    <div className="flex items-center gap-2">
                      {task.dueTime && (
                        <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                          <Clock size={9} />
                          {task.dueTime}
                        </span>
                      )}

                      <span className="text-[9px] px-2 py-0.5 rounded-full border text-zinc-400 uppercase tracking-wider leading-none bg-zinc-100 border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800">
                        {task.category}
                      </span>

                      <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold leading-none ${priorityColor}`}>
                        {task.priority}
                      </span>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-zinc-500 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-zinc-950/40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Goals List (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Target size={16} className="text-amber-500" />
              <span>Daily Goals</span>
            </h3>
            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="p-1 text-zinc-400 hover:text-zinc-200 border border-transparent hover:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:hover:border-zinc-800"
              title="Add Custom Daily Goal"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {dailyGoals.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl">
                Suggest creating a daily goal to kickstart productivity.
              </div>
            ) : (
              dailyGoals.map(goal => {
                const completionRate = Math.round((goal.current / goal.target) * 100);
                const isGoalAchieved = goal.current >= goal.target;

                return (
                  <div key={goal.id} className="space-y-1.5 p-3 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold truncate pr-2 ${
                        isGoalAchieved ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'
                      }`}>
                        {goal.title}
                      </span>
                      <span className="font-mono text-zinc-500 shrink-0">
                        {goal.current} / {goal.target} ({completionRate}%)
                      </span>
                    </div>

                    {/* Progress Bar & buttons */}
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            isGoalAchieved ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, completionRate)}%` }}
                        />
                      </div>
                      
                      {/* Increment/Decrement controls */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateDailyGoalProgress(goal.id, goal.current - 1)}
                          disabled={goal.current <= 0}
                          className="w-5 h-5 flex items-center justify-center rounded border text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-35 disabled:pointer-events-none bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateDailyGoalProgress(goal.id, goal.current + 1)}
                          disabled={isGoalAchieved}
                          className="w-5 h-5 flex items-center justify-center rounded border text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-35 disabled:pointer-events-none bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Modals for Adding Tasks & Goals */}
      
      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleAddTaskSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Solve LeetCode Daily"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Category</label>
              <input
                type="text"
                placeholder="e.g. Study, Health"
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Time</label>
              <input
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Date</label>
              <div className="w-full px-3 py-2 rounded-xl border text-zinc-400 text-sm select-none bg-zinc-100 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/50">
                Today
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Notes (Optional)</label>
            <textarea
              placeholder="Provide a small description or context..."
              value={newTaskNotes}
              onChange={(e) => setNewTaskNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 resize-none bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all text-xs`}
          >
            Create Task
          </button>
        </form>
      </Modal>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        title="Create Daily Goal"
      >
        <form onSubmit={handleAddGoalSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Goal Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Study 3 hours, Drink 3L water"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Amount</label>
              <input
                type="number"
                min={1}
                required
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Priority</label>
              <select
                value={newGoalPriority}
                onChange={(e) => setNewGoalPriority(e.target.value as Goal['priority'])}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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
