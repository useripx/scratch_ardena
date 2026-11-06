import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { UserPreferences, DEFAULT_USER_PREFERENCES } from '../../types/game.types';
import { storageService } from '../../services/storage.service';

export interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData?: () => void;
}

type TabKey = 'ai' | 'storage' | 'display' | 'about';

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('ai');
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [projectCount, setProjectCount] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      storageService.getPreferences().then(setPrefs);
      storageService.getProjects().then((p) => setProjectCount(p.length));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = async (updated: Partial<UserPreferences>) => {
    const next = await storageService.savePreferences(updated);
    setPrefs(next);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleBackupAll = async () => {
    try {
      const jsonStr = await storageService.exportAllProjectsAsJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ardena_projects_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[PreferencesModal] Gagal ekspor cadangan proyek:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan & Preferensi Studio" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-gray-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ai' ? 'bg-[#006194] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🤖</span> Mesin AI & Gateway
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'storage' ? 'bg-[#006194] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>💾</span> Penyimpanan & IndexedDB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'display' ? 'bg-[#006194] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🎨</span> Tampilan & Aksesibilitas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'about' ? 'bg-[#006194] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>ℹ️</span> Privasi & Tentang
          </button>
        </div>

        {/* Tab 1: Mesin AI */}
        {activeTab === 'ai' && (
          <div className="flex flex-col gap-3 py-1">
            <div className="bg-[#f0f4f8] border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Ardena AI Gateway Aktif</h4>
                  <p className="text-[11px] text-gray-500">Hexa-Cluster AI Cascading (Gemini, Groq, SambaNova, NVIDIA, Cohere, OpenRouter)</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Tersambung (Port 3001)
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800">Model AI Pilihan</label>
              <select
                value={prefs.aiModelPreference}
                onChange={(e) => handleUpdate({ aiModelPreference: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#006194]"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Default Cepat & Akurat)</option>
                <option value="groq-llama3">Groq Llama 3 70B (Kecepatan Sangat Tinggi)</option>
                <option value="sambanova-llama3">SambaNova Meta-Llama 3 (Akurasi Tinggi)</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 2: Penyimpanan */}
        {activeTab === 'storage' && (
          <div className="flex flex-col gap-3 py-1">
            <div className="bg-[#f7f9fb] border border-gray-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Pustaka Proyek Browser</span>
                <span className="text-xs text-gray-500">{projectCount} Proyek tersimpan secara lokal</span>
              </div>
              <button
                type="button"
                onClick={handleBackupAll}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:border-[#006194] rounded-lg text-xs font-bold text-[#006194] transition-colors"
              >
                📦 Ekspor Cadangan (JSON)
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-bold text-gray-800">Interval Simpan Otomatis</label>
              <select
                value={prefs.autoSaveIntervalSeconds}
                onChange={(e) => handleUpdate({ autoSaveIntervalSeconds: Number(e.target.value) })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#006194]"
              >
                <option value={30}>Setiap 30 detik</option>
                <option value={60}>Setiap 1 menit (Standar)</option>
                <option value={120}>Setiap 2 menit</option>
                <option value={0}>Nonaktifkan simpan otomatis</option>
              </select>
            </div>

            {onResetData && (
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-600 block">Zona Bahaya</span>
                  <span className="text-[11px] text-gray-500">Hapus seluruh data lokal dan preferensi studio</span>
                </div>
                <button
                  type="button"
                  onClick={onResetData}
                  className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                >
                  Reset Data Lokal
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tampilan & Aksesibilitas */}
        {activeTab === 'display' && (
          <div className="flex flex-col gap-3 py-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Efek Suara Antarmuka</span>
                <span className="text-[11px] text-gray-500">Bunyikan efek suara saat aksi balok dan generate AI</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.soundEffectsEnabled}
                onChange={(e) => handleUpdate({ soundEffectsEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#006194] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Mode Kontras Tinggi</span>
                <span className="text-[11px] text-gray-500">Meningkatkan ketajaman tepi blok dan panggung</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.highContrastMode}
                onChange={(e) => handleUpdate({ highContrastMode: e.target.checked })}
                className="w-4 h-4 accent-[#006194] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Privasi & Tentang */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-3 py-1 text-xs text-gray-700 leading-relaxed">
            <div className="bg-[#f7f9fb] p-3 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-1">🔐 Komitmen Privasi & Zero Telemetry</h4>
              <p className="text-[11px] text-gray-600">
                Ardena Playground tidak mengumpulkan data pribadi apa pun. Seluruh game dan kode Scratch Anda disimpan 100% secara privat di peramban lokal perangkat ini.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-1 text-[11px]">
              <div><strong>Aplikasi:</strong> Ardena Playground Web v1.0.0-rc1</div>
              <div><strong>Arsitektur:</strong> Scratch 3.0 Compatible + Hexa-Cluster AI Cascading</div>
              <div><strong>Pengembang:</strong> Yogi Ario & Tim Pengembang Ardena</div>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="text-center text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-lg">
            ✓ Preferensi berhasil diperbarui
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#006194] text-white hover:bg-[#004e77] transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </Modal>
  );
};

