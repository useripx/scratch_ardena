import React, { useState } from 'react';
import { SupportedTemplateKey, AI_ACTION_CREDIT_COSTS } from '../../types/game.types';
import { useI18n } from '../../contexts/I18nContext';

export type CopilotMode = 'buat' | 'ubah' | 'jelaskan';

export interface AICopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, template?: SupportedTemplateKey, mode?: CopilotMode) => void;
  isGenerating?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
  creditsBalance?: number;
}

const INSPIRATION_PROMPTS_ID = [
  'Buat game astronot menangkap bintang di luar angkasa dengan rintangan meteor berkecepatan acak.',
  'Kucing mengejar keju di labirin dinding dan hindari tikus penjaga.',
  'Pesawat tempur menembak asteroid dengan laser dan pertahankan 3 nyawa.',
];

const INSPIRATION_PROMPTS_EN = [
  'Create an astronaut game catching stars in outer space with random speed meteor obstacles.',
  'A cat chases cheese through a maze of walls while avoiding guard mice.',
  'A space fighter shoots asteroids with lasers and defends 3 player lives.',
];

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
  errorMessage,
  onClearError,
  creditsBalance,
}) => {
  const { t, locale } = useI18n();
  const isEn = locale === 'en';
  const inspirations = isEn ? INSPIRATION_PROMPTS_EN : INSPIRATION_PROMPTS_ID;

  const [activeMode, setActiveMode] = useState<CopilotMode>('buat');
  const [promptText, setPromptText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SupportedTemplateKey | ''>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isGenerating) return;
    onGenerate(
      promptText.trim(),
      selectedTemplate ? selectedTemplate : undefined,
      activeMode
    );
  };

  const handleApplyChip = (text: string) => {
    setPromptText(text);
  };

  return (
    <aside
      aria-label="Panel AI Copilot"
      className="w-full xl:w-[380px] 2xl:w-[420px] bg-white border-l border-gray-200 shadow-xl flex flex-col h-[calc(100vh-3.5rem)] fixed top-14 right-0 z-30 transition-all overflow-hidden"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#f7f9fb]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm text-[#006194]">
            ✨
          </div>
          <span className="font-extrabold text-sm text-gray-900">
            {t('editor.copilotTitle')}
          </span>
          {creditsBalance !== undefined ? (
            <span
              title="Saldo kredit AI Agen saat ini"
              className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300"
            >
              🪙 {creditsBalance.toLocaleString(isEn ? 'en-US' : 'id-ID')} {t('modes.creditsUnit')}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              6 Cluster
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          title={t('common.close')}
          className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 flex items-center justify-center text-xs transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tabs Mode: Buat, Ubah, Jelaskan */}
      <div className="flex items-center bg-[#eceef0] p-1 gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => {
            setActiveMode('buat');
            onClearError?.();
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeMode === 'buat'
              ? 'bg-white text-[#006194] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✨ {isEn ? 'Create' : 'Buat'} (-100)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMode('ubah');
            onClearError?.();
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeMode === 'ubah'
              ? 'bg-white text-[#006194] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🛠️ {isEn ? 'Modify' : 'Ubah'} (-50)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMode('jelaskan');
            onClearError?.();
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeMode === 'jelaskan'
              ? 'bg-white text-[#006194] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📖 {isEn ? 'Explain' : 'Jelaskan'} (-20)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-2 text-xs text-red-700 animate-fadeIn">
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">⚠️</span>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="text-red-400 hover:text-red-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Form Generation */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="copilot-prompt-input"
              className="text-xs font-bold text-gray-700 uppercase tracking-wider"
            >
              {activeMode === 'buat'
                ? (isEn ? 'New Game Idea' : 'Ide Permainan Baru')
                : activeMode === 'ubah'
                ? (isEn ? 'Modification Instruction' : 'Instruksi Modifikasi')
                : (isEn ? 'Block Logic Question' : 'Pertanyaan Logika Balok')}
            </label>
            <span className="text-[11px] font-mono text-gray-400">
              {promptText.length}/2000
            </span>
          </div>

          <textarea
            id="copilot-prompt-input"
            rows={4}
            maxLength={2000}
            disabled={isGenerating}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={
              activeMode === 'buat'
                ? (isEn
                    ? 'Describe your story (e.g., Create an astronaut game catching stars...)'
                    : 'Jelaskan ceritamu (contoh: Buat game astronot menangkap bintang...)')
                : activeMode === 'ubah'
                ? (isEn
                    ? 'Example: Increase meteor speed when score reaches 50...'
                    : 'Contoh: Tambah kecepatan meteor saat skor mencapai 50...')
                : (isEn
                    ? 'Example: Explain the purpose of "when green flag clicked" block...'
                    : 'Contoh: Jelaskan apa fungsi balok "ketika bendera hijau diklik"...')
            }
            className="w-full p-3 text-xs text-gray-900 border border-gray-300 rounded-xl bg-[#f7f9fb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] leading-relaxed resize-none transition-all"
          />

          {/* Template Selector Option */}
          {activeMode === 'buat' && (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="template-select"
                className="text-[11px] font-bold text-gray-500 uppercase"
              >
                {t('editor.templateLabel')}
              </label>
              <select
                id="template-select"
                value={selectedTemplate}
                onChange={(e) =>
                  setSelectedTemplate(e.target.value as SupportedTemplateKey | '')
                }
                className="p-2 text-xs border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#006194]"
              >
                <option value="">{t('editor.templateAuto')}</option>
                <option value="catching-game">{isEn ? 'Catching Game (Catch Apples)' : 'Catching Game (Tangkap Apel)'}</option>
                <option value="maze-adventure">{isEn ? 'Maze Adventure' : 'Maze Adventure (Labirin)'}</option>
                <option value="space-shooter">{isEn ? 'Space Shooter' : 'Space Shooter (Antariksa)'}</option>
              </select>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={!promptText.trim() || isGenerating}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
              promptText.trim() && !isGenerating
                ? 'bg-[#006194] text-white hover:bg-[#007bb9] hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{isGenerating ? '⏳' : '⚡'}</span>
            <span>
              {isGenerating
                ? (isEn ? 'Assembling Game Logic...' : 'Sedang Merakit Game...')
                : activeMode === 'buat'
                ? (isEn
                    ? `Generate Scratch Game (-${AI_ACTION_CREDIT_COSTS.create} Pts)`
                    : `Generate Game Scratch (-${AI_ACTION_CREDIT_COSTS.create} Poin)`)
                : activeMode === 'ubah'
                ? (isEn
                    ? `Apply Modifications (-${AI_ACTION_CREDIT_COSTS.modify} Pts)`
                    : `Terapkan Modifikasi (-${AI_ACTION_CREDIT_COSTS.modify} Poin)`)
                : (isEn
                    ? `Ask AI Tutor (-${AI_ACTION_CREDIT_COSTS.explain} Pts)`
                    : `Tanya Tutor AI (-${AI_ACTION_CREDIT_COSTS.explain} Poin)`)}
            </span>
          </button>
        </form>

        {/* Quick Inspiration Chips */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {t('editor.quickInspirations')}
          </span>
          <div className="flex flex-col gap-1.5">
            {inspirations.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyChip(prompt)}
                className="text-left p-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200/80 text-[11px] text-gray-700 hover:text-[#006194] transition-colors leading-relaxed"
              >
                “{prompt}”
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Footer */}
      <div className="p-3 bg-[#f2f4f6] border-t border-gray-200 text-center text-[10px] text-gray-500 font-medium">
        🛡️ Zero Overwrite Review Gate • Scratch 3.0 Compatible
      </div>
    </aside>
  );
};
