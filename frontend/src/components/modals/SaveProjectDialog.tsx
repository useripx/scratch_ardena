import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ProjectCategory, ProjectStats } from '../../types/game.types';

export interface SaveProjectDialogProps {
  isOpen: boolean;
  initialTitle?: string;
  initialCategory?: ProjectCategory;
  initialTags?: string[];
  stats?: ProjectStats;
  onSave: (data: { title: string; category: ProjectCategory; tags: string[] }) => Promise<void> | void;
  onClose: () => void;
}

const CATEGORIES: { key: ProjectCategory; label: string; icon: string }[] = [
  { key: 'arcade', label: 'Arcade / Catching', icon: '🎮' },
  { key: 'puzzle', label: 'Labirin & Puzzle', icon: '🧩' },
  { key: 'shooter', label: 'Space Shooter', icon: '🚀' },
  { key: 'edukasi', label: 'Edukasi & Cerita', icon: '📚' },
  { key: 'lainnya', label: 'Lainnya', icon: '✨' },
];

const AVAILABLE_TAGS = ['AI-Generated', 'Kucing', 'Luar Angkasa', 'Pemula', 'Edukasi', 'Animasi'];

const DEFAULT_INITIAL_TAGS = ['AI-Generated'];

export const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({
  isOpen,
  initialTitle = 'Proyek Game Ardena',
  initialCategory = 'arcade',
  initialTags = DEFAULT_INITIAL_TAGS,
  stats,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<ProjectCategory>(initialCategory);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setCategory(initialCategory);
      setTags(initialTags || DEFAULT_INITIAL_TAGS);
      setErrorMsg(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg('Nama proyek tidak boleh kosong.');
      return;
    }
    if (cleanTitle.length > 60) {
      setErrorMsg('Nama proyek maksimal 60 karakter.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);
      await onSave({ title: cleanTitle, category, tags });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan proyek ke penyimpanan lokal.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simpan Proyek ke Browser" maxWidth="max-w-xl">
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Subtitle & Offline Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
            Proyek disimpan langsung secara lokal di peramban ini. Sepenuhnya privat tanpa server atau akun luar.
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            <span>●</span> IndexedDB Client
          </span>
        </div>

        {/* Input Nama Proyek */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="save-project-title" className="font-bold text-gray-800">
              Nama Proyek <span className="text-red-500">*</span>
            </label>
            <span className={`text-[11px] ${title.length > 50 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
              {title.length} / 60
            </span>
          </div>
          <input
            id="save-project-title"
            type="text"
            maxLength={60}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Masukkan judul proyek Anda..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/20 outline-none transition-all"
            autoFocus
          />
          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}
        </div>

        {/* Pemilih Kategori */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-800">Kategori Permainan</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  category === cat.key
                    ? 'border-[#006194] bg-[#f0f4f8] text-[#006194] shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tag Pengenal */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-800">Label & Tag Pengenal</label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-[#006194] text-white border-[#006194]'
                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Statistik Proyek */}
        {stats && (
          <div className="bg-[#f7f9fb] border border-gray-200 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Sprite</span>
              <span className="text-sm font-extrabold text-[#006194]">{stats.spriteCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Balok</span>
              <span className="text-sm font-extrabold text-[#006194]">{stats.blockCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Variabel</span>
              <span className="text-sm font-extrabold text-[#006194]">{stats.variableCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">SFX</span>
              <span className="text-sm font-extrabold text-[#006194]">{stats.soundCount}</span>
            </div>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#006194] hover:bg-[#004e77] text-white shadow-sm transition-all disabled:opacity-50"
          >
            <span>💾</span>
            <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Browser'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

