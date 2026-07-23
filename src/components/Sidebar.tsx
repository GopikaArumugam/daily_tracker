import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Code2,
  BarChart3,
  CalendarDays,
  Settings as SettingsIcon,
  Flame,
  BookOpen,
  Wallet,
  Timer,
  Compass
} from 'lucide-react';

interface SidebarProps {
  onOpenCommandPalette: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCommandPalette, isSidebarOpen, setIsSidebarOpen }) => {
  const { activePage, setActivePage, settings, tasks, leetCodeStats } = useDashboard();
  const accent = settings.accentColor as AccentColor;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'leetcode', label: 'LeetCode', icon: Code2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'focus', label: 'Focus Mode', icon: Timer },
    { id: 'roadmaps', label: 'Learning Paths', icon: Compass },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Calculate today's tasks completed/total
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.dueDate === todayStr);
  const completedToday = todaysTasks.filter(t => t.completed).length;
  const totalToday = todaysTasks.length;
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <>
      {/* Backdrop overlay on mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-zinc-950/20 dark:bg-zinc-950/50 backdrop-blur-[2px] z-30 lg:hidden"
        />
      )}

      <aside className={`w-64 fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-200 bg-white dark:bg-zinc-950/90 backdrop-blur-md dark:border-zinc-800/80 p-4 transition-all duration-300 transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Header */}
        <div className="flex items-center gap-2 px-3 py-4 mb-6">
          <div className={`p-2 rounded-xl bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 ${getAccentColor(accent, 'text')}`}>
            <Code2 size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-800 dark:text-zinc-100 leading-none">
              DevZen
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono">v1.0.0</span>
          </div>
        </div>

        {/* Search Trigger Shortcut */}
        <button 
          onClick={() => {
            onOpenCommandPalette();
            setIsSidebarOpen(false);
          }}
          className="w-full mb-6 flex items-center justify-between px-3 py-2 rounded-xl text-left border border-zinc-200 hover:bg-zinc-100 bg-zinc-50/40 text-zinc-550 text-xs transition-all dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-750 dark:text-zinc-400"
        >
          <span className="font-medium">Quick search...</span>
          <span className="font-mono text-[10px] border border-zinc-200 rounded px-1.5 py-0.5 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-455 dark:text-zinc-400">Ctrl+K</span>
        </button>

        {/* Nav Menu */}
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'text')} font-semibold`
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                <Icon size={18} className={isActive ? '' : 'text-zinc-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      {/* Bottom widgets */}
      <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-4 space-y-4">
        {/* Streak Counter */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
            <Flame size={16} fill="currentColor" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 leading-none">LeetCode Streak</div>
            <div className="text-sm font-bold text-zinc-850 dark:text-zinc-200">
              {leetCodeStats.currentStreak} {leetCodeStats.currentStreak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>

        {/* Task Completion Mini-Widget */}
        {totalToday > 0 && (
          <div className="px-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Today's Tasks</span>
              <span>{completedToday}/{totalToday}</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getAccentColor(accent, 'bg')} transition-all duration-500 ease-out`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};
