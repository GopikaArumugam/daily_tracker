import React, { useState } from 'react';
import { useDashboard, type Task } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Search,
  Check,
  Clock,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    updateTask,
    reorderTasks, 
    settings 
  } = useDashboard();

  const accent = settings.accentColor as AccentColor;

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form states
  const [taskText, setTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('medium');
  const [taskCategory, setTaskCategory] = useState('Study');
  const [taskDate, setTaskDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [taskTime, setTaskTime] = useState('12:00');
  const [taskNotes, setTaskNotes] = useState('');

  // Extract unique categories for filter dropdown
  const uniqueCategories = ['all', ...Array.from(new Set(tasks.map(t => t.category)))];

  const handleToggle = (id: string) => {
    const achievedAll = toggleTask(id);
    if (achievedAll) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#6ee7b7']
      });
      showToast("🎉 Perfect! You completed all today's tasks! Confetti triggered!", 'success');
    } else {
      showToast("Task status updated!", 'success');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    addTask(taskText, taskPriority, taskCategory, taskDate, taskTime, taskNotes);
    
    // Reset fields
    setTaskText('');
    setTaskPriority('medium');
    setTaskCategory('Study');
    setTaskDate(new Date().toISOString().split('T')[0]);
    setTaskTime('12:00');
    setTaskNotes('');
    setIsAddOpen(false);
    showToast('Task created successfully!', 'success');
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setTaskText(task.text);
    setTaskPriority(task.priority);
    setTaskCategory(task.category);
    setTaskDate(task.dueDate);
    setTaskTime(task.dueTime || '12:00');
    setTaskNotes(task.notes || '');
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !taskText.trim()) return;

    updateTask(selectedTask.id, {
      text: taskText,
      priority: taskPriority,
      category: taskCategory,
      dueDate: taskDate,
      dueTime: taskTime,
      notes: taskNotes
    });

    setIsEditOpen(false);
    setSelectedTask(null);
    showToast('Task updated!', 'success');
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    showToast('Task deleted.', 'error');
  };

  // Reordering inside the filtered list
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

  // Filtering logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'completed' ? t.completed :
      !t.completed;

    const matchesPriority = 
      priorityFilter === 'all' ? true :
      t.priority === priorityFilter;

    const matchesCategory = 
      categoryFilter === 'all' ? true :
      t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <CheckSquare size={20} className={getAccentColor(accent, 'text')} />
            <span>Tasks Workspace</span>
          </h2>
          <p className="text-xs text-zinc-500">Manage, organize, and prioritize your daily routines</p>
        </div>
        
        <button
          onClick={() => {
            // Ensure defaults for create
            setTaskDate(new Date().toISOString().split('T')[0]);
            setIsAddOpen(true);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${getAccentColor(accent, 'bg')} text-zinc-950 hover:scale-105 active:scale-95 duration-150 transition-all shadow-md shadow-emerald-500/5`}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border placeholder-zinc-500 focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:ml-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono hidden sm:inline">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono hidden sm:inline">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table / Kanban rows */}
      <div className="glass-panel p-6 rounded-2xl">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-2xl border text-zinc-500 mb-4 animate-bounce bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No tasks match selected filter</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Adjust your dashboard query filters or create a new task.
            </p>
          </div>
        ) : (
          <div className="space-y-2 select-none">
            {filteredTasks.map((task, index) => {
              const priorityClass = 
                task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                'bg-blue-500/10 text-blue-500 border-blue-500/20';

              const isOverdue = !task.completed && new Date(task.dueDate) < new Date(new Date().toDateString());

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing hover:translate-x-1 duration-150 ${
                    task.completed 
                      ? 'bg-zinc-50 border-zinc-200/50 text-zinc-400 line-through dark:bg-zinc-900/10 dark:border-zinc-800/40' 
                      : 'bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {/* Grip */}
                  <div className="hidden sm:flex flex-col gap-0.5 text-zinc-600 dark:text-slate-650 cursor-grab shrink-0">
                    <span className="w-3 h-0.5 bg-current rounded-full" />
                    <span className="w-3 h-0.5 bg-current rounded-full" />
                    <span className="w-3 h-0.5 bg-current rounded-full" />
                  </div>

                  {/* Complete status checkbox */}
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`custom-checkbox shrink-0 ${
                      task.completed 
                        ? `${getAccentColor(accent, 'bg')} border-transparent text-zinc-950` 
                        : 'hover:border-zinc-500 text-transparent'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold truncate text-zinc-700 dark:text-zinc-200">
                        {task.text}
                      </p>
                      {isOverdue && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono">
                          <AlertTriangle size={9} />
                          Overdue
                        </span>
                      )}
                    </div>
                    {task.notes && (
                      <p className="text-[10px] text-zinc-500 truncate mt-1">
                        {task.notes}
                      </p>
                    )}
                  </div>

                  {/* Meta items */}
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 justify-end mt-2 sm:mt-0">
                    {/* Due Date Indicator */}
                    <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                      <Calendar size={9} />
                      {task.dueDate}
                    </span>
                    
                    {task.dueTime && (
                      <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                        <Clock size={9} />
                        {task.dueTime}
                      </span>
                    )}

                    {/* Tag badge */}
                    <span className="text-[9px] px-2 py-0.5 rounded-full border text-zinc-400 uppercase tracking-wider leading-none bg-zinc-100 border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800">
                      {task.category}
                    </span>

                    {/* Priority badge */}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold leading-none ${priorityClass}`}>
                      {task.priority}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-1.5 pl-2 ml-1 border-zinc-200 dark:border-zinc-800/80">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-950/40 p-1 rounded-lg transition-colors"
                        title="Edit Task"
                      >
                        <Plus size={12} className="rotate-45" /> {/* Edit Icon helper */}
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-zinc-500 hover:text-rose-500 hover:bg-zinc-950/40 p-1 rounded-lg transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule New Task"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Revise Trees"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Task['priority'])}
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
                placeholder="e.g. LeetCode, Personal"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Date</label>
              <input
                type="date"
                required
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Time</label>
              <input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Notes (Optional)</label>
            <textarea
              placeholder="Provide a small description or context..."
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 resize-none bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all text-xs`}
          >
            Schedule Task
          </button>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTask(null);
        }}
        title="Edit Task Details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Task Title</label>
            <input
              type="text"
              required
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Task['priority'])}
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
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Date</label>
              <input
                type="date"
                required
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Time</label>
              <input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Notes (Optional)</label>
            <textarea
              placeholder="Provide a small description or context..."
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 resize-none bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all text-xs`}
          >
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};
