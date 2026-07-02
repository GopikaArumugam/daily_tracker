import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Sun, Moon, Search, Bell } from 'lucide-react';
interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  const { settings, updateSettings, tasks } = useDashboard();
  
  const [greeting, setGreeting] = useState('Hello');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update greeting and time
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else if (hour >= 17 && hour < 22) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  // Format Date: e.g. "Wednesday, July 1"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check pending high priority tasks today
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingHighPriority = tasks.filter(
    t => t.dueDate === todayStr && !t.completed && t.priority === 'high'
  ).length;

  return (
    <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/40 sticky top-0 right-0 left-0 z-10 flex items-center justify-between px-8 transition-colors duration-300">
      {/* Date & Greeting */}
      <div className="flex flex-col">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
          {greeting}, Gopika 👋
        </h2>
        <span className="text-[11px] text-zinc-500 font-medium">
          {formatDate(currentTime)}
        </span>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Cmd/Search button */}
        <button
          onClick={onOpenCommandPalette}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
          title="Search / Actions (Ctrl+K)"
        >
          <Search size={18} />
        </button>

        {/* High priority notification dot */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            title={pendingHighPriority > 0 ? `${pendingHighPriority} critical tasks pending` : 'No critical alerts'}
          >
            <Bell size={18} />
          </button>
          {pendingHighPriority > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 relative overflow-hidden"
          title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {settings.theme === 'dark' ? (
            <Sun size={18} className="text-yellow-400 animate-spin-slow" />
          ) : (
            <Moon size={18} className="text-zinc-700 hover:text-zinc-900" />
          )}
        </button>
      </div>
    </header>
  );
};
