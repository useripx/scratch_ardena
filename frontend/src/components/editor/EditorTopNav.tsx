import React, { useState } from 'react';
import { LanguageToggle } from '../common/LanguageToggle';

export interface EditorTopNavProps {
  projectName: string;
  onRenameProject: (newName: string) => void;
  onBackToHome: () => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onStop?: () => void;
  onSaveProject?: () => void;
  onExportSb3?: () => void;
  onOpenPreferences?: () => void;
  onOpenHelp?: () => void;
  creditsBalance?: number;
}

export const EditorTopNav: React.FC<EditorTopNavProps> = ({
  projectName,
  onRenameProject,
  onBackToHome,
  isCopilotOpen,
  onToggleCopilot,
  isPlaying = false,
  onTogglePlay,
  onStop,
  onSaveProject,
  onExportSb3,
  onOpenPreferences,
  onOpenHelp,
  creditsBalance,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(projectName);

  const handleBlur = () => {
    setIsEditingName(false);
    if (nameInput.trim()) {
      onRenameProject(nameInput.trim());
    } else {
      setNameInput(projectName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setNameInput(projectName);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full h-14 z-40 bg-[#ffffff] border-b border-gray-200 shadow-sm flex items-center justify-between px-4">
      {/* Left: Brand Wordmark & Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackToHome}
          title="Kembali ke Dashboard Studio"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span>←</span>
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        <div className="h-5 w-px bg-gray-200" />

        <div className="flex items-center gap-1.5 select-none">
          <span className="font-extrabold text-base tracking-tight text-[#006194]">
            ARDENA
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-[#006194] text-[10px] font-bold">
            Studio
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Project Title (Editable) */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              autoFocus
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="px-2 py-1 text-xs font-semibold text-gray-900 border border-blue-400 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
            />
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-1.5"
              title="Klik untuk ubah nama proyek"
            >
              <span className="truncate max-w-[200px]">{projectName}</span>
              <span className="text-[10px] text-gray-400">✏️</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Stage Play / Stop Controls */}
      <div className="flex items-center gap-2 bg-[#f2f4f6] px-3 py-1 rounded-full border border-gray-200">
        <button
          type="button"
          onClick={onTogglePlay}
          title="Mulai Game (Bendera Hijau)"
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-transform active:scale-90 ${
            isPlaying
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          🚩
        </button>
        <button
          type="button"
          onClick={onStop}
          title="Hentikan Game"
          className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs transition-transform active:scale-90"
        >
          🛑
        </button>
        <span className="text-[11px] font-semibold text-gray-500 ml-1 hidden sm:inline">
          {isPlaying ? 'Sedang Berjalan' : 'Siap'}
        </span>
      </div>

      {/* Right: Local Save Status & AI Copilot Toggle */}
      <div className="flex items-center gap-2">
        {onSaveProject && (
          <button
            type="button"
            onClick={onSaveProject}
            title="Simpan Proyek ke Browser"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f0f4f8] hover:bg-[#e1e9f0] text-[#006194] transition-colors"
          >
            <span>💾</span>
            <span className="hidden sm:inline">Simpan</span>
          </button>
        )}

        {onExportSb3 && (
          <button
            type="button"
            onClick={onExportSb3}
            title="Ekspor Proyek ke .sb3"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <span>📦</span>
            <span className="hidden sm:inline">Ekspor</span>
          </button>
        )}

        <LanguageToggle compact />

        {onOpenPreferences && (
          <button
            type="button"
            onClick={onOpenPreferences}
            title="Pengaturan Studio"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs transition-colors"
          >
            ⚙️
          </button>
        )}

        {onOpenHelp && (
          <button
            type="button"
            onClick={onOpenHelp}
            title="Panduan Balok & Bantuan"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-[#006194] text-xs font-bold transition-colors"
          >
            ❓
          </button>
        )}

        {/* Saved Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f4f6] text-[11px] font-medium text-gray-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tersimpan (IndexedDB)</span>
        </div>

        {/* Credit Balance Badge */}
        {creditsBalance !== undefined && (
          <div
            title="Saldo Kredit AI Agen (5.500 poin awal + 500 harian)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs select-none"
          >
            <span>🪙</span>
            <span>{creditsBalance.toLocaleString('id-ID')}</span>
            <span className="text-[10px] text-amber-700 font-semibold hidden md:inline">Poin</span>
          </div>
        )}

        {/* AI Copilot Toggle Button */}
        <button
          type="button"
          onClick={onToggleCopilot}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isCopilotOpen
              ? 'bg-[#006194] text-white shadow-md'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          <span>✨</span>
          <span>AI Copilot</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              isCopilotOpen ? 'bg-white/20 text-white' : 'bg-blue-400 text-gray-950 font-bold'
            }`}
          >
            {isCopilotOpen ? 'Buka' : 'Tutup'}
          </span>
        </button>
      </div>
    </header>
  );
};
