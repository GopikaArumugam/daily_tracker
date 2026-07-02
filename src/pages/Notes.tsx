import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { showToast } from '../components/ui/Toast';
import { 
  BookOpen, 
  Plus, 
  Search,
  Pin,
  Edit3,
  Eye,
  FileText,
  HelpCircle
} from 'lucide-react';

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, togglePinNote, deleteNote, settings } = useDashboard();
  const accent = settings.accentColor as AccentColor;

  // Selected note ID
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Editor states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Auto select first note on load if notes exist
  useEffect(() => {
    if (notes.length > 0 && selectedNoteId === null) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  const activeNote = notes.find(n => n.id === selectedNoteId) || null;

  // Sync editor fields when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setIsEditMode(false);
    } else {
      setEditTitle('');
      setEditContent('');
    }
  }, [activeNote]);

  const handleCreateNew = () => {
    const defaultTitle = 'Untitled Note';
    const defaultContent = '# Untitled Note\n\nWrite down some details...';
    
    // Add note
    addNote(defaultTitle, defaultContent);
    // Find the newly added note id (since it is placed at index 0)
    // Wait, state update is batch-processed, so we set to null first
    setSelectedNoteId(null);
    setIsEditMode(true);
    showToast('Created new note!', 'success');
  };

  const handleSave = () => {
    if (!selectedNoteId) return;
    if (!editTitle.trim()) {
      showToast('Note title cannot be empty!', 'error');
      return;
    }

    updateNote(selectedNoteId, editTitle, editContent);
    setIsEditMode(false);
    showToast('Note saved.', 'success');
  };

  const handleDelete = () => {
    if (!selectedNoteId) return;
    deleteNote(selectedNoteId);
    setSelectedNoteId(null);
    showToast('Note deleted.', 'error');
  };

  const handlePinToggle = () => {
    if (!selectedNoteId) return;
    togglePinNote(selectedNoteId);
    showToast(activeNote?.pinned ? 'Note unpinned.' : 'Note pinned to top!', 'info');
  };

  // Simple custom Markdown parser
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return { __html: '' };
    
    // Safety escape HTML tags
    let escaped = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    let html = escaped
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold border-b border-zinc-800 pb-2 mb-4 text-zinc-100">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-zinc-200 mt-4 mb-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold text-zinc-300 mt-3 mb-1">$1</h3>')
      // Bullet points
      .replace(/^\- (.*$)/gim, '<li class="list-disc pl-4 ml-2 text-slate-355 leading-relaxed text-zinc-300">$1</li>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-zinc-100">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Code blocks (matches ```code```)
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-zinc-950 p-3 rounded-lg font-mono text-xs my-3 overflow-x-auto border border-zinc-800 text-emerald-400">$1</pre>')
      // Inline code
      .replace(/`(.*?)`/gim, '<code class="bg-zinc-950 px-1 py-0.5 rounded text-[11px] font-mono text-emerald-400">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br />');

    return { __html: html };
  };

  // Filter notes and sort (pinned notes first, then chronological)
  const filteredNotes = notes
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen size={20} className={getAccentColor(accent, 'text')} />
            <span>Developer Notepad</span>
          </h2>
          <p className="text-xs text-zinc-500">Log scratch ideas, draft systems specs, and organize notes in Markdown</p>
        </div>

        <button
          onClick={handleCreateNew}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${getAccentColor(accent, 'bg')} text-zinc-950 hover:scale-105 active:scale-95 duration-150 transition-all shadow-md shadow-emerald-500/5`}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Notepad Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[550px] items-stretch">
        {/* Left Sidebar: Notes list (1 col) */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 h-full">
          {/* Notes Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Find notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border placeholder-zinc-500 focus:outline-none focus:border-zinc-700 bg-zinc-100 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40"
            />
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredNotes.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 italic">
                {searchQuery ? "No notes match search." : "No notes yet. Click 'New Note'!"}
              </div>
            ) : (
              filteredNotes.map(n => (
                <button
                  key={n.id}
                  id={`note-card-${n.id}`}
                  onClick={() => setSelectedNoteId(n.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                    selectedNoteId === n.id
                      ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'border')}`
                      : 'bg-zinc-950/10 border-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/10 hover:bg-zinc-900/50 light:bg-zinc-50 light:border-zinc-200'
                  }`}
                >
                  <FileText size={14} className="mt-0.5 text-zinc-500 shrink-0" />
                  
                  <div className="flex-1 min-w-0 pr-1.5">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-none">
                        {n.title}
                      </span>
                      {n.pinned && (
                        <Pin size={10} className={`${getAccentColor(accent, 'text')} shrink-0 rotate-[45deg]`} fill="currentColor" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">{n.date}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Note Editor Workspace (2 cols) */}
        <div className="md:col-span-2 glass-panel p-5 rounded-2xl flex flex-col justify-between h-full overflow-hidden">
          {activeNote === null ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <BookOpen size={36} className="text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Note Selected</h3>
              <p className="text-xs text-zinc-500 mt-1">Select a note from the left sidebar or create a new one.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Workspace Header toolbar */}
              <div className="flex items-center justify-between pb-3 mb-4 shrink-0 border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePinToggle}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      activeNote.pinned 
                        ? `${getAccentColor(accent, 'bg-tint')} border-emerald-500/20 ${getAccentColor(accent, 'text')}` 
                        : 'bg-zinc-950/20 border-zinc-800 text-zinc-500 dark:border-zinc-800 light:bg-zinc-50 light:border-zinc-200'
                    }`}
                    title={activeNote.pinned ? 'Unpin note' : 'Pin note to top'}
                  >
                    <Pin size={13} className={activeNote.pinned ? 'rotate-[45deg]' : ''} />
                  </button>

                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-50 border-zinc-200 dark:border-zinc-800"
                  >
                    {isEditMode ? (
                      <>
                        <Eye size={12} />
                        <span>Preview Mode</span>
                      </>
                    ) : (
                      <>
                        <Edit3 size={12} />
                        <span>Edit Mode</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Save/Delete */}
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <button
                      onClick={handleSave}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getAccentColor(accent, 'bg')} text-zinc-950 hover:scale-105 active:scale-95 transition-all`}
                    >
                      Save
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg border hover:border-rose-500 hover:bg-rose-500/10 hover:text-rose-500 text-zinc-400 text-xs font-semibold transition-colors bg-zinc-50 border-zinc-200 dark:border-zinc-800"
                  >
                    Delete Note
                  </button>
                </div>
              </div>

              {/* Workspace Content body */}
              <div className="flex-1 overflow-y-auto pr-1">
                {isEditMode ? (
                  <div className="space-y-4 h-full flex flex-col">
                    {/* Edit Title */}
                    <input
                      type="text"
                      placeholder="Note Title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-transparent text-zinc-800 dark:text-zinc-100 text-lg font-bold border-none focus:outline-none focus:ring-0 p-0"
                    />

                    {/* Edit Content */}
                    <textarea
                      placeholder="Write your markdown contents here..."
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full flex-1 bg-transparent border-none text-zinc-700 dark:text-zinc-300 text-xs focus:outline-none focus:ring-0 resize-none font-mono leading-relaxed"
                    />

                    {/* Quick Cheat sheet footer inside edit pane */}
                    <div className="p-3 border rounded-xl text-[10px] text-zinc-500 flex items-start gap-2 shrink-0 bg-zinc-100 border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-800">
                      <HelpCircle size={14} className="mt-0.5 shrink-0 text-zinc-400" />
                      <div>
                        <span className="font-bold">Markdown Cheat Sheet:</span> # Title, - List item, **Bold**, `inline code`, ```code block```.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 prose dark:prose-invert max-w-none">
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                      {activeNote.title}
                    </h2>
                    
                    <div 
                      className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans"
                      dangerouslySetInnerHTML={renderMarkdown(activeNote.content)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
