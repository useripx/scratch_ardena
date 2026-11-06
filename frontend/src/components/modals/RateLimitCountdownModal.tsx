import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export interface RateLimitCountdownModalProps {
  isOpen: boolean;
  initialSeconds?: number;
  title?: string;
  description?: string;
  creditsRemaining?: number;
  onRetry: () => void;
  onClose: () => void;
}

export const RateLimitCountdownModal: React.FC<RateLimitCountdownModalProps> = ({
  isOpen,
  initialSeconds = 15,
  title,
  description,
  creditsRemaining,
  onRetry,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(initialSeconds);
      return;
    }

    setSecondsLeft(initialSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, initialSeconds]);

  if (!isOpen) return null;

  const isUnlocked = secondsLeft === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Pendinginan Kuota AI (Cascading Cooldown)"}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Mascot / Icon */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">
            ⏳
          </div>
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
            Free API
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
          {title || "Jeda Singkat Permintaan AI"}
        </h3>

        {/* Balance notification if applicable */}
        {creditsRemaining !== undefined && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-900 text-left flex items-center justify-between">
            <span className="font-semibold">Sisa Kredit Anda:</span>
            <span className="font-bold text-sm bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
              🪙 {creditsRemaining} Poin
            </span>
          </div>
        )}

        {/* Explanation */}
        <p className="text-xs text-gray-600 leading-relaxed max-w-sm mb-6">
          {description ||
            "Seluruh 6 cluster AI gratis sedang mengistirahatkan batas pemanggilan (*Fair Usage Policy*). Tombol coba lagi akan aktif otomatis dalam hitungan mundur di bawah:"}
        </p>

        {/* Big Countdown Timer Display */}
        <div className="w-full bg-[#f7f9fb] border border-amber-200 rounded-2xl p-5 flex flex-col items-center justify-center mb-6 shadow-inner">
          <div className="text-4xl font-mono font-black text-amber-600 tracking-wider">
            {secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
            <span className="text-base text-gray-400 font-sans font-normal ml-1">
              detik
            </span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 mt-1">
            {isUnlocked ? '✅ Cooldown Selesai! Kamu bisa melanjutkan.' : 'Menunggu kuota kembali tersedia...'}
          </span>
        </div>

        {/* Microcopy Info */}
        <div className="w-full text-left bg-blue-50/60 border border-blue-100 rounded-xl p-3 mb-6 text-[11px] text-[#006194] leading-relaxed flex items-start gap-2">
          <span>💡</span>
          <span>
            Proyekmu tersimpan 100% aman di browser. Tidak ada data yang hilang saat menunggu jeda ini.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            disabled={!isUnlocked}
            onClick={onRetry}
            className={`px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 ${
              isUnlocked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>🔄</span>
            <span>{isUnlocked ? 'Coba Lagi Sekarang' : `Tunggu (${secondsLeft}s)`}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

