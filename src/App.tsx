import React, { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard, type Task } from './context/DashboardContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer, showToast } from './components/ui/Toast';
import { Modal } from './components/ui/Modal';
import { getAccentColor, type AccentColor } from './utils/theme';
import { motion, AnimatePresence } from 'framer-motion';

// Page components imports
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Goals } from './pages/Goals';
import { LeetCode } from './pages/LeetCode';
import { Analytics } from './pages/Analytics';
import { Calendar } from './pages/Calendar';
import { Finance } from './pages/Finance';
import { Focus } from './pages/Focus';
import { Notes } from './pages/Notes';
import { Settings } from './pages/Settings';

import { Plus } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activePage, settings, addTask } = useDashboard();
  const accent = settings.accentColor as AccentColor;

  // Global modals and panels state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isFabModalOpen, setIsFabModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // FAB Task Inputs
  const [fabTaskText, setFabTaskText] = useState('');
  const [fabTaskPriority, setFabTaskPriority] = useState<Task['priority']>('medium');
  const [fabTaskCategory, setFabTaskCategory] = useState('Study');
  const [fabTaskDate, setFabTaskDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fabTaskTime, setFabTaskTime] = useState('12:00');
  const [fabTaskNotes, setFabTaskNotes] = useState('');

  // Global Ctrl + K key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFabTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fabTaskText.trim()) return;

    addTask(fabTaskText, fabTaskPriority, fabTaskCategory, fabTaskDate, fabTaskTime, fabTaskNotes);
    
    // Reset
    setFabTaskText('');
    setFabTaskPriority('medium');
    setFabTaskCategory('Study');
    setFabTaskDate(new Date().toISOString().split('T')[0]);
    setFabTaskTime('12:00');
    setFabTaskNotes('');
    setIsFabModalOpen(false);
    showToast(`Task "${fabTaskText}" scheduled!`, 'success');
  };

  // Render active page selection with transition wrapper
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <Tasks />;
      case 'goals':
        return <Goals />;
      case 'leetcode':
        return <LeetCode />;
      case 'analytics':
        return <Analytics />;
      case 'calendar':
        return <Calendar />;
      case 'finance':
        return <Finance />;
      case 'focus':
        return <Focus />;
      case 'notes':
        return <Notes />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex text-zinc-800 dark:text-zinc-150 dark:bg-zinc-950 bg-zinc-50 transition-colors duration-300 relative overflow-hidden">
      {/* Ambient background blobs for glassmorphism bleed */}
      <div className="absolute top-[-100px] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-200/40 dark:bg-violet-950/15 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] right-[10%] w-[600px] h-[600px] rounded-full bg-sky-100/50 dark:bg-sky-950/15 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[5%] w-[450px] h-[450px] rounded-full bg-pink-100/40 dark:bg-pink-950/15 blur-3xl pointer-events-none z-0" />

      {/* Sidebar - left */}
      <Sidebar 
        onOpenCommandPalette={() => setIsPaletteOpen(true)} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      {/* Main Container - right */}
      <div className="flex-1 flex flex-col lg:pl-64 pl-0 min-w-0 relative z-10">
        {/* Top Header Navigation */}
        <Header 
          onOpenCommandPalette={() => setIsPaletteOpen(true)} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        {/* Scrollable Workspace */}
        <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setFabTaskDate(new Date().toISOString().split('T')[0]);
          setIsFabModalOpen(true);
        }}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl flex items-center justify-center text-zinc-950 font-bold ${getAccentColor(accent, 'bg')} hover:shadow-emerald-500/25 duration-300`}
        title="Schedule Quick Task (FAB)"
      >
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>

      {/* Command Palette Overlay */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* FAB Quick Add Task Modal */}
      <Modal
        isOpen={isFabModalOpen}
        onClose={() => setIsFabModalOpen(false)}
        title="Quick Schedule Task"
      >
        <form onSubmit={handleFabTaskSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Code database migrations"
              value={fabTaskText}
              onChange={(e) => setFabTaskText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm focus:outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Priority</label>
              <select
                value={fabTaskPriority}
                onChange={(e) => setFabTaskPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm focus:outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-700"
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
                placeholder="e.g. Coding, College"
                value={fabTaskCategory}
                onChange={(e) => setFabTaskCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm focus:outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Date</label>
              <input
                type="date"
                required
                value={fabTaskDate}
                onChange={(e) => setFabTaskDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm focus:outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Due Time</label>
              <input
                type="time"
                value={fabTaskTime}
                onChange={(e) => setFabTaskTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm focus:outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Notes (Optional)</label>
            <textarea
              placeholder="Provide a small description or context..."
              value={fabTaskNotes}
              onChange={(e) => setFabTaskNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-sm focus:outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-700 resize-none"
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
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
};

export default App;
