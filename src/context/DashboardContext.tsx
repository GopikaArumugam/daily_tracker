import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Helper for date string
export const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Data Models
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  notes?: string;
  completedAt?: string; // ISO string
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: 'low' | 'medium' | 'high';
  deadline?: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
}

export interface LeetCodeNote {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  note: string;
  forRevision: boolean;
  date: string;
}

export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  longestStreak: number;
  dailyChallengeCompleted: boolean;
  history: { [date: string]: number }; // Date -> solved count on that day
  topicProgress: { [topic: string]: { solved: number; target: number } };
  notes: { [problemId: string]: LeetCodeNote };
}

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  subject: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: 'Food' | 'Dessert' | 'Snacks' | 'Fees' | 'Gifts' | 'Essentials' | 'Other' | 'Income';
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  date: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  accentColor: 'green' | 'blue' | 'purple' | 'rose' | 'amber';
  defaultDailyGoals: Omit<Goal, 'id' | 'createdAt' | 'current'>[];
  defaultWeeklyGoals: Omit<Goal, 'id' | 'createdAt' | 'current'>[];
  heatmapIntensity: 'low' | 'medium' | 'high';
}

export interface DayStats {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  completionPercentage: number;
  dailyGoalsCompleted: number;
  dailyGoalsTotal: number;
  studyHours: number;
  leetCodeSolved: number;
}

// Initial Mock Data

const initialTasks: Task[] = [];

const initialDailyGoals: Goal[] = [];

const initialWeeklyGoals: Goal[] = [];

const initialDailyGoalsHistory: { [date: string]: { completed: number; total: number } } = {};

const initialLeetCodeStats: LeetCodeStats = {
  totalSolved: 553,
  easySolved: 308,
  mediumSolved: 225,
  hardSolved: 10,
  currentStreak: 0,
  longestStreak: 0,
  dailyChallengeCompleted: false,
  history: {},
  topicProgress: {},
  notes: {}
};

const initialStudyLogs: StudyLog[] = [];

const initialNotes: Note[] = [];

const initialSettings: Settings = {
  theme: 'light',
  accentColor: 'purple',
  defaultDailyGoals: [],
  defaultWeeklyGoals: [],
  heatmapIntensity: 'medium'
};

// Context interface
interface DashboardContextProps {
  activePage: string;
  setActivePage: (page: string) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (text: string, priority: Task['priority'], category: string, dueDate: string, dueTime?: string, notes?: string) => void;
  toggleTask: (id: string) => boolean; // Returns true if it results in all daily tasks being completed
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  
  dailyGoals: Goal[];
  addDailyGoal: (title: string, target: number, priority: Goal['priority']) => void;
  updateDailyGoalProgress: (id: string, progress: number) => void;
  deleteDailyGoal: (id: string) => void;
  
  weeklyGoals: Goal[];
  addWeeklyGoal: (title: string, target: number, priority: Goal['priority'], deadline?: string) => void;
  updateWeeklyGoalProgress: (id: string, progress: number) => void;
  deleteWeeklyGoal: (id: string) => void;
  
  // Custom Goals list for the dedicated Goals page
  customGoals: Goal[];
  addCustomGoal: (title: string, target: number, category: Goal['category'], priority: Goal['priority'], deadline?: string) => void;
  updateCustomGoalProgress: (id: string, progress: number) => void;
  deleteCustomGoal: (id: string) => void;
  
  dailyGoalsHistory: { [date: string]: { completed: number; total: number } };
  leetCodeStats: LeetCodeStats;
  logLeetCodeSolve: (count: number, difficulty: 'Easy' | 'Medium' | 'Hard', dateStr?: string) => void;
  addLeetCodeNote: (problemId: string, title: string, difficulty: LeetCodeNote['difficulty'], note: string, forRevision: boolean, dateStr?: string) => void;
  toggleLeetCodeRevision: (problemId: string) => void;
  deleteLeetCodeNote: (problemId: string) => void;
  incrementTopicProgress: (topic: string, amount: number) => void;
  
