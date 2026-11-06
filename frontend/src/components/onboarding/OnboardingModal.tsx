import React, { useState } from 'react';
import { Modal } from '../common/Modal';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface OnboardingStep {
  step: number;
  title: string;
  badge: string;
  description: string;
  icon: string;
  highlightText: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    badge: 'Langkah 1 • Inspirasi Tanpa Batas',
    title: 'Tulis Ide Game dalam Bahasa Apapun',
    description:
      'Cukup ketik ide ceritamu dalam bahasa sehari-hari. Mulai dari game menangkap bintang, labirin teka-teki, hingga perang antariksa. AI Copilot kami akan menerjemahkan ceritamu menjadi logika visual.',
    icon: '💡',
    highlightText: '“Buat game astronot menangkap bintang dengan rintangan meteor berkecepatan acak.”',
  },
  {
    step: 2,
    badge: 'Langkah 2 • Garansi Keamanan Proyek',
    title: 'Review Hasil AI Tanpa Rasa Takut',
    description:
      'Sistem Zero Overwrite Review Gate selalu menampilkan rangkuman perubahan (+Sprite, +Variabel, +Balok, 0 Overwrite) sebelum diterapkan ke kanvas. Proyek lamamu tidak akan pernah tertimpa tanpa izin!',
    icon: '🛡️',
    highlightText: '+2 Sprite • +1 Variabel Skor • +1 Sound SFX • 0 Proyek Tertimpa',
  },
  {
    step: 3,
    badge: 'Langkah 3 • Sentuhan Kreator Sejati',
    title: 'Mainkan & Modifikasi di Scratch Asli',
    description:
      'Hasil generasi adalah blok visual resmi Scratch 3.0. Kamu bisa langsung bermain, memodifikasi balok kode di editor, dan mengekspor hasilnya menjadi file .sb3 fisik ke komputermu kapan saja.',
    icon: '🎮',
    highlightText: '100% Kompatibel dengan Scratch Desktop & Komunitas MIT Scratch.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const activeStep = ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const handleFinish = () => {
    try {
      localStorage.setItem('ardena_onboarding_completed', 'true');
    } catch {
      // LocalStorage fallback for privacy modes
    }
    onComplete();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="flex flex-col items-center text-center p-2">
        {/* Step Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#006194] text-xs font-bold uppercase tracking-wider mb-4">
          {activeStep.badge}
        </span>

        {/* Large Visual Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#006194]/10 to-blue-200/40 flex items-center justify-center text-4xl shadow-inner mb-4 border border-blue-100">
          {activeStep.icon}
        </div>

        {/* Step Title */}
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
          {activeStep.title}
        </h2>

        {/* Step Description */}
        <p className="text-sm text-gray-600 leading-relaxed max-w-md mb-6">
          {activeStep.description}
        </p>

        {/* Highlight Card */}
        <div className="w-full bg-[#f7f9fb] border border-blue-100 rounded-xl p-3.5 mb-6 text-xs text-[#006194] font-medium text-left flex items-center gap-2">
          <span className="text-base shrink-0">✨</span>
          <span className="italic">{activeStep.highlightText}</span>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((step, idx) => (
            <button
              key={step.step}
              type="button"
              aria-label={`Ke Langkah ${step.step}`}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-8 bg-[#006194]'
                  : 'w-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg transition-colors"
          >
            Lewati Panduan
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Sebelumnya
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#006194] text-white text-sm font-bold shadow-md hover:bg-[#007bb9] transition-all"
            >
              {isLastStep ? '🚀 Mulai Berkreasi' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
