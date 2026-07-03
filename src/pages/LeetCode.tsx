import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import { 
  ComposedChart,
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Code2, 
  Plus, 
  Trash2, 
  Search,
  CheckCircle,
  Flame,
  Award,
  Terminal,
  BookOpen,
  BookMarked
} from 'lucide-react';

export const LeetCode: React.FC = () => {
  const { 
    leetCodeStats, 
    logLeetCodeSolve, 
    addLeetCodeNote, 
    toggleLeetCodeRevision, 
    deleteLeetCodeNote,
    incrementTopicProgress, 
    settings 
  } = useDashboard();

  const accent = settings.accentColor as AccentColor;

  // Local state
  const [isLogSolveOpen, setIsLogSolveOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [revisionOnly, setRevisionOnly] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');

  // Solve log form state
  const [solveCount, setSolveCount] = useState(1);
  const [solveDifficulty, setSolveDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Problem note form state
  const [problemId, setProblemId] = useState('');
  const [problemTitle, setProblemTitle] = useState('');
  const [noteDifficulty, setNoteDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [problemNote, setProblemNote] = useState('');
  const [forRevision, setForRevision] = useState(false);
  const [solveDate, setSolveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Today and Yesterday dates
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const todaySolved = leetCodeStats.history[todayStr] || 0;
  const yesterdaySolved = leetCodeStats.history[yesterdayStr] || 0;
  const diffCount = todaySolved - yesterdaySolved;
  const diffSign = diffCount >= 0 ? `+${diffCount}` : `${diffCount}`;

  // Compile LeetCode cumulative and daily trend data starting from July 1, 2026
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

  const chartGridColor = settings.theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const chartTextColor = settings.theme === 'dark' ? '#94a3b8' : '#64748b';

  // Log Solve Submission
  const handleSolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logLeetCodeSolve(solveCount, solveDifficulty, solveDate);
    setIsLogSolveOpen(false);
    setSolveCount(1);
    setSolveDate(new Date().toISOString().split('T')[0]);
    showToast(`Logged +${solveCount} ${solveDifficulty} solved problems!`, 'success');
  };

  // Add Problem Note Submission
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemId.trim() || !problemTitle.trim() || !problemNote.trim()) return;

    addLeetCodeNote(problemId, problemTitle, noteDifficulty, problemNote, forRevision, noteDate);
    
    // Automatically log 1 problem solved under this difficulty if user checked it
    logLeetCodeSolve(1, noteDifficulty, noteDate);

    // Reset
    setProblemId('');
    setProblemTitle('');
    setNoteDifficulty('Medium');
    setProblemNote('');
    setForRevision(false);
    setNoteDate(new Date().toISOString().split('T')[0]);
    setIsAddNoteOpen(false);
    showToast(`Logged note for "${problemTitle}" and logged solve count!`, 'success');
  };

  // Filter notes
  const notesArray = Object.entries(leetCodeStats.notes).map(([id, note]) => ({
    id,
    ...note
  }));

  const filteredNotes = notesArray.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(noteSearch.toLowerCase()) || 
                          note.note.toLowerCase().includes(noteSearch.toLowerCase()) ||
                          note.id.includes(noteSearch);
    
    const matchesRevision = revisionOnly ? note.forRevision : true;
    return matchesSearch && matchesRevision;
  });

  // Calculate difficulty ratios
  const totalSolvedAll = leetCodeStats.easySolved + leetCodeStats.mediumSolved + leetCodeStats.hardSolved || 1;
  const easyRatio = Math.round((leetCodeStats.easySolved / totalSolvedAll) * 100);
  const mediumRatio = Math.round((leetCodeStats.mediumSolved / totalSolvedAll) * 100);
  const hardRatio = Math.round((leetCodeStats.hardSolved / totalSolvedAll) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Code2 size={20} className="text-yellow-500" />
            <span>LeetCode Dashboard</span>
          </h2>
          <p className="text-xs text-zinc-500">Track solved problems, monitor streaks, study notes, and log topics</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsLogSolveOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-900 border border-zinc-800 text-zinc-200"
          >
            <Terminal size={14} />
            <span>Log Problems</span>
          </button>
          
          <button
            onClick={() => setIsAddNoteOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${getAccentColor(accent, 'bg')} text-zinc-950 hover:scale-105 active:scale-95 duration-150 transition-all shadow-md shadow-emerald-500/5`}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Solved Note</span>
          </button>
        </div>
      </div>

      {/* 1. Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solved Card */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Solved</span>
              <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">{leetCodeStats.totalSolved}</h3>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
              <Code2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className={`font-semibold ${diffCount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{diffSign}</span>
            <span className="text-zinc-400">vs Yesterday ({yesterdaySolved})</span>
          </div>
        </div>

        {/* Streaks Card */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Solving Streak</span>
              <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">{leetCodeStats.currentStreak} days</h3>
            </div>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <Flame size={16} fill="currentColor" />
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-400">
            <span>Longest streak: </span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{leetCodeStats.longestStreak} days</span>
          </div>
        </div>

        {/* Daily Challenge Card */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Daily Challenge</span>
              <h3 className="text-lg font-bold mt-1 text-zinc-800 dark:text-zinc-100">
                {leetCodeStats.dailyChallengeCompleted ? 'Completed today' : 'Pending challenge'}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${
              leetCodeStats.dailyChallengeCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-400">
            {leetCodeStats.dailyChallengeCompleted ? 'Keep the streak alive!' : 'Daily question is waiting!'}
          </div>
        </div>

        {/* Average solved Card */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Avg Problems/Day</span>
              <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">
                {(Object.values(leetCodeStats.history).reduce((a, b) => a + b, 0) / (Object.keys(leetCodeStats.history).length || 1)).toFixed(1)}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-400">
            <span>Solved past 7 days: </span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {Object.entries(leetCodeStats.history).filter(([d]) => new Date(d) > new Date(Date.now() - 7 * 86400000)).reduce((a, b) => a + b[1], 0)}
            </span>
          </div>
        </div>
      </div>

      {/* LeetCode Solves Trend Chart */}
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

      {/* 2. Difficulty Distribution & Topic-wise breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Difficulty ratios (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Difficulty Distribution</h3>
            <p className="text-xs text-zinc-500">Ratios of solved problems</p>
          </div>

          <div className="space-y-4">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-emerald-500">Easy</span>
                <span className="font-mono text-zinc-700 dark:text-slate-350">{leetCodeStats.easySolved} ({easyRatio}%)</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${easyRatio}%` }} />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-amber-500">Medium</span>
                <span className="font-mono text-zinc-700 dark:text-slate-350">{leetCodeStats.mediumSolved} ({mediumRatio}%)</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${mediumRatio}%` }} />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-rose-500">Hard</span>
                <span className="font-mono text-zinc-700 dark:text-slate-350">{leetCodeStats.hardSolved} ({hardRatio}%)</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hardRatio}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-xl text-center text-[10px] text-zinc-500 italic bg-zinc-100 border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-800">
            "Your strength is determined by your hard solves. Keep grinding!"
          </div>
        </div>

        {/* Topic-wise breakdown progress (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Topic Progress Tracker</h3>
            <p className="text-xs text-zinc-500">Problems solved per data structure & algorithm</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {Object.entries(leetCodeStats.topicProgress).map(([topic, data]) => {
              const ratio = Math.round((data.solved / data.target) * 100);
              const isCompleted = data.solved >= data.target;

              return (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-zinc-700 dark:text-zinc-200 truncate pr-1">{topic}</span>
                    <span className="font-mono text-zinc-500">
                      {data.solved}/{data.target}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>
                    {/* Controls */}
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => incrementTopicProgress(topic, -1)}
                        disabled={data.solved <= 0}
                        className="w-4 h-4 text-[9px] flex items-center justify-center rounded border text-zinc-400 hover:text-zinc-200 disabled:opacity-30 bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800"
                      >
                        -
                      </button>
                      <button
                        onClick={() => incrementTopicProgress(topic, 1)}
                        disabled={isCompleted}
                        className="w-4 h-4 text-[9px] flex items-center justify-center rounded border text-zinc-400 hover:text-zinc-200 disabled:opacity-30 bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Problem Study Notes Database */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" />
              <span>Solved Problem Study Notes</span>
            </h3>
            <p className="text-xs text-zinc-500">Reflections, complex explanations, and revision flags</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search notes..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full sm:w-44 pl-8 pr-2.5 py-1.5 rounded-xl border placeholder-zinc-500 focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40"
              />
            </div>

            {/* Revision Only toggle */}
            <button
              onClick={() => setRevisionOnly(!revisionOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                revisionOnly
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-550 dark:bg-zinc-950/40 dark:border-zinc-800'
              }`}
            >
              <BookMarked size={12} />
              <span>Revision Only</span>
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl">
            {noteSearch ? "No study notes match your search term." : "No problems marked for revision. Add notes above!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map(note => {
              const diffColor = 
                note.difficulty === 'Easy' ? 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20' : 
                note.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20' : 
                'text-rose-500 bg-rose-500/10 dark:bg-rose-500/5 border-rose-500/20';

              return (
                <div 
                  key={note.id} 
                  className={`p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950/10 light:border-zinc-200 light:bg-zinc-50 flex flex-col justify-between gap-4 transition-all relative ${
                    note.forRevision ? 'border-rose-500/25 bg-rose-500/[0.01]' : ''
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono">#{note.id}</span>
                        <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-200 leading-snug">
                          {note.title}
                        </h4>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold leading-none shrink-0 ${diffColor}`}>
                        {note.difficulty}
                      </span>
                    </div>

                    {/* Note body */}
                    <p className="leading-relaxed font-mono whitespace-pre-wrap py-2 text-slate-650 border-zinc-100 dark:border-zinc-800/60">
                      {note.note}
                    </p>
                  </div>

                  {/* Actions / Meta */}
                  <div className="flex items-center justify-between pt-3 text-[10px] text-zinc-500 border-zinc-100 dark:border-zinc-800/60">
                    <span>Logged: {note.date}</span>
                    
                    <div className="flex items-center gap-3">
                      {/* Toggle revision */}
                      <button
                        onClick={() => {
                          toggleLeetCodeRevision(note.id);
                          showToast(`Toggled revision status for "${note.title}"`, 'info');
                        }}
                        className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
                          note.forRevision
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            : 'border-zinc-200 text-zinc-500 dark:border-zinc-800'
                        }`}
                      >
                        <BookMarked size={10} />
                        <span>Revision</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          deleteLeetCodeNote(note.id);
                          showToast('Note deleted.', 'error');
                        }}
                        className="text-zinc-500 hover:text-rose-500 p-0.5 rounded transition-colors"
                        title="Delete Note"
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

      <Modal
        isOpen={isLogSolveOpen}
        onClose={() => setIsLogSolveOpen(false)}
        title="Log Solved Problems"
      >
        <form onSubmit={handleSolveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Number Solved</label>
              <input
                type="number"
                min={1}
                required
                value={solveCount}
                onChange={(e) => setSolveCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">Difficulty</label>
              <select
                value={solveDifficulty}
                onChange={(e) => setSolveDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">Date Solved</label>
              <input
                type="date"
                required
                value={solveDate}
                onChange={(e) => setSolveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all text-xs`}
          >
            Submit Logs
          </button>
        </form>
      </Modal>

      {/* Add Solved Note modal */}
      <Modal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        title="Add Problem Notes"
      >
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1 col-span-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Problem #</label>
              <input
                type="text"
                required
                placeholder="e.g. 15"
                value={problemId}
                onChange={(e) => setProblemId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Problem Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 3Sum"
                value={problemTitle}
                onChange={(e) => setProblemTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Difficulty</label>
              <select
                value={noteDifficulty}
                onChange={(e) => setNoteDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Date Solved</label>
              <input
                type="date"
                required
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                id="revision-checkbox"
                type="checkbox"
                checked={forRevision}
                onChange={(e) => setForRevision(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded border-zinc-800 bg-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
              />
              <label htmlFor="revision-checkbox" className="text-xs text-zinc-450 font-semibold cursor-pointer select-none">
                Mark for Revision
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Personal Notes / Solutions</label>
            <textarea
              required
              placeholder="Write down details like time complexity, patterns, or quick logic pointers..."
              value={problemNote}
              onChange={(e) => setProblemNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 resize-none font-mono bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <p className="text-[10px] text-zinc-500 italic">
            * Note: Creating a problem study note will automatically log 1 solved count under this difficulty.
          </p>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all text-xs`}
          >
            Save Note & Log Solve
          </button>
        </form>
      </Modal>
    </div>
  );
};