  studyLogs: StudyLog[];
  addStudyLog: (hours: number, subject: string, date?: string) => void;
  deleteStudyLog: (id: string) => void;
  
  notes: Note[];
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;
  
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  
  transactions: Transaction[];
  addTransaction: (title: string, amount: number, type: 'expense' | 'income', category: Transaction['category'], date: string) => void;
  deleteTransaction: (id: string) => void;
  
  getDayStats: (dateStr: string) => DayStats;
  
  importData: (jsonData: string) => boolean;
  exportData: () => string;
  resetToFactory: () => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  
  // Persisted state hooks
  const [tasks, setTasks] = useLocalStorage<Task[]>('dashboard_tasks_v2', initialTasks);
  const [dailyGoals, setDailyGoals] = useLocalStorage<Goal[]>('dashboard_daily_goals_v2', initialDailyGoals);
  const [weeklyGoals, setWeeklyGoals] = useLocalStorage<Goal[]>('dashboard_weekly_goals_v2', initialWeeklyGoals);
  const [customGoals, setCustomGoals] = useLocalStorage<Goal[]>('dashboard_custom_goals_v2', []);
  const [dailyGoalsHistory, setDailyGoalsHistory] = useLocalStorage<{ [date: string]: { completed: number; total: number } }>('dashboard_daily_goals_history_v2', initialDailyGoalsHistory);
  const [leetCodeStats, setLeetCodeStats] = useLocalStorage<LeetCodeStats>('dashboard_leetcode_stats_v2', initialLeetCodeStats);
  const [studyLogs, setStudyLogs] = useLocalStorage<StudyLog[]>('dashboard_study_logs_v2', initialStudyLogs);
  const [notes, setNotes] = useLocalStorage<Note[]>('dashboard_notes_v2', initialNotes);
  const [settings, setSettings] = useLocalStorage<Settings>('dashboard_settings_v2', initialSettings);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('dashboard_transactions_v2', []);

  // Automatic migration check to clear out old mock data
  useEffect(() => {
    const rawTasks = localStorage.getItem('dashboard_tasks_v2');
    if (rawTasks && rawTasks.includes('"t1"')) {
      localStorage.setItem('dashboard_tasks_v2', JSON.stringify([]));
      localStorage.setItem('dashboard_daily_goals_v2', JSON.stringify([]));
      localStorage.setItem('dashboard_weekly_goals_v2', JSON.stringify([]));
      localStorage.setItem('dashboard_daily_goals_history_v2', JSON.stringify({}));
      localStorage.setItem('dashboard_leetcode_stats_v2', JSON.stringify({
        totalSolved: 553,
        easySolved: 308,
        mediumSolved: 225,
        hardSolved: 10,
        currentStreak: 0,
        longestStreak: 0,
        dailyChallengeCompleted: false,
        history: {},
        topicProgress: {},
        notes: {}
      }));
      localStorage.setItem('dashboard_study_logs_v2', JSON.stringify([]));
      localStorage.setItem('dashboard_notes_v2', JSON.stringify([]));
      window.location.reload();
    }
  }, []);

