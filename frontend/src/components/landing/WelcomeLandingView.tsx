import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { ScratchSvgBlock } from '../scratch/ScratchSvgBlock';

export interface WelcomeLandingViewProps {
  onStartCreation: () => void;
  onExploreTemplates: () => void;
  onOpenTutorial?: () => void;
}

export const WelcomeLandingView: React.FC<WelcomeLandingViewProps> = ({
  onStartCreation,
  onExploreTemplates,
}) => {
  const { t, locale } = useI18n();
  const isEn = locale === 'en';

  return (
    <div className="w-full min-h-screen flex flex-col pt-20 bg-[#f7f9fb] text-[#191c1e]">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-12 py-12 lg:py-20 flex flex-col items-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d2e0fe] text-[#0d1c32] shadow-sm mb-6 border border-blue-200/50">
            <span className="text-[#006194] text-base">✨</span>
            <span className="text-xs font-bold tracking-wide uppercase">
              {t('landing.heroBadge')}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#191c1e] tracking-tight max-w-4xl leading-tight mb-6">
            {t('landing.heroTitlePre')}{' '}
            <span className="text-[#006194] underline decoration-blue-300 underline-offset-8">
              {t('landing.heroTitleHighlight')}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-[#3f4850] max-w-2xl mb-8 leading-relaxed font-normal">
            {t('landing.heroSubtitle')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-6">
            <button
              type="button"
              onClick={onStartCreation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#006194] text-white font-bold text-base shadow-lg hover:bg-[#007bb9] hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <span>{t('landing.btnStart')}</span>
            </button>
            <button
              type="button"
              onClick={onExploreTemplates}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-[#191c1e] font-semibold text-base border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <span>{t('landing.btnTemplates')}</span>
            </button>
          </div>

          {/* Trust Microcopy */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm mb-12">
            <span>🔒</span>
            <span>{t('landing.trustBadge')}</span>
          </div>

          {/* Tri-Pane Interactive Studio Mockup */}
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-gray-200/80 p-4 sm:p-6 text-left">
            {/* Mockup Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#f2f4f6] mb-4 border border-gray-200/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-2 text-xs font-bold text-gray-700">
                  {t('landing.canvasTitle')}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#006194] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#006194] animate-pulse" />
                {t('landing.aiActive')}
              </span>
            </div>

            {/* Inner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Prompt Kreator & Authentic Blocks */}
              <div className="md:col-span-6 flex flex-col gap-3 bg-[#f7f9fb] p-4 rounded-xl border border-gray-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t('landing.promptCreator')}
                  </span>
                  <span className="text-xs font-semibold text-[#006194]">
                    AI Copilot
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-800 italic leading-relaxed">
                    {t('landing.samplePrompt')}
                  </p>
                </div>

                {/* Diff Counter Pill */}
                <div className="p-2.5 bg-[#d2e0fe]/60 border border-blue-200 rounded-lg flex items-center justify-between text-xs font-semibold text-[#0d1c32]">
                  <span>🛡️ Review Gate:</span>
                  <span className="text-[#006194]">
                    +2 Sprite • +1 Skor • 0 Overwrite
                  </span>
                </div>

                {/* Synthesized Authentic Scratch Blocks Preview */}
                <div className="flex flex-col gap-1.5 mt-1 overflow-x-auto pb-2">
                  <span className="text-xs font-bold text-gray-600 mb-1">
                    {t('landing.generatedBlocksTitle')}
                  </span>

                  {/* Authentic Hat Block */}
                  <div className="transform origin-left hover:scale-[1.02] transition-transform">
                    <ScratchSvgBlock
                      category="event"
                      type="hat"
                      width={230}
                      height={44}
                      args={
                        isEn
                          ? [
                              { type: 'icon', value: '🚩' },
                              { type: 'text', value: 'when green flag clicked' },
                            ]
                          : [
                              { type: 'icon', value: '🚩' },
                              { type: 'text', value: 'ketika bendera hijau diklik' },
                            ]
                      }
                    />
                  </div>

                  {/* Authentic Stack Block (Variable) */}
                  <div className="-mt-1.5 transform origin-left hover:scale-[1.02] transition-transform">
                    <ScratchSvgBlock
                      category="variable"
                      type="stack"
                      width={220}
                      height={42}
                      args={
                        isEn
                          ? [
                              { type: 'text', value: 'set' },
                              { type: 'dropdown', value: 'Score' },
                              { type: 'text', value: 'to' },
                              { type: 'number-input', value: 0 },
                            ]
                          : [
                              { type: 'text', value: 'atur' },
                              { type: 'dropdown', value: 'Skor' },
                              { type: 'text', value: 'menjadi' },
                              { type: 'number-input', value: 0 },
                            ]
                      }
                    />
                  </div>

                  {/* Authentic C-Block Loop (Control) */}
                  <div className="-mt-1.5 transform origin-left hover:scale-[1.02] transition-transform">
                    <ScratchSvgBlock
                      category="control"
                      type="c-block"
                      width={230}
                      height={90}
                      args={
                        isEn
                          ? [{ type: 'text', value: 'forever' }]
                          : [{ type: 'text', value: 'selamanya' }]
                      }
                    >
                      <div className="pt-1 pl-1">
                        <ScratchSvgBlock
                          category="motion"
                          type="stack"
                          width={190}
                          height={38}
                          args={
                            isEn
                              ? [
                                  { type: 'text', value: 'move' },
                                  { type: 'number-input', value: 10 },
                                  { type: 'text', value: 'steps' },
                                ]
                              : [
                                  { type: 'text', value: 'gerak' },
                                  { type: 'number-input', value: 10 },
                                  { type: 'text', value: 'langkah' },
                                ]
                          }
                        />
                      </div>
                    </ScratchSvgBlock>
                  </div>
                </div>
              </div>

              {/* Right Column: Stage Canvas Preview */}
              <div className="md:col-span-6 flex flex-col justify-between bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden min-h-[280px] border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/20 text-white text-xs font-mono font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                      {isEn ? 'Score: 120' : 'Skor: 120'}
                    </span>
                    <span className="bg-red-500/80 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">
                      ❤️❤️❤️ {isEn ? 'Lives: 3' : 'Nyawa: 3'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    480 x 360 px
                  </span>
                </div>

                {/* Playful Canvas Visuals */}
                <div className="flex items-center justify-around py-8 z-10">
                  <div className="text-5xl animate-bounce drop-shadow-lg">🧑‍🚀</div>
                  <div className="text-4xl animate-pulse drop-shadow-lg">⭐</div>
                  <div className="text-4xl animate-spin drop-shadow-lg">☄️</div>
                </div>

                <div className="flex items-center justify-between z-10 border-t border-slate-800 pt-3 text-xs text-slate-400">
                  <span>{t('landing.stageReady')}</span>
                  <span className="text-emerald-400 font-bold">● 60 FPS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006194] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t('landing.workflowBadge')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            {t('landing.workflowTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-2xl flex items-center justify-center mb-4 text-[#006194]">
              💡
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              1. {isEn ? 'Describe Ideas in Natural Language' : 'Tulis Ide Bahasa Alami'}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isEn
                ? 'Type your game story and rules. No complex code required, our AI maps objects automatically.'
                : 'Ketik cerita dan aturan permainanmu. Tidak perlu memikirkan kode rumit, AI kami akan memetakan elemen objek secara otomatis.'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-2xl flex items-center justify-center mb-4 text-amber-600">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              2. {isEn ? 'Guaranteed AI Output Review' : 'Review Hasil AI Bergaransi'}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isEn
                ? 'Inspect block and sprite diff counters with complete control before changes are applied to the canvas.'
                : 'Lihat perubahan blok dan sprite dengan diff counters. Anda memegang kontrol penuh sebelum hasil diaplikasikan ke canvas.'}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center mb-4 text-emerald-600">
              🎮
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              3. {isEn ? 'Play in Native Scratch' : 'Mainkan di Scratch Asli'}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isEn
                ? 'Play games instantly on an authentic Scratch stage, modify blocks freely, and export unlimited native .sb3 files.'
                : 'Mainkan game seketika di panggung Scratch resmi, modifikasi balok sesukamu, dan ekspor ke file fisik .sb3 tanpa batas.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
