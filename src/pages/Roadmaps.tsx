import React, { useState } from 'react';
import { useDashboard, type Roadmap, type RoadmapMilestone } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import confetti from 'canvas-confetti';
import {
  Compass,
  Plus,
  Trash2,
  Brain,
  TrendingUp,
  Code2,
  AlertCircle,
  Edit2,
  CalendarCheck2
} from 'lucide-react';

export const Roadmaps: React.FC = () => {
  const {
    roadmaps,
    addRoadmap,
    updateRoadmap,
    deleteRoadmap,
    addMilestone,
    deleteMilestone,
    addTopic,
    deleteTopic,
    toggleTopicCompleted,
    addTask,
    settings
  } = useDashboard();

  const accent = settings.accentColor as AccentColor;

  // Selected state
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(() => {
    return roadmaps.length > 0 ? roadmaps[0].id : '';
  });

  // Modal open states
  const [isAddRoadmapOpen, setIsAddRoadmapOpen] = useState(false);
  const [isEditRoadmapOpen, setIsEditRoadmapOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);

  // Form states
  const [newRmTitle, setNewRmTitle] = useState('');
  const [newRmDesc, setNewRmDesc] = useState('');
  const [newRmIcon, setNewRmIcon] = useState('Brain');

  const [editRmTitle, setEditRmTitle] = useState('');
  const [editRmDesc, setEditRmDesc] = useState('');

  const [newMsTitle, setNewMsTitle] = useState('');
  const [newMsWeek, setNewMsWeek] = useState('');

  // Inline inputs for adding topics
  const [newTopicNames, setNewTopicNames] = useState<{ [milestoneId: string]: string }>({});

  // Active roadmap helper
  const activeRoadmap = roadmaps.find(r => r.id === selectedRoadmapId) || roadmaps[0];

  // If active roadmap is undefined (e.g. all deleted), fall back
  React.useEffect(() => {
    if (roadmaps.length > 0 && (!selectedRoadmapId || !roadmaps.some(r => r.id === selectedRoadmapId))) {
      setSelectedRoadmapId(roadmaps[0].id);
    }
  }, [roadmaps, selectedRoadmapId]);

  // Dynamic Lucide Icon Mapper
  const renderRoadmapIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Brain':
        return <Brain className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Code2':
        return <Code2 className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  // Helper calculation for roadmap completion
  const getRoadmapProgress = (rm: Roadmap) => {
    let total = 0;
    let completed = 0;
    rm.milestones.forEach(ms => {
      ms.topics.forEach(t => {
        total++;
        if (t.completed) completed++;
      });
    });
    return {
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total
    };
  };

  // Milestone progress calculations
  const getMilestoneProgress = (ms: RoadmapMilestone) => {
    const total = ms.topics.length;
    const completed = ms.topics.filter(t => t.completed).length;
    return {
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total
    };
  };

  // Total dashboard roadmap statistics
  const totalTopicsCount = roadmaps.reduce((acc, rm) => {
    return acc + rm.milestones.reduce((mAcc, ms) => mAcc + ms.topics.length, 0);
  }, 0);

  const completedTopicsCount = roadmaps.reduce((acc, rm) => {
    return acc + rm.milestones.reduce((mAcc, ms) => mAcc + ms.topics.filter(t => t.completed).length, 0);
  }, 0);

  const overallProgressPercentage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // Actions handlers
  const handleAddRoadmapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRmTitle.trim()) return;
    addRoadmap(newRmTitle, newRmDesc, newRmIcon);
    setNewRmTitle('');
    setNewRmDesc('');
    setNewRmIcon('Brain');
    setIsAddRoadmapOpen(false);
    showToast('Learning path created successfully!', 'success');
  };

  const handleEditRoadmapOpen = () => {
    if (!activeRoadmap) return;
    setEditRmTitle(activeRoadmap.title);
    setEditRmDesc(activeRoadmap.description);
    setIsEditRoadmapOpen(true);
  };

  const handleEditRoadmapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoadmap || !editRmTitle.trim()) return;
    updateRoadmap(activeRoadmap.id, editRmTitle, editRmDesc);
    setIsEditRoadmapOpen(false);
    showToast('Learning path updated!', 'success');
  };

  const handleDeleteRoadmapClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this roadmap and all its milestones? This cannot be undone.')) {
      deleteRoadmap(id);
      showToast('Roadmap deleted.', 'info');
    }
  };

  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoadmap || !newMsTitle.trim() || !newMsWeek.trim()) return;
    addMilestone(activeRoadmap.id, newMsTitle, newMsWeek);
    setNewMsTitle('');
    setNewMsWeek('');
    setIsAddMilestoneOpen(false);
    showToast('Milestone added!', 'success');
  };

  const handleDeleteMilestoneClick = (msId: string) => {
    if (window.confirm('Remove this week milestone?')) {
      deleteMilestone(activeRoadmap.id, msId);
      showToast('Milestone removed.', 'info');
    }
  };

  const handleInlineAddTopic = (e: React.FormEvent, msId: string) => {
    e.preventDefault();
    const topicText = newTopicNames[msId];
    if (!activeRoadmap || !topicText || !topicText.trim()) return;
    
    addTopic(activeRoadmap.id, msId, topicText);
    setNewTopicNames(prev => ({ ...prev, [msId]: '' }));
    showToast('Topic added to milestone.', 'success');
  };

  const handleTopicToggle = (msId: string, topicId: string, currentlyCompleted: boolean) => {
    if (!activeRoadmap) return;
    toggleTopicCompleted(activeRoadmap.id, msId, topicId);
    
    // Celebratory confetti if completing a topic
    if (!currentlyCompleted) {
      // Check if this was the last item in that milestone
      const ms = activeRoadmap.milestones.find(m => m.id === msId);
      if (ms) {
        const remaining = ms.topics.filter(t => t.id !== topicId && !t.completed).length;
        if (remaining === 0) {
          confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#a78bfa', '#8b5cf6', '#c4b5fd', '#ffffff']
          });
          showToast(`🎉 Milestone "${ms.title}" completed!`, 'success');
        }
      }
    }
  };

  const handleScheduleTask = (topicName: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    addTask(
      `Study: ${topicName}`,
      'medium',
      'Study',
      todayStr,
      '14:00',
      `Sourced from learning roadmap: ${activeRoadmap?.title || ''}`
    );
    showToast('Added topic to your Today\'s Tasks checklist!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header Overview Stats */}
      <div className="relative overflow-hidden rounded-2xl border backdrop-blur-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className={`absolute -right-20 -top-20 w-60 h-60 rounded-full blur-3xl opacity-10 ${getAccentColor(accent, 'bg')}`} />
        
        <div className="space-y-2 max-w-xl z-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Compass className={getAccentColor(accent, 'text')} />
            <span>Learning Paths & Curriculum</span>
          </h2>
          <p className="text-sm text-zinc-550 max-w-lg leading-relaxed">
            Break down massive skill trees into weekly bite-sized topics. Check off completed items to visualize your consistency, and bridge goals into daily active tasks.
          </p>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="flex items-center gap-4 z-10 bg-zinc-50 border dark:bg-zinc-950/40 dark:border-zinc-800 px-5 py-3 rounded-2xl shrink-0">
          <div className="relative flex items-center justify-center w-14 h-14">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="23"
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="23"
                className={`transition-all duration-500 ease-out stroke-current ${getAccentColor(accent, 'text')}`}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={144.5}
                strokeDashoffset={144.5 - (144.5 * overallProgressPercentage) / 100}
              />
            </svg>
            <span className="absolute text-xs font-bold text-zinc-800 dark:text-zinc-100">{overallProgressPercentage}%</span>
          </div>
          <div>
            <div className="text-[10px] text-zinc-450 uppercase font-bold tracking-wider">Total Progress</div>
            <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
              {completedTopicsCount} / {totalTopicsCount} Topics
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Side: Roadmaps List (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4 bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">My Curriculum Paths</h3>
              <button
                onClick={() => setIsAddRoadmapOpen(true)}
                className={`p-1.5 rounded-lg border text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors`}
                title="Create Roadmap"
              >
                <Plus size={16} />
              </button>
            </div>

            {roadmaps.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-xl dark:border-zinc-800">
                No learning paths defined. Create one to begin!
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {roadmaps.map(rm => {
                  const isActive = rm.id === selectedRoadmapId;
                  const stats = getRoadmapProgress(rm);

                  return (
                    <div
                      key={rm.id}
                      onClick={() => setSelectedRoadmapId(rm.id)}
                      className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isActive
                          ? 'bg-zinc-50 border-zinc-300 dark:bg-zinc-900/80 dark:border-zinc-700 shadow-sm'
                          : 'bg-white border-zinc-200/85 hover:border-zinc-300 hover:bg-zinc-50/50 dark:bg-zinc-900/30 dark:border-zinc-800/80 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex gap-3">
                          <div className={`p-2.5 rounded-xl shrink-0 border ${
                            isActive
                              ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'text')} border-current/20`
                              : 'bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-950 dark:border-zinc-800'
                          }`}>
                            {renderRoadmapIcon(rm.icon, 'w-4 h-4')}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                              {rm.title}
                            </h4>
                            <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 leading-normal">
                              {rm.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoadmapClick(rm.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-all shrink-0"
                          title="Delete Roadmap"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono font-medium">
                          <span>Progress</span>
                          <span>{stats.percentage}% ({stats.completed}/{stats.total})</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getAccentColor(accent, 'bg')}`}
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline Steps View (3 Columns) */}
        <div className="lg:col-span-3">
          {activeRoadmap ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6 bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40 relative">
              
              {/* Timeline Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-850 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                    {renderRoadmapIcon(activeRoadmap.icon, 'w-3.5 h-3.5')}
                    <span>Active Roadmap Timeline</span>
                  </span>
                  <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-150">
                    {activeRoadmap.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditRoadmapOpen}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-[10px] font-bold text-zinc-500 hover:text-zinc-850 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:text-zinc-200 transition-colors"
                  >
                    <Edit2 size={11} />
                    <span>Edit Title</span>
                  </button>

                  <button
                    onClick={() => setIsAddMilestoneOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 text-[10px] font-bold hover:opacity-90 transition-opacity`}
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    <span>Add Week</span>
                  </button>
                </div>
              </div>

              {/* Vertical Step Timeline Container */}
              {activeRoadmap.milestones.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-zinc-400">
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No Milestones Yet</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Add a week milestone (e.g. "Week 1: Calculus") to populate this roadmap!</p>
                  </div>
                </div>
              ) : (
                <div className="relative pl-7 space-y-8 select-none">
                  {/* The visual line connecting the milestones */}
                  <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-zinc-200 dark:bg-zinc-850 z-0" />

                  {activeRoadmap.milestones.map((ms, index) => {
                    const stats = getMilestoneProgress(ms);
                    const isCompleted = stats.percentage === 100 && stats.total > 0;
                    
                    return (
                      <div key={ms.id} className="relative group/ms">
                        
                        {/* Bullet circle indicator */}
                        <div
                          className={`absolute -left-[27px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10 transition-all ${
                            isCompleted
                              ? `${getAccentColor(accent, 'bg')} border-transparent text-zinc-950 scale-110 shadow-sm`
                              : 'bg-white border-zinc-300 text-zinc-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-450'
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Milestone Card */}
                        <div className="glass-panel p-5 rounded-2xl bg-zinc-50/50 border-zinc-200 dark:bg-zinc-950/20 dark:border-zinc-850/80 space-y-4">
                          
                          {/* Card Header details */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className={`text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'text')}`
                                  : 'bg-zinc-250/10 text-zinc-450 bg-zinc-100 dark:bg-zinc-900/50'
                              }`}>
                                {ms.targetWeek}
                              </span>
                              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-snug pt-1">
                                {ms.title}
                              </h4>
                            </div>

                            {/* Options */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-medium text-zinc-500">
                                {stats.percentage}% done
                              </span>
                              <button
                                onClick={() => handleDeleteMilestoneClick(ms.id)}
                                className="opacity-0 group-hover/ms:opacity-100 p-1 rounded-lg text-zinc-450 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                                title="Remove Milestone"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Topics List checklist */}
                          <div className="space-y-2">
                            {ms.topics.length === 0 ? (
                              <div className="text-[10px] text-zinc-400 italic py-2">
                                No topics listed. Add one below!
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {ms.topics.map(topic => (
                                  <div
                                    key={topic.id}
                                    className="group/topic flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-transparent hover:border-zinc-200/55 hover:bg-white dark:hover:bg-zinc-950 dark:hover:border-zinc-850/60 transition-all duration-150"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <button
                                        type="button"
                                        onClick={() => handleTopicToggle(ms.id, topic.id, topic.completed)}
                                        className={`custom-checkbox text-transparent shrink-0 ${
                                          topic.completed
                                            ? `${getAccentColor(accent, 'bg')} border-transparent text-zinc-950`
                                            : 'hover:border-zinc-500 text-transparent'
                                        }`}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </button>
                                      <span className={`text-xs font-medium truncate ${
                                        topic.completed
                                          ? 'line-through text-zinc-400 font-normal'
                                          : 'text-zinc-700 dark:text-zinc-250'
                                      }`}>
                                        {topic.name}
                                      </span>
                                    </div>

                                    {/* Action buttons on hover */}
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover/topic:opacity-100 transition-all shrink-0">
                                      {/* Quick task creation */}
                                      <button
                                        onClick={() => handleScheduleTask(topic.name)}
                                        className="p-1 rounded-lg text-zinc-450 hover:text-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                        title="Schedule for Today"
                                      >
                                        <CalendarCheck2 size={12} />
                                      </button>
                                      {/* Delete topic */}
                                      <button
                                        onClick={() => deleteTopic(activeRoadmap.id, ms.id, topic.id)}
                                        className="p-1 rounded-lg text-zinc-450 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                        title="Delete topic"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Add Topic Inline Input */}
                          <form onSubmit={(e) => handleInlineAddTopic(e, ms.id)} className="flex items-center gap-2 pt-2 border-t border-zinc-250/20 border-dashed">
                            <input
                              type="text"
                              placeholder="Add topic (e.g. Backpropagation, Sharpe ratio)"
                              value={newTopicNames[ms.id] || ''}
                              onChange={(e) => setNewTopicNames(prev => ({ ...prev, [ms.id]: e.target.value }))}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 placeholder-zinc-450 text-[11px] focus:outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                            />
                            <button
                              type="submit"
                              className={`px-3 py-1.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 text-[10px]`}
                            >
                              Add Topic
                            </button>
                          </form>
                          
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-16 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40 min-h-[300px]">
              <Compass size={40} className="text-zinc-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Learning Path Selected</h4>
                <p className="text-xs text-zinc-500 mt-1">Select an existing roadmap on the left side or create a new custom path to start.</p>
              </div>
            </div>
          )}
        </div>
        
      </div>

      {/* 3. MODALS */}

      {/* Add Roadmap Modal */}
      <Modal
        isOpen={isAddRoadmapOpen}
        onClose={() => setIsAddRoadmapOpen(false)}
        title="Create New Learning Path"
      >
        <form onSubmit={handleAddRoadmapSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Roadmap Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Data Structures & Algorithms, React Native"
              value={newRmTitle}
              onChange={(e) => setNewRmTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Description</label>
            <textarea
              rows={2}
              placeholder="What skills or outcomes does this cover?"
              value={newRmDesc}
              onChange={(e) => setNewRmDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 resize-none bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Icon Selection</label>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { name: 'Brain', icon: Brain, label: 'ML / AI' },
                { name: 'TrendingUp', icon: TrendingUp, label: 'Quants' },
                { name: 'Code2', icon: Code2, label: 'Code' },
                { name: 'Compass', icon: Compass, label: 'Other' }
              ].map(opt => {
                const IconComp = opt.icon;
                const isSel = newRmIcon === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setNewRmIcon(opt.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSel
                        ? `${getAccentColor(accent, 'bg-tint')} border-current/25 ${getAccentColor(accent, 'text')}`
                        : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <IconComp size={18} />
                    <span className="text-[9px] font-bold mt-1 tracking-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all text-xs`}
          >
            Create Learning Path
          </button>
        </form>
      </Modal>

      {/* Edit Roadmap Title/Description Modal */}
      <Modal
        isOpen={isEditRoadmapOpen}
        onClose={() => setIsEditRoadmapOpen(false)}
        title="Edit Learning Path Details"
      >
        <form onSubmit={handleEditRoadmapSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Roadmap Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Machine Learning"
              value={editRmTitle}
              onChange={(e) => setEditRmTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Description</label>
            <textarea
              rows={3}
              placeholder="Describe this curriculum..."
              value={editRmDesc}
              onChange={(e) => setEditRmDesc(e.target.value)}
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

      {/* Add Milestone Week Modal */}
      <Modal
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
        title={`Add Week Milestone to ${activeRoadmap?.title || ''}`}
      >
        <form onSubmit={handleAddMilestoneSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Week / Tag Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Week 5, Block A"
                value={newMsWeek}
                onChange={(e) => setNewMsWeek(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Milestone Topic/Goal</label>
              <input
                type="text"
                required
                placeholder="e.g. Neural Networks, Calculus"
                value={newMsTitle}
                onChange={(e) => setNewMsTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all text-xs`}
          >
            Add Milestone
          </button>
        </form>
      </Modal>
    </div>
  );
};
