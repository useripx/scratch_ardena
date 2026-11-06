import React from 'react';
import { Modal } from '../common/Modal';
import { ArdenaGameSpec, DiffCounters } from '../../types/game.types';

export interface ReviewGateModalProps {
  isOpen: boolean;
  gameSpec: ArdenaGameSpec | null;
  diffCounters: DiffCounters | null;
  promptText?: string;
  onApply: () => void;
  onRegenerate: () => void;
  onClose: () => void;
}

export const ReviewGateModal: React.FC<ReviewGateModalProps> = ({
  isOpen,
  gameSpec,
  diffCounters,
  promptText,
  onApply,
  onRegenerate,
  onClose,
}) => {
  if (!isOpen || !gameSpec) return null;

  const diff = diffCounters || {
    spritesCount: gameSpec.sprites.length,
    variablesCount: gameSpec.variables.length,
    sfxCount: gameSpec.soundEffects.length,
    blocksCount: gameSpec.sprites.reduce(
      (tot, s) => tot + (s.scripts ? s.scripts.length : 0),
      0
    ),
    overwrittenBlocksCount: 0,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Hasil AI Copilot • Zero Overwrite Gate"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Prompt Origin Header */}
        {promptText && (
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-2.5 text-xs text-[#006194]">
            <span className="font-bold shrink-0">Prompt Kreator:</span>
            <span className="italic truncate max-w-xl text-gray-800">
              “{promptText}”
            </span>
          </div>
        )}

        {/* Bento Box Diff Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Sprites Added */}
          <div className="p-3.5 rounded-xl bg-[#f7f9fb] border border-gray-200 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg text-[#006194] shrink-0">
              🤖
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-medium">Sprite</span>
              <span className="text-sm font-extrabold text-gray-900">
                +{diff.spritesCount} Baru
              </span>
            </div>
          </div>

          {/* Variables Added */}
          <div className="p-3.5 rounded-xl bg-[#f7f9fb] border border-gray-200 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg text-amber-700 shrink-0">
              📊
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-medium">Variabel</span>
              <span className="text-sm font-extrabold text-gray-900">
                +{diff.variablesCount} Global
              </span>
            </div>
          </div>

          {/* SFX Added */}
          <div className="p-3.5 rounded-xl bg-[#f7f9fb] border border-gray-200 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-lg text-purple-700 shrink-0">
              🔊
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-medium">Audio SFX</span>
              <span className="text-sm font-extrabold text-gray-900">
                +{diff.sfxCount} Efek
              </span>
            </div>
          </div>

          {/* Blocks Added */}
          <div className="p-3.5 rounded-xl bg-[#f7f9fb] border border-gray-200 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-lg text-sky-700 shrink-0">
              🧱
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-medium">Balok Kode</span>
              <span className="text-sm font-extrabold text-gray-900">
                +{diff.blocksCount} Balok
              </span>
            </div>
          </div>

          {/* Overwrite Guarantee */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-lg text-emerald-700 shrink-0">
              🛡️
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-emerald-800 font-medium">Timpaan</span>
              <span className="text-sm font-extrabold text-emerald-700">
                0 (Aman)
              </span>
            </div>
          </div>
        </div>

        {/* Game Narrative Overview */}
        <div className="p-5 rounded-2xl bg-[#f7f9fb] border border-gray-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Rancangan Game:
              </span>
              <h4 className="text-lg font-black text-gray-900">
                {gameSpec.title}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#006194] text-xs font-bold uppercase tracking-wider">
              {gameSpec.genre}
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {gameSpec.description}
          </p>

          {/* Game Rules: Win & Lose Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
              <span className="text-base">🏆</span>
              <span><strong>Menang:</strong> {gameSpec.rules.winCondition}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium">
              <span className="text-base">💥</span>
              <span><strong>Kalah:</strong> {gameSpec.rules.loseCondition}</span>
            </div>
          </div>
        </div>

        {/* Detailed Character / Sprite List */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Rincian Karakter Sprite ({gameSpec.sprites.length} Objek):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
            {gameSpec.sprites.map((sprite, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-xl flex items-center justify-center text-[#006194] shrink-0">
                  {sprite.role === 'player'
                    ? '🧑‍🚀'
                    : sprite.role === 'collectible'
                    ? '⭐'
                    : sprite.role === 'obstacle'
                    ? '☄️'
                    : '🎯'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {sprite.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Peran: {sprite.role}
                  </span>
                  <span className="text-[10px] text-[#006194]">
                    {sprite.scripts ? sprite.scripts.length : 0} Balok Logika
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Decision Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Batal / Kembali
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onRegenerate}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>🔄</span>
              <span>Buat Ulang (Regenerate)</span>
            </button>
            <button
              type="button"
              onClick={onApply}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>✅</span>
              <span>Terapkan ke Editor</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

