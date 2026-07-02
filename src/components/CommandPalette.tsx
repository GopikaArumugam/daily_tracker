import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { showToast } from './ui/Toast';
import { 
  Search, 
  Terminal, 
  ArrowRight, 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Code2, 
  BarChart3, 
  CalendarDays, 
  BookOpen, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Plus,
  BookMarked
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { 
    setActivePage, 
    settings, 
    updateSettings, 
    notes, 
    tasks, 
    addTask,
    addStudyLog,
    toggleTask
  } = useDashboard();
  
  const accent = settings.accentColor as AccentColor;
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle escape, arrows, and enter keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleExecute(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  // List of available command palette options
  const commands = [
    // Navigation
    { id: 'nav_dash', label: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => setActivePage('dashboard') },
    { id: 'nav_tasks', label: 'Go to Tasks', category: 'Navigation', icon: CheckSquare, action: () => setActivePage('tasks') },
    { id: 'nav_goals', label: 'Go to Goals', category: 'Navigation', icon: Target, action: () => setActivePage('goals') },
    { id: 'nav_leetcode', label: 'Go to LeetCode', category: 'Navigation', icon: Code2, action: () => setActivePage('leetcode') },
    { id: 'nav_analytics', label: 'Go to Analytics', category: 'Navigation', icon: BarChart3, action: () => setActivePage('analytics') },
    { id: 'nav_calendar', label: 'Go to Calendar', category: 'Navigation', icon: CalendarDays, action: () => setActivePage('calendar') },
    { id: 'nav_notes', label: 'Go to Notes', category: 'Navigation', icon: BookOpen, action: () => setActivePage('notes') },
    { id: 'nav_settings', label: 'Go to Settings', category: 'Navigation', icon: SettingsIcon, action: () => setActivePage('settings') },
    
    // Quick Actions
    { 
      id: 'act_theme', 
      label: `Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`, 
      category: 'Preferences', 
      icon: settings.theme === 'dark' ? Sun : Moon, 
      action: () => {
        updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
        showToast(`Switched to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`, 'info');
      } 
    },
    { 
      id: 'act_task_quick', 
      label: 'Create Quick Task: "Review code"', 
      category: 'Actions', 
      icon: Plus, 
      action: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        addTask('Review code', 'medium', 'Coding', todayStr);
        showToast('Created task "Review code" for today!', 'success');
      } 
    },
    { 
      id: 'act_study_1h', 
      label: 'Log 1 Hour of Study (Generic)', 
      category: 'Actions', 
      icon: Terminal, 
      action: () => {
        addStudyLog(1, 'General Study');
        showToast('Logged 1 hour of study!', 'success');
      } 
    }
  ];

  // Append notes search results
  const notesCommands = notes.map(note => ({
    id: `note_${note.id}`,
    label: `Open Note: ${note.title}`,
    category: 'Notes',
    icon: BookMarked,
    action: () => {
      setActivePage('notes');
      // Simple timeout so context updates navigation before notes focuses it
      setTimeout(() => {
        const el = document.getElementById(`note-card-${note.id}`);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }));

  // Append pending tasks search results
  const taskCommands = tasks.filter(t => !t.completed).slice(0, 5).map(task => ({
    id: `task_toggle_${task.id}`,
    label: `Complete Task: ${task.text}`,
    category: 'Pending Tasks',
    icon: CheckSquare,
    action: () => {
      toggleTask(task.id);
      showToast(`Completed task "${task.text}"!`, 'success');
    }
  }));

  const allItems = [...commands, ...notesCommands, ...taskCommands];
  
  // Filter items based on query
  const filteredItems = allItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleExecute = (item: typeof allItems[0]) => {
    item.action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
      />

      {/* Palette Box */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl flex flex-col transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-zinc-100 dark:border-zinc-800/80">
          <Search size={18} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-0"
          />
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md border text-zinc-500 bg-zinc-100 border-zinc-200 dark:border-zinc-800">
            esc
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Terminal size={24} className="text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-400">No commands or notes found matching "{query}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Group items by category */}
              {Array.from(new Set(filteredItems.map(item => item.category))).map(category => (
                <div key={category} className="space-y-0.5">
                  {/* Category Title */}
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {category}
                  </div>
                  
                  {/* Category Items */}
                  {filteredItems
                    .filter(item => item.category === category)
                    .map(item => {
                      const Icon = item.icon;
                      // Calculate overall index of item in filteredItems to check if selected
                      const overallIndex = filteredItems.indexOf(item);
                      const isSelected = overallIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleExecute(item)}
                          onMouseEnter={() => setSelectedIndex(overallIndex)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                            isSelected
                              ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'text')} font-medium`
                              : 'text-zinc-400 hover:text-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon size={14} className={isSelected ? '' : 'text-zinc-500'} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {isSelected && (
                            <ArrowRight size={12} className="opacity-80" />
                          )}
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 flex items-center gap-4 text-[10px] text-zinc-500 font-mono justify-between select-none border-zinc-100 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950/20">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Antigravity Command Palette</span>
        </div>
      </div>
    </div>
  );
};
