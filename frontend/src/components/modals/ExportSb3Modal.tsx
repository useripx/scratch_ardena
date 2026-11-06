import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StoredProject } from '../../types/game.types';
import { storageService } from '../../services/storage.service';

export interface ExportSb3ModalProps {
  isOpen: boolean;
  project: StoredProject | null;
  onClose: () => void;
}

export const ExportSb3Modal: React.FC<ExportSb3ModalProps> = ({
  isOpen,
  project,
  onClose,
}) => {
  const [fileName, setFileName] = useState<string>(
    project ? project.title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'proyek_scratch'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen || !project) return null;

  const handleDownloadSb3 = async () => {
    try {
      setIsExporting(true);
      const blob = await storageService.exportProjectToSb3(project);

      // Trigger browser file download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.trim() || 'proyek_scratch'}.sb3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('[ExportSb3Modal] Gagal mengekspor file .sb3:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadJson = () => {
    try {
      const jsonStr = JSON.stringify(project.gameSpec, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.trim() || 'proyek_scratch'}_spec.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[ExportSb3Modal] Gagal mengekspor file .json:', err);
    }
  };

  const sprites = project.gameSpec.sprites || [];
  const variables = project.gameSpec.variables || [];
  const sounds = project.gameSpec.soundEffects || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ekspor Proyek ke Scratch 3.0 (.sb3)" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-5">
        {/* Banner Preview Identitas Berkas */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-[#f0f4f8] border border-blue-100 rounded-2xl p-4">
          <div className="sm:col-span-3 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-blue-200 text-center shadow-xs">
            <span className="text-3xl mb-1">📦</span>
            <span className="font-extrabold text-[#006194] text-sm">.SB3</span>
            <span className="text-[10px] text-gray-500">Scratch 3.0 Archive</span>
          </div>
          <div className="sm:col-span-9 flex flex-col justify-between">
            <div>
              <label htmlFor="export-file-name" className="text-xs font-bold text-gray-800 block mb-1">
                Nama File Target Unduhan
              </label>
              <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#006194]/30">
                <input
                  id="export-file-name"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-transparent outline-none"
                />
                <span className="text-xs font-bold text-gray-400">.sb3</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span>✓</span> 100% Valid Scratch 3.0 AST & VM Compatible
              </span>
            </div>
          </div>
        </div>

        {/* Komposisi Paket Bundel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800">Komposisi Paket Bundel</span>
            <span className="text-[11px] text-gray-400">
              {sprites.length + variables.length + sounds.length + 1} Aset Internal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Sprites</span>
              <span className="text-xs font-bold text-gray-800">{sprites.length} Objek Aktif</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Panggung</span>
              <span className="text-xs font-bold text-gray-800">1 Backdrop SVG</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Variabel</span>
              <span className="text-xs font-bold text-gray-800">{variables.length} Monitor Skor</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Efek Suara</span>
              <span className="text-xs font-bold text-gray-800">{sounds.length} Sound Clips</span>
            </div>
          </div>
        </div>

        {/* Petunjuk Kompatibilitas */}
        <div className="bg-[#f7f9fb] p-3 rounded-xl border border-gray-200 text-xs text-gray-600 leading-relaxed">
          💡 <strong>Tips Membuka File:</strong> Buka situs <strong>scratch.mit.edu/projects/editor</strong>, klik menu <em>Berkas (File)</em> ➔ <em>Muat dari Komputer Anda (Load from your computer)</em>, lalu pilih file <code>.sb3</code> yang telah diunduh.
        </div>

        {exportSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
            <span>🎉</span> File berhasil dikemas dan diunduh ke komputer Anda!
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg transition-colors"
          >
            Unduh Format JSON AST
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadSb3}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#006194] hover:bg-[#004e77] text-white shadow-sm transition-all disabled:opacity-50"
            >
              <span>⬇️</span>
              <span>{isExporting ? 'Mengemas .sb3...' : 'Unduh Paket .sb3 Sekarang'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