  // Apply Theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      body.classList.remove('light');
    } else {
      root.classList.remove('dark');
      body.classList.add('light');
    }
  }, [settings.theme]);

  // Accent color CSS variables or dynamic colors mapping
  // We'll manage this in components directly for clean Tailwind integration,
  // matching keys: 'green', 'blue', 'purple', 'rose', 'amber'

  // Reset Daily Goals at midnight (optional but nice, we simulate by checking date)
  useEffect(() => {
    const lastAccessDate = localStorage.getItem('dashboard_last_access');
    const todayStr = getLocalDateString();
    
    if (lastAccessDate && lastAccessDate !== todayStr) {
      // It's a new day! Save yesterday's daily goals status to history
      const completed = dailyGoals.filter(g => g.current >= g.target).length;
      const total = dailyGoals.length;
      
      setDailyGoalsHistory(prev => ({
        ...prev,
        [lastAccessDate]: { completed, total }
      }));
      
      // Reset current daily goals to 0
      setDailyGoals(prev => prev.map(g => ({ ...g, current: 0, createdAt: todayStr })));
      
      // Also update LeetCode daily challenge status
      setLeetCodeStats(prev => ({
        ...prev,
        dailyChallengeCompleted: false
      }));
    }
    
    localStorage.setItem('dashboard_last_access', todayStr);
  }, [dailyGoals, setDailyGoals, setDailyGoalsHistory, setLeetCodeStats]);

  // Tasks actions
  const addTask = (text: string, priority: Task['priority'], category: string, dueDate: string, dueTime?: string, notes?: string) => {
    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      priority,
      category,
      dueDate,
      dueTime,
      notes
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    let allCompletedNow = false;
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          const completed = !t.completed;
          return {
            ...t,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined
          };
        }
        return t;
      });

      // Check if all tasks due today are completed now (and there is at least one task)
      const todaysTasks = updated.filter(t => t.dueDate === getLocalDateString());
      if (todaysTasks.length > 0 && todaysTasks.every(t => t.completed)) {
        // If the task that was just toggled is now completed, we may fire confetti
        const justToggled = updated.find(t => t.id === id);
        if (justToggled && justToggled.completed) {
          allCompletedNow = true;
        }
      }
      return updated;
    });

    return allCompletedNow;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const reorderTasks = (startIndex: number, endIndex: number) => {
    setTasks(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // Finance & Transaction actions
  const addTransaction = (title: string, amount: number, type: 'expense' | 'income', category: Transaction['category'], date: string) => {
    const newTx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 11),
      title: title.trim(),
      amount: Math.max(0, amount),
      type,
      category,
      date,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Daily goals actions
  const addDailyGoal = (title: string, target: number, priority: Goal['priority']) => {
    const newGoal: Goal = {
      id: 'goal_daily_' + Math.random().toString(36).substr(2, 9),
      title,
      target,
      current: 0,
      category: 'daily',
      priority,
      createdAt: getLocalDateString()
    };
    setDailyGoals(prev => [...prev, newGoal]);
    
    // Update daily goals history tracker
    setDailyGoalsHistory(prev => {
      const todayStr = getLocalDateString();
      const currentStats = prev[todayStr] || { completed: 0, total: 0 };
      return {
        ...prev,
        [todayStr]: { ...currentStats, total: currentStats.total + 1 }
      };
    });
  };

  const updateDailyGoalProgress = (id: string, progress: number) => {
    setDailyGoals(prev => {
      const updated = prev.map(g => {
        if (g.id === id) {
          const newCurrent = Math.max(0, Math.min(g.target, progress));
          return { ...g, current: newCurrent };
        }
        return g;
      });

      // Update history completed count
      const todayStr = getLocalDateString();
      const completed = updated.filter(g => g.current >= g.target).length;
      const total = updated.length;
      setDailyGoalsHistory(prevHist => ({
        ...prevHist,
        [todayStr]: { completed, total }
      }));

      return updated;
    });
  };

  const deleteDailyGoal = (id: string) => {
    setDailyGoals(prev => {
      const filtered = prev.filter(g => g.id !== id);
      const todayStr = getLocalDateString();
      const completed = filtered.filter(g => g.current >= g.target).length;
      const total = filtered.length;
      setDailyGoalsHistory(prevHist => ({
        ...prevHist,
        [todayStr]: { completed, total }
      }));
      return filtered;
    });
  };

  // Weekly goals actions
  const addWeeklyGoal = (title: string, target: number, priority: Goal['priority'], deadline?: string) => {
    const newGoal: Goal = {
      id: 'goal_weekly_' + Math.random().toString(36).substr(2, 9),
      title,
      target,
      current: 0,
      category: 'weekly',
      priority,
      deadline,
      createdAt: getLocalDateString()
    };
    setWeeklyGoals(prev => [...prev, newGoal]);
  };

  const updateWeeklyGoalProgress = (id: string, progress: number) => {
    setWeeklyGoals(prev => prev.map(g => (g.id === id ? { ...g, current: Math.max(0, Math.min(g.target, progress)) } : g)));
  };

  const deleteWeeklyGoal = (id: string) => {
    setWeeklyGoals(prev => prev.filter(g => g.id !== id));
  };

  // Custom dedicated goals actions
  const addCustomGoal = (title: string, target: number, category: Goal['category'], priority: Goal['priority'], deadline?: string) => {
    const newGoal: Goal = {
      id: 'goal_custom_' + Math.random().toString(36).substr(2, 9),
      title,
      target,
      current: 0,
      category,
      priority,
      deadline,
      createdAt: getLocalDateString()
    };
    setCustomGoals(prev => [...prev, newGoal]);
  };

  const updateCustomGoalProgress = (id: string, progress: number) => {
    setCustomGoals(prev => prev.map(g => (g.id === id ? { ...g, current: Math.max(0, Math.min(g.target, progress)) } : g)));
  };

  const deleteCustomGoal = (id: string) => {
    setCustomGoals(prev => prev.filter(g => g.id !== id));
  };

  // LeetCode actions
  const logLeetCodeSolve = (count: number, difficulty: 'Easy' | 'Medium' | 'Hard', dateStr?: string) => {
    const targetDateStr = dateStr || getLocalDateString();
    
    setLeetCodeStats(prev => {
      const currentTodaySolved = prev.history[targetDateStr] || 0;
      const newTodaySolved = Math.max(0, currentTodaySolved + count);
      
      const newEasy = difficulty === 'Easy' ? Math.max(0, prev.easySolved + count) : prev.easySolved;
      const newMedium = difficulty === 'Medium' ? Math.max(0, prev.mediumSolved + count) : prev.mediumSolved;
      const newHard = difficulty === 'Hard' ? Math.max(0, prev.hardSolved + count) : prev.hardSolved;
      
      const newTotal = prev.totalSolved + count;

      // Update topic progress (increment the corresponding category if it exists)
      const updatedTopicProgress = { ...prev.topicProgress };
      const matchingTopic = Object.keys(updatedTopicProgress).find(t => difficulty === 'Easy' ? t === 'Arrays' || t === 'Strings' : difficulty === 'Medium' ? t === 'Trees' || t === 'Stack' : t === 'Graphs' || t === 'Dynamic Programming');
      if (matchingTopic) {
        updatedTopicProgress[matchingTopic] = {
          ...updatedTopicProgress[matchingTopic],
          solved: Math.min(updatedTopicProgress[matchingTopic].target, updatedTopicProgress[matchingTopic].solved + count)
        };
      }

      // Quick streak logic: if user solves today, make sure streak is active
      let streak = prev.currentStreak;
      if (currentTodaySolved === 0 && count > 0) {
        streak += 1;
      } else if (newTodaySolved === 0 && currentTodaySolved > 0) {
        streak = Math.max(0, streak - 1);
      }

      const isToday = targetDateStr === getLocalDateString();

      return {
        ...prev,
        totalSolved: newTotal,
        easySolved: newEasy,
        mediumSolved: newMedium,
        hardSolved: newHard,
        currentStreak: isToday ? streak : prev.currentStreak,
        longestStreak: isToday ? Math.max(streak, prev.longestStreak) : prev.longestStreak,
        dailyChallengeCompleted: isToday ? true : prev.dailyChallengeCompleted,
        history: {
          ...prev.history,
          [targetDateStr]: newTodaySolved
        },
        topicProgress: updatedTopicProgress
      };
    });

    // Automatically check off "Solve LeetCode Daily" task if it exists for target date
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.dueDate === targetDateStr && t.text.toLowerCase().includes('leetcode')) {
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      }
      return t;
    }));

    // Update LeetCode Daily goal if present
    setDailyGoals(prevGoals => prevGoals.map(g => {
      if (g.title.toLowerCase().includes('leetcode') && g.createdAt === targetDateStr) {
        return { ...g, current: Math.min(g.target, g.current + count) };
      }
      return g;
    }));
    
    // Update LeetCode Weekly goal if present
    setWeeklyGoals(prevGoals => prevGoals.map(g => {
      if (g.title.toLowerCase().includes('leetcode')) {
        return { ...g, current: Math.min(g.target, g.current + count) };
      }
      return g;
    }));
  };

  const addLeetCodeNote = (problemId: string, title: string, difficulty: LeetCodeNote['difficulty'], note: string, forRevision: boolean, dateStr?: string) => {
    setLeetCodeStats(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [problemId]: {
          title,
          difficulty,
          note,
          forRevision,
          date: dateStr || getLocalDateString()
        }
      }
    }));
  };

  const toggleLeetCodeRevision = (problemId: string) => {
    setLeetCodeStats(prev => {
      const problem = prev.notes[problemId];
      if (!problem) return prev;
      return {
        ...prev,
        notes: {
          ...prev.notes,
          [problemId]: {
            ...problem,
            forRevision: !problem.forRevision
          }
        }
      };
    });
  };

  const deleteLeetCodeNote = (problemId: string) => {
    setLeetCodeStats(prev => {
      const updatedNotes = { ...prev.notes };
      delete updatedNotes[problemId];
      return {
        ...prev,
        notes: updatedNotes
      };
    });
  };

  const incrementTopicProgress = (topic: string, amount: number) => {
    setLeetCodeStats(prev => {
      if (!prev.topicProgress[topic]) return prev;
      const current = prev.topicProgress[topic].solved;
      const target = prev.topicProgress[topic].target;
      return {
        ...prev,
        topicProgress: {
          ...prev.topicProgress,
          [topic]: {
            ...prev.topicProgress[topic],
            solved: Math.max(0, Math.min(target, current + amount))
          }
        }
      };
    });
  };

  // Study log actions
  const addStudyLog = (hours: number, subject: string, date: string = getLocalDateString()) => {
    const newLog: StudyLog = {
      id: 'study_' + Math.random().toString(36).substr(2, 9),
      date,
      hours,
      subject
    };
    setStudyLogs(prev => [newLog, ...prev]);

    // Update study goals if it matches "study" (Daily and Weekly)
    if (date === getLocalDateString()) {
      setDailyGoals(prevGoals => prevGoals.map(g => {
        if (g.title.toLowerCase().includes('study')) {
          return { ...g, current: Math.min(g.target, g.current + hours) };
        }
        return g;
      }));
    }
    
    // Update weekly study goal
    setWeeklyGoals(prevGoals => prevGoals.map(g => {
      if (g.title.toLowerCase().includes('study')) {
        return { ...g, current: Math.min(g.target, g.current + hours) };
      }
      return g;
    }));
  };

  const deleteStudyLog = (id: string) => {
    setStudyLogs(prev => prev.filter(log => log.id !== id));
  };

  // Quick notes actions
  const addNote = (title: string, content: string) => {
    const newNote: Note = {
      id: 'note_' + Math.random().toString(36).substr(2, 9),
      title,
      content,
      pinned: false,
      date: getLocalDateString()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, title: string, content: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, title, content } : n)));
  };

  const togglePinNote = (id: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Settings actions
  const updateSettings = (updatedFields: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updatedFields }));
  };

  // Deriving Heatmap Data dynamically for any date
  const getDayStats = (dateStr: string): DayStats => {
    // Tasks on that day
    const tasksForDay = tasks.filter(t => t.dueDate === dateStr);
    const tasksCompleted = tasksForDay.filter(t => t.completed).length;
    const tasksTotal = tasksForDay.length;
    
    // Daily goals on that day (from saved history, or current dailyGoals if it is today)
    let dailyGoalsStats = dailyGoalsHistory[dateStr];
    if (dateStr === getLocalDateString()) {
      dailyGoalsStats = {
        completed: dailyGoals.filter(g => g.current >= g.target).length,
        total: dailyGoals.length
      };
    }
    const dgCompleted = dailyGoalsStats?.completed || 0;
    const dgTotal = dailyGoalsStats?.total || 0;
    
    // Study hours
    const studyHours = studyLogs
      .filter(log => log.date === dateStr)
      .reduce((sum, log) => sum + log.hours, 0);
      
    // LeetCode solved
    const leetCodeSolved = leetCodeStats.history[dateStr] || 0;
    
    // Heatmap completion percentage calculation:
    let completionPercentage = 0;
    const totalDenom = tasksTotal + dgTotal;
    const completedNum = tasksCompleted + dgCompleted;
    
    if (totalDenom > 0) {
      completionPercentage = Math.round((completedNum / totalDenom) * 100);
    } else if (studyHours > 0 || leetCodeSolved > 0) {
      // Baseline if user worked but had no tasks/goals defined
      completionPercentage = Math.min(100, Math.round((studyHours / 3 + leetCodeSolved / 5) * 50));
    }
    
    return {
      date: dateStr,
      tasksCompleted,
      tasksTotal,
      completionPercentage,
      dailyGoalsCompleted: dgCompleted,
      dailyGoalsTotal: dgTotal,
      studyHours,
      leetCodeSolved
    };
  };

  // Export / Import data
  const exportData = () => {
    const payload = {
      tasks,
      dailyGoals,
      weeklyGoals,
      customGoals,
      dailyGoalsHistory,
      leetCodeStats,
      studyLogs,
      notes,
      settings,
      transactions
    };
    return JSON.stringify(payload, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks) setTasks(data.tasks);
      if (data.dailyGoals) setDailyGoals(data.dailyGoals);
      if (data.weeklyGoals) setWeeklyGoals(data.weeklyGoals);
      if (data.customGoals) setCustomGoals(data.customGoals);
      if (data.dailyGoalsHistory) setDailyGoalsHistory(data.dailyGoalsHistory);
      if (data.leetCodeStats) setLeetCodeStats(data.leetCodeStats);
      if (data.studyLogs) setStudyLogs(data.studyLogs);
      if (data.notes) setNotes(data.notes);
      if (data.settings) setSettings(data.settings);
      if (data.transactions) setTransactions(data.transactions);
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  };

  const resetToFactory = () => {
    setTasks(initialTasks);
    setDailyGoals(initialDailyGoals);
    setWeeklyGoals(initialWeeklyGoals);
    setCustomGoals([]);
    setDailyGoalsHistory(initialDailyGoalsHistory);
    setLeetCodeStats(initialLeetCodeStats);
    setStudyLogs(initialStudyLogs);
    setNotes(initialNotes);
    setSettings(initialSettings);
    setTransactions([]);
  };

  return (
    <DashboardContext.Provider
      value={{
        activePage,
        setActivePage,
        tasks,
        setTasks,
        addTask,
        toggleTask,
        updateTask,
        deleteTask,
        reorderTasks,
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
        dailyGoalsHistory,
        leetCodeStats,
        logLeetCodeSolve,
        addLeetCodeNote,
        toggleLeetCodeRevision,
        deleteLeetCodeNote,
        incrementTopicProgress,
        studyLogs,
        addStudyLog,
        deleteStudyLog,
        notes,
        addNote,
        updateNote,
        togglePinNote,
        deleteNote,
        settings,
        updateSettings,
        getDayStats,
        transactions,
        addTransaction,
        deleteTransaction,
        importData,
        exportData,
        resetToFactory
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
