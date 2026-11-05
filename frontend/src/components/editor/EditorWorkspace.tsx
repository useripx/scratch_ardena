import React, { useState } from 'react';
import { EditorTopNav } from './EditorTopNav';
import { AICopilotPanel } from './AICopilotPanel';
import { GeneratingOverlay } from './GeneratingOverlay';
import { ReadyPlaytestBanner } from './ReadyPlaytestBanner';
import { ReviewGateModal } from '../modals/ReviewGateModal';
import { ErrorRecoveryDialog } from '../modals/ErrorRecoveryDialog';
import { RateLimitCountdownModal } from '../modals/RateLimitCountdownModal';
import { apiService } from '../../services/api.service';
import {
  ArdenaGameSpec,
  DiffCounters,
  SupportedTemplateKey,
} from '../../types/game.types';

export interface EditorWorkspaceProps {
  initialProjectName?: string;
  initialTemplateId?: SupportedTemplateKey;
  onBackToHome: () => void;
  onGameGenerated?: (game: ArdenaGameSpec, diff: DiffCounters) => void;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  initialProjectName = 'Game Tanpa Judul',
  initialTemplateId,
  onBackToHome,
  onGameGenerated,
}) => {
  const [projectName, setProjectName] = useState(initialProjectName);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Error States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isRateLimitModalOpen, setIsRateLimitModalOpen] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(15);

  // Review Gate States (UI 09)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [lastPromptText, setLastPromptText] = useState('');
  const [isPlaytestBannerVisible, setIsPlaytestBannerVisible] = useState(false);
  const [currentDiffCounters, setCurrentDiffCounters] = useState<DiffCounters | undefined>(undefined);
  const [currentGameSpec, setCurrentGameSpec] = useState<ArdenaGameSpec | null>(null);

  // Active Category in Palette
  const [activeCategory, setActiveCategory] = useState<'gerakan' | 'kejadian' | 'kontrol' | 'variabel'>('kejadian');

  // Handle AI Game Generation
  const handleGenerate = async (prompt: string, template?: SupportedTemplateKey) => {
    setIsGenerating(true);
    setErrorMessage(null);
    setErrorCode(undefined);
    setIsPlaytestBannerVisible(false);
    setLastPromptText(prompt);

    try {
      const result = await apiService.generateGame({
        prompt,
        template: template || initialTemplateId || 'catching-game',
        schemaVersion: '1.0',
        language: 'id',
      });

      const gameSpec = result.game;
      const diff = result.diffCounters;

      setCurrentGameSpec(gameSpec);
      setCurrentDiffCounters(diff);

      // Open Zero Overwrite Review Gate Modal (UI 09) for confirmation
      setIsReviewModalOpen(true);
    } catch (err: any) {
      const msg = err?.message || 'Gagal menghasilkan game. Periksa koneksi backend Anda.';
      setErrorMessage(msg);
      setErrorCode(err?.code);

      if (err?.retryAfterSeconds) {
        setRateLimitSeconds(err.retryAfterSeconds);
        setIsRateLimitModalOpen(true);
      } else {
        setIsErrorModalOpen(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // User confirms in ReviewGateModal -> Apply changes to editor canvas
  const handleApplyReview = () => {
    setIsReviewModalOpen(false);
    if (currentGameSpec) {
      setProjectName(currentGameSpec.title);
      setIsPlaytestBannerVisible(true);
      if (currentDiffCounters) {
        onGameGenerated?.(currentGameSpec, currentDiffCounters);
      }
    }
  };

  const handleRegenerateFromReview = () => {
    setIsReviewModalOpen(false);
    setIsCopilotOpen(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
    setIsPlaytestBannerVisible(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f7f9fb] text-[#191c1e] overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <EditorTopNav
        projectName={projectName}
        onRenameProject={setProjectName}
        onBackToHome={onBackToHome}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
      />

      {/* Main Workspace Grid (3 Kolom: Palet Balok, Kanvas Workspace, Stage & Dock AI) */}
      <div className="w-full flex-1 flex pt-14 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Kolom 1: Kategori & Palet Balok Scratch */}
        <section className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {/* Tabs Workspace: Kode, Kostum, Suara */}
          <div className="flex items-center bg-[#f2f4f6] px-1 pt-1 gap-1 border-b border-gray-200">
            <button
              type="button"
              className="flex-1 py-1.5 rounded-t-lg bg-white text-[#006194] text-xs font-bold shadow-sm"
            >
              🧩 Kode
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 rounded-t-lg text-gray-500 hover:text-gray-800 text-xs font-medium"
            >
              🎨 Kostum
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 rounded-t-lg text-gray-500 hover:text-gray-800 text-xs font-medium"
            >
              🔊 Suara
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Category Color Bar */}
            <div className="w-14 bg-[#f2f4f6] flex flex-col items-center py-2 gap-2 border-r border-gray-200">
              <button
                type="button"
                onClick={() => setActiveCategory('kejadian')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
                  activeCategory === 'kejadian' ? 'bg-amber-100' : 'hover:bg-gray-200'
                }`}
                title="Kejadian"
              >
                <span className="w-4 h-4 rounded-full bg-[#FFBF00]" />
                <span className="text-[9px] font-bold text-gray-700">Event</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('kontrol')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
                  activeCategory === 'kontrol' ? 'bg-amber-100' : 'hover:bg-gray-200'
                }`}
                title="Kontrol"
              >
                <span className="w-4 h-4 rounded-full bg-[#FFAB19]" />
                <span className="text-[9px] font-bold text-gray-700">Kontrol</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('gerakan')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
                  activeCategory === 'gerakan' ? 'bg-blue-100' : 'hover:bg-gray-200'
                }`}
                title="Gerakan"
              >
                <span className="w-4 h-4 rounded-full bg-[#4C97FF]" />
                <span className="text-[9px] font-bold text-gray-700">Gerak</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('variabel')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
                  activeCategory === 'variabel' ? 'bg-orange-100' : 'hover:bg-gray-200'
                }`}
                title="Variabel"
              >
                <span className="w-4 h-4 rounded-full bg-[#FF8C1A]" />
                <span className="text-[9px] font-bold text-gray-700">Variabel</span>
              </button>
            </div>

            {/* Block Palette List */}
            <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5 bg-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Palet Balok Scratch 3.0
              </span>

              {/* Event Blocks */}
              <div className="flex items-center gap-1.5 bg-[#FFBF00] text-gray-900 text-xs px-2.5 py-1.5 rounded-lg font-bold shadow-sm cursor-grab">
                <span>🚩</span>
                <span>ketika diklik</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FFBF00] text-gray-900 text-xs px-2.5 py-1.5 rounded-lg font-bold shadow-sm cursor-grab">
                <span>⌨️</span>
                <span>ketika tombol [spasi]</span>
              </div>

              {/* Control Blocks */}
              <div className="flex items-center gap-1.5 bg-[#FFAB19] text-white text-xs px-2.5 py-1.5 rounded-lg font-bold shadow-sm cursor-grab">
                <span>🔄</span>
                <span>selamanya</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FFAB19] text-white text-xs px-2.5 py-1.5 rounded-lg font-bold shadow-sm cursor-grab">
                <span>❓</span>
                <span>jika &lt;menyentuh&gt; maka</span>
              </div>

              {/* Motion Blocks */}
              <div className="flex items-center gap-1.5 bg-[#4C97FF] text-white text-xs px-2.5 py-1.5 rounded-lg font-bold shadow-sm cursor-grab">
                <span>🏃</span>
                <span>gerak (10) langkah</span>
              </div>

              {/* Variable Blocks */}
              <div className="flex items-center gap-1.5 bg-[#FF8C1A] text-white text-xs px-2.5 py-1.5 rounded-lg font-bold shadow-sm cursor-grab">
                <span>📊</span>
                <span>ubah [Skor] sebesar (1)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Kolom 2: Blockly Workspace Canvas (Tengah) */}
        <section className="flex-1 bg-[#f7f9fb] relative overflow-hidden flex flex-col border-r border-gray-200">
          {/* Grid Background Effect */}
          <div
            className="w-full h-full p-6 overflow-auto"
            style={{
              backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Visual Scratch Stack Generated / Placed */}
            <div className="inline-flex flex-col gap-1 bg-white/80 p-4 rounded-2xl shadow-md border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Workspace Balok Aktif:
              </span>

              {/* Stack Hat */}
              <div className="flex items-center gap-2 bg-[#FFBF00] text-gray-900 text-xs font-bold px-3 py-2 rounded-t-xl rounded-b shadow-sm">
                <span>🚩</span>
                <span>ketika bendera hijau diklik</span>
              </div>
              {/* Stack Body */}
              <div className="flex items-center gap-2 bg-[#FF8C1A] text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm ml-2">
                <span>📊</span>
                <span>atur [Skor] menjadi (0)</span>
              </div>
              <div className="flex items-center gap-2 bg-[#FFAB19] text-white text-xs font-bold px-3 py-2 rounded-b-xl shadow-sm ml-2">
                <span>🔄</span>
                <span>selamanya [ulangi logika game]</span>
              </div>
            </div>
          </div>
        </section>

        {/* Kolom 3: Stage Preview & Sprite Pane */}
        <section
          className={`flex flex-col bg-white shrink-0 transition-all ${
            isCopilotOpen ? 'w-80 2xl:w-96 mr-[380px] 2xl:mr-[420px]' : 'w-96 2xl:w-[480px]'
          }`}
        >
          {/* Stage Canvas Area */}
          <div className="p-3 border-b border-gray-200 relative">
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shadow-inner flex flex-col justify-between p-3 border border-slate-800">
              {/* Floating Ready Playtest Banner (UI 10) */}
              <ReadyPlaytestBanner
                isVisible={isPlaytestBannerVisible}
                gameTitle={currentGameSpec?.title || projectName}
                diffCounters={currentDiffCounters}
                onPlaytest={handleTogglePlay}
                onReviewDetails={() => setIsReviewModalOpen(true)}
                onDismiss={() => setIsPlaytestBannerVisible(false)}
              />

              {/* Top Stage HUD */}
              <div className="flex items-center justify-between z-10">
                <span className="bg-white/20 text-white text-[11px] font-mono px-2 py-0.5 rounded-full">
                  Skor: {isPlaying ? '10' : '0'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  480 x 360 px
                </span>
              </div>

              {/* Playtest Visual Characters */}
              <div className="flex items-center justify-around py-4 z-10">
                <div
                  className={`text-4xl transition-transform ${
                    isPlaying ? 'animate-bounce' : ''
                  }`}
                >
                  🧑‍🚀
                </div>
                <div
                  className={`text-2xl transition-transform ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                >
                  ⭐
                </div>
              </div>

              {/* Bottom Stage Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 z-10">
                <span>Panggung Scratch</span>
                <span className={isPlaying ? 'text-emerald-400 font-bold' : ''}>
                  {isPlaying ? '● Berjalan' : '○ Berhenti'}
                </span>
              </div>
            </div>
          </div>

          {/* Sprite & Backdrop Selector Pane */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Daftar Objek Sprite:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2">
                <span className="text-xl">🧑‍🚀</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Player</span>
                  <span className="text-[10px] text-gray-500">X: 0, Y: -100</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Bintang</span>
                  <span className="text-[10px] text-gray-500">X: acak, Y: 150</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Dock: AI Copilot Panel (UI 06) */}
        <AICopilotPanel
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
        />
      </div>

      {/* Generating 4-Stage Overlay (UI 08) */}
      <GeneratingOverlay
        isOpen={isGenerating}
        onAbort={() => setIsGenerating(false)}
        minStageDurationMs={400}
      />

      {/* Zero Overwrite Review Gate Modal (UI 09) */}
      <ReviewGateModal
        isOpen={isReviewModalOpen}
        gameSpec={currentGameSpec}
        diffCounters={currentDiffCounters || null}
        promptText={lastPromptText}
        onApply={handleApplyReview}
        onRegenerate={handleRegenerateFromReview}
        onClose={() => setIsReviewModalOpen(false)}
      />

      {/* Error Recovery Dialog (UI 11) */}
      <ErrorRecoveryDialog
        isOpen={isErrorModalOpen}
        errorCode={errorCode}
        errorMessage={errorMessage || undefined}
        onRetry={() => {
          setIsErrorModalOpen(false);
          if (lastPromptText) handleGenerate(lastPromptText);
        }}
        onEditPrompt={() => {
          setIsErrorModalOpen(false);
          setIsCopilotOpen(true);
        }}
        onClose={() => setIsErrorModalOpen(false)}
      />

      {/* Rate Limit / Fair Usage Countdown Modal (UI 19) */}
      <RateLimitCountdownModal
        isOpen={isRateLimitModalOpen}
        initialSeconds={rateLimitSeconds}
        onRetry={() => {
          setIsRateLimitModalOpen(false);
          if (lastPromptText) handleGenerate(lastPromptText);
        }}
        onClose={() => setIsRateLimitModalOpen(false)}
      />
    </div>
  );
};
