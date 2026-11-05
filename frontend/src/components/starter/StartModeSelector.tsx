import React from 'react';
import { Modal } from '../common/Modal';

export type StartMode = 'ai-prompt' | 'template' | 'blank';

export interface StartModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: StartMode) => void;
}

export const StartModeSelector: React.FC<StartModeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Cara Memulai Game Baru" maxWidth="max-w-3xl">
      <div className="flex flex-col gap-4 py-2">
        <p className="text-sm text-gray-600 mb-2">
          Pilih metode pembuatan proyek yang paling sesuai dengan kebutuhanmu hari ini:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode 1: AI Copilot Prompt */}
          <div
            onClick={() => onSelectMode('ai-prompt')}
            className="group relative flex flex-col p-5 bg-gradient-to-b from-blue-50/70 to-white border-2 border-blue-500 rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1"
          >
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-[#006194] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              Direkomendasikan
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-2xl flex items-center justify-center mb-3 mt-1 text-[#006194]">
              ✨
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-[#006194] transition-colors">
              Mulai dari Ide AI
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-grow">
              Tulis prompt ide game dalam bahasa sehari-hari. AI merancang objek, aturan, dan balok kode otomatis.
            </p>
            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-[#006194] text-white text-xs font-bold hover:bg-[#007bb9] transition-colors shadow-sm"
            >
              Pilih Mode Ide
            </button>
          </div>

          {/* Mode 2: Template Game */}
          <div
            onClick={() => onSelectMode('template')}
            className="group flex flex-col p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-amber-400 hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-2xl flex items-center justify-center mb-3 text-amber-700">
              🎮
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
              Mulai dari Template
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-grow">
              Gunakan struktur game siap pakai: Catching Game, Maze Adventure, atau Space Shooter.
            </p>
            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm"
            >
              Jelajahi Template
            </button>
          </div>

          {/* Mode 3: Scratch Editor Kosong */}
          <div
            onClick={() => onSelectMode('blank')}
            className="group flex flex-col p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-gray-400 hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-2xl flex items-center justify-center mb-3 text-gray-700">
              📄
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-gray-900 transition-colors">
              Editor Kosong
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-grow">
              Buka kanvas Scratch polos tanpa bantuan AI untuk merakit logika visual secara mandiri dari awal.
            </p>
            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-gray-800 text-white text-xs font-bold hover:bg-gray-900 transition-colors shadow-sm"
            >
              Buka Editor
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
