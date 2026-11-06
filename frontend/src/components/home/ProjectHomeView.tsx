import React, { useState, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';

export interface LocalProjectSummary {
  id: string;
  name: string;
  lastModified: string;
  spriteCount: number;
  templateType?: string;
}

export interface ProjectHomeViewProps {
  onCreateFromPrompt: () => void;
  onOpenTemplates: () => void;
  onOpenBlankEditor: () => void;
  onOpenProject?: (projectId: string) => void;
}

export const ProjectHomeView: React.FC<ProjectHomeViewProps> = ({
  onCreateFromPrompt,
  onOpenTemplates,
  onOpenBlankEditor,
  onOpenProject,
}) => {
  const { locale } = useI18n();
  const isEn = locale === 'en';
  const [projects, setProjects] = useState<LocalProjectSummary[]>([]);

  useEffect(() => {
    // In MVP, load saved projects list from localStorage / IndexedDB index
    try {
      const stored = localStorage.getItem('ardena_saved_projects_meta');
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    try {
      localStorage.setItem('ardena_saved_projects_meta', JSON.stringify(updated));
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
      {/* Studio Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-[#006194] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-10 border border-blue-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4 border border-white/20">
            <span>✨</span>
            <span>
              {isEn
                ? 'Creative Studio • Scratch 3.0 & AI Copilot'
                : 'Studio Kreatif Mandiri • Scratch 3.0 & AI Copilot'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            {isEn ? 'Welcome to Ardena Studio!' : 'Selamat Datang di Studio Ardena!'}
          </h1>
          <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed mb-6">
            {isEn
              ? 'Unleash your visual imagination. Choose a starting path below or resume projects saved locally in your browser.'
              : 'Kembangkan imajinasi visualmu. Pilih cara memulai di bawah ini atau lanjutkan game yang pernah kamu simpan secara lokal di browsermu.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateFromPrompt}
              className="px-6 py-3 rounded-xl bg-white text-[#006194] text-sm font-extrabold shadow-md hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              <span>{isEn ? '✨ Create Game from New Idea' : '✨ Buat Game dari Ide Baru'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenTemplates}
              className="px-6 py-3 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white text-sm font-bold border border-white/20 transition-all flex items-center gap-2"
            >
              <span>{isEn ? '🎮 Open Official Templates' : '🎮 Buka Template Resmi'}</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute -bottom-10 -right-10 text-9xl opacity-20 pointer-events-none select-none">
          🚀
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚡</span>
          <span>{isEn ? 'Quick Project Starters' : 'Aksi Cepat Pembuatan Proyek'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            onClick={onCreateFromPrompt}
            className="flex flex-col p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-2xl flex items-center justify-center mb-4 text-[#006194]">
              💬
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {isEn ? 'AI Copilot Natural Idea' : 'Ide Alami AI Copilot'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              {isEn
                ? 'Describe game scenarios in your own words. The AI generates Scratch block logic instantly.'
                : 'Jelaskan skenario game dengan bahasamu sendiri. AI akan merancang logika balok Scratch seketika.'}
            </p>
            <span className="text-xs font-bold text-[#006194] mt-auto flex items-center gap-1">
              {isEn ? 'Start with Prompt →' : 'Mulai dengan Prompt →'}
            </span>
          </div>

          {/* Card 2 */}
          <div
            onClick={onOpenTemplates}
            className="flex flex-col p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-amber-300 cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-2xl flex items-center justify-center mb-4 text-amber-600">
              🕹️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {isEn ? 'Verified Templates' : 'Template Teruji'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              {isEn
                ? 'Use mechanically balanced game blueprints (Catching, Maze, Space) ready to customize.'
                : 'Gunakan fondasi game siap pakai (Catching, Maze, Space) yang sudah terkalibrasi secara mekanis.'}
            </p>
            <span className="text-xs font-bold text-amber-700 mt-auto flex items-center gap-1">
              {isEn ? 'Choose Template →' : 'Pilih Template →'}
            </span>
          </div>

          {/* Card 3 */}
          <div
            onClick={onOpenBlankEditor}
            className="flex flex-col p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-400 cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-2xl flex items-center justify-center mb-4 text-gray-700">
              🎨
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {isEn ? 'Blank Scratch Editor' : 'Editor Scratch Kosong'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              {isEn
                ? 'Start from an authentic Scratch 3.0 blank canvas without AI for independent experimentation.'
                : 'Mulai dari kanvas murni Scratch 3.0 tanpa bantuan AI untuk kebebasan eksperimen mandiri.'}
            </p>
            <span className="text-xs font-bold text-gray-800 mt-auto flex items-center gap-1">
              {isEn ? 'Open Blank Canvas →' : 'Buka Kanvas Murni →'}
            </span>
          </div>
        </div>
      </div>

      {/* Local Projects Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📁</span>
            <span>{isEn ? 'Saved Local Games (IndexedDB)' : 'Game Lokal Tersimpan (IndexedDB)'}</span>
          </h2>
          <span className="text-xs text-gray-500 font-semibold">
            {isEn ? 'Auto-saved in this browser' : 'Tersimpan Otomatis di Browser Ini'}
          </span>
        </div>

        {projects.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-3xl flex items-center justify-center mb-4 text-blue-500">
              📂
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {isEn ? 'No Saved Games Yet' : 'Belum Ada Game yang Disimpan'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
              {isEn
                ? 'All projects you create and save will appear here locally without needing a user account.'
                : 'Semua proyek yang kamu buat dan simpan akan muncul di sini secara lokal tanpa memerlukan akun pengguna.'}
            </p>
            <button
              type="button"
              onClick={onCreateFromPrompt}
              className="px-5 py-2.5 rounded-xl bg-[#006194] text-white text-xs font-bold shadow-md hover:bg-[#007bb9] transition-all"
            >
              <span>{isEn ? '🚀 Create Your First Game Now' : '🚀 Buat Game Pertamamu Sekarang'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenProject?.(proj.id)}
                className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-xl flex items-center justify-center text-[#006194]">
                    🎮
                  </div>
                  <button
                    type="button"
                    aria-label={`Hapus ${proj.name}`}
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1 truncate">
                  {proj.name}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                  <span>{proj.spriteCount} Sprite</span>
                  <span>{isEn ? 'Modified: ' : 'Diubah: '}{proj.lastModified}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
