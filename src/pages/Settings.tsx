import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { showToast } from '../components/ui/Toast';
import { 
  Settings as SettingsIcon,
  Sun,
  Moon,
  Download,
  Upload,
  RotateCcw,
  Palette,
  AlertTriangle,
  Cloud
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    resetToFactory,
    supabaseUrl,
    supabaseKey,
    syncCode,
    syncEnabled,
    lastSyncedAt,
    updateSyncConfig,
    triggerPull
  } = useDashboard();

  const accent = settings.accentColor as AccentColor;

  // Local state for raw JSON upload
  const [importJson, setImportJson] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Supabase sync form inputs
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseKey);
  const [inputCode, setInputCode] = useState(syncCode);
  const [inputEnabled, setInputEnabled] = useState(syncEnabled);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveConfig = () => {
    updateSyncConfig(inputUrl, inputKey, inputCode, inputEnabled);
    showToast('Sync settings saved locally!', 'success');
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    showToast('Syncing with Supabase...', 'info');
    
    // Run pull (it will push if no remote data, otherwise pull remote changes)
    const success = await triggerPull();
    if (success) {
      showToast('Cloud database sync complete!', 'success');
    } else {
      showToast('Sync failed. Please verify your keys and table.', 'error');
    }
    setIsSyncing(false);
  };

  const colorsList: { name: AccentColor; label: string; bgClass: string }[] = [
    { name: 'green', label: 'GitHub Green', bgClass: 'bg-emerald-500' },
    { name: 'blue', label: 'Sapphire Blue', bgClass: 'bg-blue-500' },
    { name: 'purple', label: 'Aether Purple', bgClass: 'bg-violet-500' },
    { name: 'rose', label: 'Ruby Rose', bgClass: 'bg-rose-500' },
    { name: 'amber', label: 'Amber Gold', bgClass: 'bg-amber-500' },
  ];

  const handleExport = () => {
    try {
      const dataStr = exportData();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `dev_os_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showToast('Data exported successfully!', 'success');
    } catch (e) {
      showToast('Failed to export backup.', 'error');
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    const success = importData(importJson);
    if (success) {
      setImportJson('');
      showToast('Backup restored successfully!', 'success');
    } else {
      showToast('Invalid backup JSON format.', 'error');
    }
  };

  const handleFactoryReset = () => {
    resetToFactory();
    setIsResetConfirmOpen(false);
    showToast('Dashboard reset to factory settings!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <SettingsIcon size={20} className={getAccentColor(accent, 'text')} />
          <span>Dashboard Settings</span>
        </h2>
        <p className="text-xs text-zinc-500">Configure theme preferences, adjust streaks, and manage data backups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Preferences & Accent colors (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme & Palette */}
          <div className="glass-panel p-5 rounded-2xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Palette size={14} className={getAccentColor(accent, 'text')} />
              <span>Theme & Styling Preferences</span>
            </h3>

            {/* Dark/Light mode */}
            <div className="flex items-center justify-between text-xs py-1.5 border-zinc-100 dark:border-zinc-800/60">
              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 block">Appearance Mode</span>
                <span className="text-[10px] text-slate-550 dark:text-zinc-500">Toggle between Dark Mode and Light Mode</span>
              </div>
              <button
                onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-zinc-400 hover:text-zinc-200 text-xs bg-zinc-50 border-zinc-200 dark:border-zinc-800"
              >
                {settings.theme === 'dark' ? (
                  <>
                    <Sun size={12} className="text-yellow-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={12} />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Accent Color picker */}
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-xs block">Active Accent Color</span>
                <span className="text-[10px] text-zinc-500">Changes the primary focus color across cards, text, and rings</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {colorsList.map(c => {
                  const isActive = settings.accentColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => updateSettings({ accentColor: c.name })}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                        isActive
                          ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'border')}`
                          : 'bg-zinc-950/30 border-zinc-800 hover:bg-zinc-900/50 dark:bg-zinc-950/30 dark:border-zinc-800 light:bg-zinc-50 light:border-zinc-200'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${c.bgClass}`} />
                      <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 truncate">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heatmap Intensity Picker */}
            <div className="space-y-3 py-1.5 border-zinc-100 dark:border-zinc-800/60">
              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-xs block">Heatmap Intensity Scale</span>
                <span className="text-[10px] text-zinc-500">Customize target density scale factor (future update)</span>
              </div>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(intensity => {
                  const isSel = settings.heatmapIntensity === intensity;
                  return (
                    <button
                      key={intensity}
                      onClick={() => updateSettings({ heatmapIntensity: intensity })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                        isSel
                          ? `${getAccentColor(accent, 'bg-tint')} ${getAccentColor(accent, 'border')} ${getAccentColor(accent, 'text')}`
                          : 'bg-zinc-950/30 border-zinc-800 text-zinc-400 dark:bg-zinc-950/30 dark:border-zinc-800 light:bg-zinc-50 light:border-zinc-200'
                      }`}
                    >
                      {intensity}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Backup & Import data */}
          <div className="glass-panel p-5 rounded-2xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Download size={14} className={getAccentColor(accent, 'text')} />
              <span>Data Portability (Export & Import)</span>
            </h3>

            {/* Export */}
            <div className="flex items-center justify-between text-xs py-1 border-zinc-100 dark:border-zinc-800/60">
              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 block">Download Backup File</span>
                <span className="text-[10px] text-slate-550 dark:text-zinc-500">Download your tasks, logs, and notes to a local JSON file</span>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-zinc-400 hover:text-zinc-200 text-xs bg-zinc-50 border-zinc-200 dark:border-zinc-800"
              >
                <Download size={12} />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Import form */}
            <form onSubmit={handleImport} className="space-y-3 pt-1">
              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-xs block">Restore Backup</span>
                <span className="text-[10px] text-zinc-500">Paste backup JSON contents below and click Restore</span>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Paste JSON content here..."
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border focus:outline-none focus:border-slate-750 bg-white border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
                />
                
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-95 transition-all text-xs flex items-center gap-1 shrink-0`}
                >
                  <Upload size={12} />
                  <span>Restore</span>
                </button>
              </div>
            </form>
          </div>

          {/* Cloud Sync (Supabase) */}
          <div className="glass-panel p-5 rounded-2xl space-y-5 bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud size={14} className={getAccentColor(accent, 'text')} />
                <span>Cloud Synchronization (Supabase)</span>
              </div>
              {syncEnabled && (
                <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-550 px-1.5 py-0.5 rounded-full font-bold uppercase dark:text-emerald-400">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                  Active
                </span>
              )}
            </h3>

            <div className="space-y-4">
              <div className="p-3 text-[10px] text-zinc-550 bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-950/40 dark:border-zinc-800 rounded-xl leading-relaxed">
                🧑‍💻 <strong>Privacy First:</strong> Your database keys stay inside your own browser and are never sent to external servers. To link devices (e.g. laptop and phone), enter the exact same Supabase details and <strong>Sync Code</strong> on both!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Supabase URL</label>
                  <input
                    type="text"
                    placeholder="https://xyz.supabase.co"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-750"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Anon API Key</label>
                  <input
                    type="password"
                    placeholder="Paste anon key..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-750"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Sync Code (Device Link Password)</label>
                  <input
                    type="text"
                    placeholder="e.g. my-private-sync-123"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-750"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5 col-span-1">
                  <input
                    id="enable-sync-toggle"
                    type="checkbox"
                    checked={inputEnabled}
                    onChange={(e) => setInputEnabled(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded border-zinc-850 bg-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  <label htmlFor="enable-sync-toggle" className="text-xs text-zinc-650 dark:text-zinc-400 font-semibold cursor-pointer select-none">
                    Enable Automatic Sync
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="text-[10px] text-zinc-550">
                  {lastSyncedAt ? (
                    <span>Last Synced: <strong className="text-zinc-750 dark:text-zinc-300">{lastSyncedAt}</strong></span>
                  ) : (
                    <span>Cloud sync not configured yet.</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-3.5 py-1.5 rounded-xl border text-xs font-bold bg-zinc-50 border-zinc-200 text-zinc-750 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-350 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  >
                    Save Config
                  </button>

                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleSyncNow}
                    className={`px-4 py-1.5 rounded-xl ${getAccentColor(accent, 'bg')} text-zinc-950 font-bold hover:opacity-90 active:scale-95 transition-all text-xs flex items-center gap-1 shrink-0 ${
                      isSyncing ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Critical Actions / Factory resets (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.01] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>Danger Zone</span>
          </h3>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            This workspace operates completely client-side in your local storage. Performing a factory reset will permanently erase all custom logged tasks, daily milestones, study logs, LeetCode notes, and streaks.
          </p>

          {isResetConfirmOpen ? (
            <div className="space-y-2.5 pt-2">
              <p className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider">Are you absolutely sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleFactoryReset}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs active:scale-95 transition-all"
                >
                  Yes, Erase
                </button>
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200 text-xs dark:border-zinc-800 dark:bg-zinc-950/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Reset Factory Defaults</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
