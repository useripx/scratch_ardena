import React, { useState, useEffect } from 'react';

export interface GeneratingOverlayProps {
  isOpen: boolean;
  onAbort?: () => void;
  minStageDurationMs?: number;
}

interface GenerationStage {
  stage: number;
  progress: number;
  title: string;
  subtitle: string;
  icon: string;
}

const STAGES: GenerationStage[] = [
  {
    stage: 1,
    progress: 25,
    title: 'Menganalisis Ide Cerita',
    subtitle: 'AI Copilot mengidentifikasi tokoh, peran objek, dan tujuan game...',
    icon: '💡',
  },
  {
    stage: 2,
    progress: 50,
    title: 'Memvalidasi Skema Logika',
    subtitle: 'Memeriksa batasan aman (Allowlist) & aturan main anti-error...',
    icon: '📐',
  },
  {
    stage: 3,
    progress: 75,
    title: 'Menyusun Balok Scratch 3.0',
    subtitle: 'Merakit balok Kejadian, Gerakan, dan Kontrol native MIT Scratch...',
    icon: '🧱',
  },
  {
    stage: 4,
    progress: 100,
    title: 'Menyiapkan Suara & Variabel',
    subtitle: 'Mengintegrasikan efek SFX audio dan skor variabel...',
    icon: '🎵',
  },
];

const INSPIRATIONAL_TIPS = [
  'Tahukah kamu? Game Scratch menggunakan sistem berbasis event (ketika bendera hijau diklik).',
  'Variabel skor dan nyawa memastikan tantangan game tetap seimbang dan adil.',
  'Setelah proses ini selesai, kamu bisa memeriksa bento Diff Counters sebelum menerapkan ke kanvas.',
];

export const GeneratingOverlay: React.FC<GeneratingOverlayProps> = ({
  isOpen,
  onAbort,
  minStageDurationMs = 400,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [activeTipIdx, setActiveTipIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIdx(0);
      return;
    }

    // Step through the 4 stages with minimum duration
    const stageTimer = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, minStageDurationMs);

    // Rotate tips every 2.5 seconds
    const tipTimer = setInterval(() => {
      setActiveTipIdx((prev) => (prev + 1) % INSPIRATIONAL_TIPS.length);
    }, 2500);

    return () => {
      clearInterval(stageTimer);
      clearInterval(tipTimer);
    };
  }, [isOpen, minStageDurationMs]);

  if (!isOpen) return null;

  const currentStage = STAGES[currentStageIdx];

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Icon Avatar */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#006194] to-blue-400 text-white flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20 animate-pulse">
            {currentStage.icon}
          </div>
          <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold shadow-md">
            {currentStage.stage}/4
          </span>
        </div>

        {/* Headline & Current Subtitle */}
        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          {currentStage.title}
        </h3>
        <p className="text-xs text-gray-600 max-w-sm mb-6 leading-relaxed min-h-[36px]">
          {currentStage.subtitle}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-2 p-0.5 border border-gray-200">
          <div
            className="bg-gradient-to-r from-[#006194] to-blue-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${currentStage.progress}%` }}
          />
        </div>

        <div className="w-full flex items-center justify-between text-[11px] font-bold text-gray-400 mb-6">
          <span>Hexa-Cluster AI Cascading</span>
          <span className="text-[#006194]">{currentStage.progress}%</span>
        </div>

        {/* 4 Mini Stage Pills */}
        <div className="grid grid-cols-4 gap-2 w-full mb-6">
          {STAGES.map((s, idx) => (
            <div
              key={s.stage}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all border ${
                idx === currentStageIdx
                  ? 'bg-blue-50 border-blue-300 text-[#006194] font-bold shadow-sm'
                  : idx < currentStageIdx
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <span className="text-xs">
                {idx < currentStageIdx ? '✓' : s.icon}
              </span>
              <span className="text-[10px] leading-tight truncate w-full">
                {s.stage}. {s.title.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Tip Box */}
        <div className="w-full bg-blue-50/60 border border-blue-100 rounded-2xl p-3 text-left flex items-start gap-2.5 mb-6">
          <span className="text-base text-blue-600 mt-0.5">💡</span>
          <p className="text-[11px] text-[#006194] leading-relaxed font-medium">
            {INSPIRATIONAL_TIPS[activeTipIdx]}
          </p>
        </div>

        {/* Abort Action */}
        {onAbort && (
          <button
            type="button"
            onClick={onAbort}
            className="text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
          >
            ✕ Batalkan Proses
          </button>
        )}
      </div>
    </div>
  );
};
