import React, { useState, useEffect, useMemo } from 'react';
import { StoredProject, ProjectCategory } from '../../types/game.types';
import { storageService } from '../../services/storage.service';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { ExportSb3Modal } from '../modals/ExportSb3Modal';

export interface LocalProjectLibraryProps {
  onOpenProject: (project: StoredProject) => void;
  onNewProject: () => void;
  onBack: () => void;
}

type SortOption = 'terbaru' | 'nama' | 'sprite';
type ViewMode = 'grid' | 'list';

export const LocalProjectLibrary: React.FC<LocalProjectLibraryProps> = ({
  onOpenProject,
  onNewProject,
  onBack,
}) => {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('terbaru');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modal states
  const [projectToDelete, setProjectToDelete] = useState<StoredProject | null>(null);
  const [projectToExport, setProjectToExport] = useState<StoredProject | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const items = await storageService.getProjects();
      setProjects(items);
    } catch (err) {
      console.error('[LocalProjectLibrary] Gagal memuat proyek:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDuplicate = async (project: StoredProject) => {
    try {
      await storageService.duplicateProject(project.id);
      await loadProjects();
    } catch (err) {
      console.error('[LocalProjectLibrary] Gagal menduplikasi proyek:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await storageService.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      await loadProjects();
    } catch (err) {
      console.error('[LocalProjectLibrary] Gagal menghapus proyek:', err);
    }
  };

  // Filter & Sort
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'terbaru') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === 'nama') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'sprite') {
          return (b.stats?.spriteCount || 0) - (a.stats?.spriteCount || 0);
        }
        return 0;
      });
  }, [projects, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Kembali"
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Pustaka Proyek Lokal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#006194] font-bold text-xs border border-blue-200">
                  IndexedDB
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Semua game tersimpan aman dan privat di dalam peramban perangkat Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#006194] hover:bg-[#004e77] text-white shadow-sm transition-all"
            >
              <span>+</span> Buat Proyek Baru
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Controls Bar: Category Pills + Search + Sort + View */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Semua Kategori', count: projects.length },
              { id: 'arcade', label: 'Arcade', count: projects.filter((p) => p.category === 'arcade').length },
              { id: 'puzzle', label: 'Puzzle', count: projects.filter((p) => p.category === 'puzzle').length },
              { id: 'shooter', label: 'Space Shooter', count: projects.filter((p) => p.category === 'shooter').length },
              { id: 'edukasi', label: 'Edukasi', count: projects.filter((p) => p.category === 'edukasi').length },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#006194] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Search, Sort & View Mode */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Cari nama atau tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#006194] focus:ring-1 focus:ring-[#006194]"
              />
              <span className="absolute left-2.5 top-2 text-xs text-gray-400">🔍</span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="terbaru">Terakhir Diubah (Terbaru)</option>
              <option value="nama">Nama (A - Z)</option>
              <option value="sprite">Jumlah Sprite Terbanyak</option>
            </select>

            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-[#006194]' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Tampilan Kisi"
              >
                ⊞
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-xs text-[#006194]' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Tampilan Daftar"
              >
                ≡
              </button>
            </div>
          </div>
        </div>

        {/* Project List / Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-gray-400">
            <span className="text-3xl animate-spin mb-2">⏳</span>
            <p className="text-xs font-medium">Memuat pustaka proyek...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-3xl flex items-center justify-center mb-4 text-[#006194]">
              🎨
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {projects.length === 0 ? 'Belum Ada Proyek Tersimpan' : 'Tidak Ada Proyek yang Cocok'}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {projects.length === 0
                ? 'Mulai buat game Scratch pertamamu bersama AI Copilot sekarang juga!'
                : 'Coba ubah kata kunci pencarian atau pilih kategori lain.'}
            </p>
            <button
              type="button"
              onClick={onNewProject}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#006194] text-white hover:bg-[#004e77] transition-all shadow-sm"
            >
              + Mulai Buat Proyek Baru
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-200 hover:border-[#006194]/40 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
              >
                <div>
                  {/* Card Thumbnail Area */}
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 border border-gray-100 flex items-center justify-center relative overflow-hidden mb-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {p.category === 'shooter' ? '🚀' : p.category === 'puzzle' ? '🧩' : '🐱'}
                    </span>
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-white/90 text-gray-600 text-[10px] font-bold shadow-xs">
                      .SB3
                    </span>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#006194] text-white text-[10px] font-bold">
                      {p.category.toUpperCase()}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <h3 className="text-sm font-bold text-gray-900 truncate mb-1" title={p.title}>
                    {p.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3 pt-2 border-t border-gray-100">
                    <span>👾 {p.stats?.spriteCount || 0} Sprite</span>
                    <span>🧩 {p.stats?.blockCount || 0} Balok</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => onOpenProject(p)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#006194] hover:bg-[#004e77] text-white transition-colors text-center"
                  >
                    Buka
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToExport(p)}
                    title="Ekspor .sb3"
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs transition-colors"
                  >
                    📦
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(p)}
                    title="Duplikasi Proyek"
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs transition-colors"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(p)}
                    title="Hapus Proyek"
                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View Mode */
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-xs">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
                    {p.category === 'shooter' ? '🚀' : p.category === 'puzzle' ? '🧩' : '🐱'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{p.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="font-semibold text-[#006194]">{p.category}</span>
                      <span>•</span>
                      <span>{p.stats?.spriteCount || 0} Sprite</span>
                      <span>•</span>
                      <span>Diperbarui: {new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenProject(p)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#006194] text-white hover:bg-[#004e77] transition-colors"
                  >
                    Buka Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToExport(p)}
                    title="Ekspor .sb3"
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs text-gray-600"
                  >
                    📦
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(p)}
                    title="Duplikasi"
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs text-gray-600"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(p)}
                    title="Hapus"
                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal: Delete */}
      <ConfirmationModal
        isOpen={!!projectToDelete}
        title="Hapus Proyek dari Penyimpanan Browser?"
        message={`Apakah Anda yakin ingin menghapus proyek "${projectToDelete?.title}" secara permanen? Data yang telah dihapus tidak dapat dipulihkan.`}
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        isDestructive={true}
        badgeText="Hapus Proyek"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProjectToDelete(null)}
      />

      {/* Export Modal */}
      <ExportSb3Modal
        isOpen={!!projectToExport}
        project={projectToExport}
        onClose={() => setProjectToExport(null)}
      />
    </div>
  );
};

