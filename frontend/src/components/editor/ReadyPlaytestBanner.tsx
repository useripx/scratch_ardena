import React from 'react';
import { DiffCounters } from '../../types/game.types';

export interface ReadyPlaytestBannerProps {
  isVisible: boolean;
  gameTitle?: string;
  diffCounters?: DiffCounters;
  onPlaytest: () => void;
  onReviewDetails?: () => void;
  onDismiss: () => void;
}

export const ReadyPlaytestBanner: React.FC<ReadyPlaytestBannerProps> = ({
  isVisible,
  gameTitle = 'Game Scratch Baru',
  diffCounters,
  onPlaytest,
  onReviewDetails,
  onDismiss,
}) => {
  if (!isVisible) return null;

  return (
    <div
      role="status"
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-xl bg-gradient-to-r from-emerald-600 via-[#006194] to-blue-600 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/20 animate-fadeIn"
    >
      <div className="flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
          🎮
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
            Balok Berhasil Dihasilkan!
          </span>
          <h4 className="text-sm font-bold truncate max-w-[280px]">
            {gameTitle} Siap Diuji
          </h4>
          {diffCounters && (
            <div className="flex items-center gap-2 text-[10px] text-blue-100 font-mono mt-0.5">
              <span>+{diffCounters.spritesCount} Sprite</span>
              <span>•</span>
              <span>+{diffCounters.blocksCount} Balok</span>
              <span>•</span>
              <span className="text-emerald-300">0 Overwrite</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {onReviewDetails && (
          <button
            type="button"
            onClick={onReviewDetails}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
          >
            Rincian
          </button>
        )}
        <button
          type="button"
          onClick={onPlaytest}
          className="px-4 py-1.5 rounded-lg bg-white text-emerald-800 text-xs font-black shadow-md hover:bg-emerald-50 transition-all flex items-center gap-1.5"
        >
          <span>🚩</span>
          <span>Playtest</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          title="Tutup Notifikasi"
          className="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
