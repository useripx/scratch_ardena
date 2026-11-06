import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { useI18n } from '../../contexts/I18nContext';

export interface TemplateCatalogViewProps {
  onSelectTemplate: (templateId: string) => void;
  onBackToHome?: () => void;
}

export interface TemplateItem {
  id: string;
  nameId: string;
  nameEn: string;
  genreId: string;
  genreEn: string;
  difficultyId: 'Pemula' | 'Menengah' | 'Lanjutan';
  difficultyEn: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyColor: string;
  icon: string;
  descriptionId: string;
  descriptionEn: string;
  featuresId: string[];
  featuresEn: string[];
}

export const OFFICIAL_TEMPLATES: TemplateItem[] = [
  {
    id: 'catching-game',
    nameId: 'Catching Game (Tangkap Apel)',
    nameEn: 'Catching Game (Apple Catcher)',
    genreId: 'Arcade • Refleks',
    genreEn: 'Arcade • Reflex',
    difficultyId: 'Pemula',
    difficultyEn: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '🍎',
    descriptionId:
      'Pemain menggerakkan keranjang ke kiri dan kanan untuk menangkap apel yang jatuh dari langit. Skor bertambah setiap apel tertangkap.',
    descriptionEn:
      'Player moves a basket left and right to catch falling apples. Score increases with every apple caught.',
    featuresId: ['Keranjang pemain dengan kontrol panah', 'Apel jatuh dengan kecepatan konstan', 'Variabel Skor dinamis', 'Efek suara tangkap'],
    featuresEn: ['Player basket with arrow controls', 'Apples fall with constant speed', 'Dynamic Score variable', 'Catch sound effect'],
  },
  {
    id: 'maze-adventure',
    nameId: 'Maze Adventure (Labirin Mistis)',
    nameEn: 'Maze Adventure (Mystic Maze)',
    genreId: 'Petualangan • Puzzle',
    genreEn: 'Adventure • Puzzle',
    difficultyId: 'Menengah',
    difficultyEn: 'Intermediate',
    difficultyColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🧭',
    descriptionId:
      'Jelajahi labirin penuh tantangan, hindari jebakan dan dinding, kumpulkan kunci misterius untuk membuka gerbang kemenangan.',
    descriptionEn:
      'Navigate a challenging maze, avoid traps and wall collisions, collect keys to unlock the exit portal.',
    featuresId: ['Kontrol 4 arah (WASD / Panah)', 'Deteksi tabrakan dinding sensor', 'Sistem Kunci & Pintu Keluar', 'Timer hitung mundur'],
    featuresEn: ['4-way controls (WASD / Arrows)', 'Wall collision sensor detection', 'Key & Exit Door system', 'Countdown timer'],
  },
  {
    id: 'space-shooter',
    nameId: 'Space Shooter (Pertahanan Bintang)',
    nameEn: 'Space Shooter (Star Defense)',
    genreId: 'Aksi • Antariksa',
    genreEn: 'Action • Sci-Fi',
    difficultyId: 'Lanjutan',
    difficultyEn: 'Advanced',
    difficultyColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🚀',
    descriptionId:
      'Kendalikan pesawat tempur luar angkasa, tembakkan laser untuk menghancurkan asteroid dan armada musuh sebelum menabrak Bumi.',
    descriptionEn:
      'Pilot a spaceship, fire laser blasts to destroy asteroids and enemy waves before they collide with Earth.',
    featuresId: ['Pesawat dengan peluru laser kloning', 'Musuh asteroid berkecepatan acak', 'Sistem Nyawa (3 Lives) & Game Over', 'Efek suara ledakan'],
    featuresEn: ['Spaceship with cloned laser projectiles', 'Random speed asteroid obstacles', 'Lives system (3 Lives) & Game Over', 'Explosion sound effects'],
  },
];

export const TemplateCatalogView: React.FC<TemplateCatalogViewProps> = ({
  onSelectTemplate,
  onBackToHome,
}) => {
  const { locale } = useI18n();
  const isEn = locale === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
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

  const difficultyFilters = [
    { key: 'all', label: isEn ? 'All' : 'Semua' },
    { key: 'beginner', label: isEn ? 'Beginner' : 'Pemula' },
    { key: 'intermediate', label: isEn ? 'Intermediate' : 'Menengah' },
    { key: 'advanced', label: isEn ? 'Advanced' : 'Lanjutan' },
  ];

  const filteredTemplates = OFFICIAL_TEMPLATES.filter((tpl) => {
    const name = isEn ? tpl.nameEn : tpl.nameId;
    const desc = isEn ? tpl.descriptionEn : tpl.descriptionId;
    const genre = isEn ? tpl.genreEn : tpl.genreId;

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      (selectedDifficulty === 'beginner' && tpl.difficultyId === 'Pemula') ||
      (selectedDifficulty === 'intermediate' && tpl.difficultyId === 'Menengah') ||
      (selectedDifficulty === 'advanced' && tpl.difficultyId === 'Lanjutan');

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
              {isEn ? '← Back to Dashboard' : '← Kembali ke Dashboard'}
            </button>
          )}
          <h1 className="text-3xl font-extrabold text-[#191c1e] tracking-tight">
            {isEn ? 'Official Game Template Blueprints' : 'Katalog Template Game Resmi'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEn
              ? 'Select verified and balanced game blueprints ready to playtest or develop together with AI.'
              : 'Pilih kerangka game yang telah divalidasi dan seimbang untuk langsung diuji atau dikembangkan bersama AI.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={isEn ? 'Search game templates...' : 'Cari template game...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] w-full sm:w-64"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {difficultyFilters.map((diff) => (
          <button
            key={diff.key}
            type="button"
            onClick={() => setSelectedDifficulty(diff.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedDifficulty === diff.key
                ? 'bg-[#006194] text-white shadow-sm'
                : 'bg-gray-200/70 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 text-center">
          <span className="text-4xl mb-3">🔍</span>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {isEn ? 'No matching templates found' : 'Tidak ada template yang cocok'}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {isEn
              ? 'Try different keywords or adjust the difficulty filter.'
              : 'Coba kata kunci lain atau ubah filter tingkat kesulitan.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('all');
            }}
            className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200"
          >
            {isEn ? 'Reset Search' : 'Reset Pencarian'}
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
                    {isEn ? tpl.difficultyEn : tpl.difficultyId}
                  </span>
                </div>

                {/* Genre & Title */}
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {isEn ? tpl.genreEn : tpl.genreId}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#006194] transition-colors">
                  {isEn ? tpl.nameEn : tpl.nameId}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {isEn ? tpl.descriptionEn : tpl.descriptionId}
                </p>

                {/* Feature List */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100 mb-6 flex-grow">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                    {isEn ? 'Core Components:' : 'Komponen Utama:'}
                  </span>
                  {(isEn ? tpl.featuresEn : tpl.featuresId).map((feat, idx) => (
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
                  <span>{isEn ? '🚀 Use This Template' : '🚀 Gunakan Template Ini'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
