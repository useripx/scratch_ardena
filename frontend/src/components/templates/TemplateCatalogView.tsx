import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';

export interface TemplateCatalogViewProps {
  onSelectTemplate: (templateId: string) => void;
  onBackToHome?: () => void;
}

export interface TemplateItem {
  id: string;
  name: string;
  genre: string;
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan';
  difficultyColor: string;
  icon: string;
  description: string;
  features: string[];
}

export const OFFICIAL_TEMPLATES: TemplateItem[] = [
  {
    id: 'catching-game',
    name: 'Catching Game (Tangkap Apel)',
    genre: 'Arcade • Refleks',
    difficulty: 'Pemula',
    difficultyColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '🍎',
    description:
      'Pemain menggerakkan keranjang ke kiri dan kanan untuk menangkap apel yang jatuh dari langit. Skor bertambah setiap apel tertangkap.',
    features: ['Keranjang pemain dengan kontrol panah', 'Apel jatuh dengan kecepatan konstan', 'Variabel Skor dinamis', 'Efek suara tangkap'],
  },
  {
    id: 'maze-adventure',
    name: 'Maze Adventure (Labirin Mistis)',
    genre: 'Petualangan • Puzzle',
    difficulty: 'Menengah',
    difficultyColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🧭',
    description:
      'Jelajahi labirin penuh tantangan, hindari jebakan dan dinding, kumpulkan kunci misterius untuk membuka gerbang kemenangan.',
    features: ['Kontrol 4 arah (WASD / Panah)', 'Deteksi tabrakan dinding sensor', 'Sistem Kunci & Pintu Keluar', 'Timer hitung mundur'],
  },
  {
    id: 'space-shooter',
    name: 'Space Shooter (Pertahanan Bintang)',
    genre: 'Aksi • Antariksa',
    difficulty: 'Lanjutan',
    difficultyColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🚀',
    description:
      'Kendalikan pesawat tempur luar angkasa, tembakkan laser untuk menghancurkan asteroid dan armada musuh sebelum menabrak Bumi.',
    features: ['Pesawat dengan peluru laser kloning', 'Musuh asteroid berkecepatan acak', 'Sistem Nyawa (3 Lives) & Game Over', 'Efek suara ledakan'],
  },
];

export const TemplateCatalogView: React.FC<TemplateCatalogViewProps> = ({
  onSelectTemplate,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Semua');
  const [supportedBackendTemplates, setSupportedBackendTemplates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiService
      .getCapabilities()
      .then((data) => {
        if (isMounted && data?.templates) {
          const keys = data.templates.map((t) => t.key);
          setSupportedBackendTemplates(keys);
        }
      })
      .catch(() => {
        // Fallback to offline defaults
        if (isMounted) {
          setSupportedBackendTemplates(['catching-game', 'maze-adventure', 'space-shooter']);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTemplates = OFFICIAL_TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === 'Semua' || tpl.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="w-full min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006194] hover:underline mb-2"
            >
              ← Kembali ke Dashboard
            </button>
          )}
          <h1 className="text-3xl font-extrabold text-[#191c1e] tracking-tight">
            Katalog Template Game Resmi
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Pilih kerangka game yang telah divalidasi dan seimbang untuk langsung diuji atau dikembangkan bersama AI.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Cari template game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] w-full sm:w-64"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {['Semua', 'Pemula', 'Menengah', 'Lanjutan'].map((diff) => (
          <button
            key={diff}
            type="button"
            onClick={() => setSelectedDifficulty(diff)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedDifficulty === diff
                ? 'bg-[#006194] text-white shadow-sm'
                : 'bg-gray-200/70 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 text-center">
          <span className="text-4xl mb-3">🔍</span>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Tidak ada template yang cocok
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Coba kata kunci lain atau ubah filter tingkat kesulitan.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('Semua');
            }}
            className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => {
            const isSupported =
              supportedBackendTemplates.length === 0 ||
              supportedBackendTemplates.includes(tpl.id);

            return (
              <div
                key={tpl.id}
                className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all overflow-hidden p-6 group"
              >
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 text-3xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    {tpl.icon}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${tpl.difficultyColor}`}
                  >
                    {tpl.difficulty}
                  </span>
                </div>

                {/* Genre & Title */}
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {tpl.genre}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#006194] transition-colors">
                  {tpl.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {tpl.description}
                </p>

                {/* Feature List */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100 mb-6 flex-grow">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                    Komponen Utama:
                  </span>
                  {tpl.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-xs text-gray-700"
                    >
                      <span className="text-[#006194] font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Action */}
                <button
                  type="button"
                  disabled={!isSupported || isLoading}
                  onClick={() => onSelectTemplate(tpl.id)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                    isSupported
                      ? 'bg-[#006194] text-white hover:bg-[#007bb9] hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>🚀 Gunakan Template Ini</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
