import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  ScratchBlockMeta,
  ScratchCategoryKey,
  ScratchBlockSnippet,
  SCRATCH_CATEGORY_COLORS,
} from './ScratchBlockSnippet';

export interface BlockHelpGuideModalProps {
  isOpen: boolean;
  initialTab?: 'prompting' | 'blocks' | 'storage' | 'troubleshooting';
  onClose: () => void;
}

// Koleksi Balok Resmi Scratch 3.0 dari repositori scratchfoundation/scratch-blocks & scratch-vm
export const OFFICIAL_SCRATCH_BLOCKS: ScratchBlockMeta[] = [
  // 1. Motion
  {
    opcode: 'motion_movesteps',
    category: 'motion',
    shape: 'stack',
    label: 'gerak (10) langkah',
    description: 'Menggerakkan sprite maju sesuai arah hadap saat ini.',
  },
  {
    opcode: 'motion_gotoxy',
    category: 'motion',
    shape: 'stack',
    label: 'pergi ke x: (0) y: (0)',
    description: 'Menempatkan sprite pada koordinat 2D panggung Scratch secara instan.',
  },
  {
    opcode: 'motion_pointtowards',
    category: 'motion',
    shape: 'stack',
    label: 'mengarah ke [penunjuk-mouse v]',
    description: 'Memutar arah hadap sprite mengikuti kursor mouse pemain.',
  },
  {
    opcode: 'motion_xposition',
    category: 'motion',
    shape: 'reporter',
    label: 'posisi x',
    description: 'Mengembalikan koordinat horizontal sprite saat ini (-240 s/d 240).',
  },

  // 2. Looks
  {
    opcode: 'looks_sayforsecs',
    category: 'looks',
    shape: 'stack',
    label: 'katakan [Halo!] selama (2) detik',
    description: 'Menampilkan gelembung balon ucapan di atas kepala sprite.',
  },
  {
    opcode: 'looks_switchcostumeto',
    category: 'looks',
    shape: 'stack',
    label: 'ganti kostum ke [kostum2 v]',
    description: 'Mengubah tampilan visual sprite ke kostum animasi berikutnya.',
  },

  // 3. Sound
  {
    opcode: 'sound_playuntildone',
    category: 'sound',
    shape: 'stack',
    label: 'mainkan suara [pop v] sampai selesai',
    description: 'Memutar efek suara SFX sintetis dan menunggu audio rampung.',
  },

  // 4. Events
  {
    opcode: 'event_whenflagclicked',
    category: 'event',
    shape: 'hat',
    label: 'ketika bendera hijau diklik',
    description: 'Pemicu utama yang memulai eksekusi skrip saat game dijalankan.',
  },
  {
    opcode: 'event_whenkeypressed',
    category: 'event',
    shape: 'hat',
    label: 'ketika tombol [spasi v] ditekan',
    description: 'Pemicu interaksi keyboard dari pemain (panah, spasi, awsd).',
  },

  // 5. Control
  {
    opcode: 'control_forever',
    category: 'control',
    shape: 'c-block',
    label: 'selamanya',
    description: 'Game loop utama yang menjalankan balok di dalamnya tanpa henti.',
  },
  {
    opcode: 'control_if',
    category: 'control',
    shape: 'c-block',
    label: 'jika < ... > maka',
    description: 'Pemeriksaan kondisi logika; mengeksekusi aksi jika bernilai True.',
  },

  // 6. Sensing
  {
    opcode: 'sensing_touchingobject',
    category: 'sensing',
    shape: 'boolean',
    label: 'menyentuh [Sprite2 v] ?',
    description: 'Mendeteksi tabrakan fisik (collision detection) antar sprite.',
  },

  // 7. Operators
  {
    opcode: 'operator_random',
    category: 'operator',
    shape: 'reporter',
    label: 'pilih acak (1) sampai (10)',
    description: 'Menghasilkan angka acak (RNG) untuk posisi spawn atau skor.',
  },
  {
    opcode: 'operator_equals',
    category: 'operator',
    shape: 'boolean',
    label: '(Skor) = (10)',
    description: 'Memeriksa kesetaraan nilai variabel untuk aturan kemenangan.',
  },

  // 8. Variables
  {
    opcode: 'data_setvariableto',
    category: 'variable',
    shape: 'stack',
    label: 'atur [Skor v] ke (0)',
    description: 'Menginisialisasi nilai variabel game saat awal permainan.',
  },
  {
    opcode: 'data_changevariableby',
    category: 'variable',
    shape: 'stack',
    label: 'ubah [Skor v] sebesar (1)',
    description: 'Menambah atau mengurangi poin skor saat menangkap target.',
  },
];

export const BlockHelpGuideModal: React.FC<BlockHelpGuideModalProps> = ({
  isOpen,
  initialTab = 'prompting',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'prompting' | 'blocks' | 'storage' | 'troubleshooting'>(initialTab);
  const [selectedBlockCategory, setSelectedBlockCategory] = useState<ScratchCategoryKey | 'all'>('all');
  const [searchBlockQuery, setSearchBlockQuery] = useState('');

  if (!isOpen) return null;

  const filteredBlocks = OFFICIAL_SCRATCH_BLOCKS.filter((block) => {
    const matchesCategory =
      selectedBlockCategory === 'all' || block.category === selectedBlockCategory;
    const matchesQuery =
      !searchBlockQuery.trim() ||
      block.label.toLowerCase().includes(searchBlockQuery.toLowerCase()) ||
      block.opcode.toLowerCase().includes(searchBlockQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchBlockQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pusat Bantuan & Panduan Balok Scratch 3.0"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-4 max-h-[calc(85vh-120px)] overflow-y-auto pr-1">
        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-1.5 border-b border-gray-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('prompting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'prompting'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>💡</span> Cara Menulis Prompt AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('blocks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'blocks'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🧩</span> Glosarium Balok Scratch 3.0
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'storage'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📦</span> Alur Kerja & Ekspor .sb3
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('troubleshooting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'troubleshooting'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🔧</span> Troubleshooting
          </button>
        </div>

        {/* TAB 1: PROMPT ENGINEERING BEST PRACTICES */}
        {activeTab === 'prompting' && (
          <div className="flex flex-col gap-4 py-1">
            <div className="bg-[#f0f4f8] border border-blue-200 rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-[#006194] mb-1">
                Pedoman Formulasi Instruksi AI Copilot
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ardena Playground menggunakan Hexa-Cluster AI Cascading yang memetakan instruksi teks Anda menjadi pohon sintaks abstrak (AST) Scratch 3.0 asli. Ikuti 3 prinsip berikut agar hasil rakitan balok presisi:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Prinsip 1 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#006194]" />
                    <span className="text-[11px] font-bold text-[#006194] uppercase tracking-wider">
                      Prinsip 1
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mb-1">
                    Spesifik Koordinat 2D (Sumbu X/Y)
                  </h4>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                    Sebutkan posisi awal sprite dan arah gerak secara jelas (contoh: x: 0, y: -120).
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-[11px] text-emerald-900 font-medium">
                  ✓ "Buat apel jatuh dari y:180 ke y:-180 secara acak."
                </div>
              </div>

              {/* Prinsip 2 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#006194]" />
                    <span className="text-[11px] font-bold text-[#006194] uppercase tracking-wider">
                      Prinsip 2
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mb-1">
                    Aturan Menang & Kalah Terukur
                  </h4>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                    Jelaskan kondisi angka kemenangan (contoh: skor 10) dan hukuman sentuhan rintangan.
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-[11px] text-emerald-900 font-medium">
                  ✓ "Jika sentuh bintang skor +1, jika sentuh bom game over."
                </div>
              </div>

              {/* Prinsip 3 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#006194]" />
                    <span className="text-[11px] font-bold text-[#006194] uppercase tracking-wider">
                      Prinsip 3
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mb-1">
                    Fokus Pada Mekanika Inti
                  </h4>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                    Mulai dengan gameplay sederhana sebelum meminta fitur kompleks bertingkat.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 p-2 rounded-xl text-[11px] text-red-900 font-medium">
                  ✕ Hindari: "Buatkan game RPG open world 3D online."
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OFFICIAL SCRATCH 3.0 BLOCKS GLOSSARY */}
        {activeTab === 'blocks' && (
          <div className="flex flex-col gap-3 py-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Category selector pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedBlockCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedBlockCategory === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Semua ({OFFICIAL_SCRATCH_BLOCKS.length})
                </button>
                {(Object.keys(SCRATCH_CATEGORY_COLORS) as ScratchCategoryKey[]).map((catKey) => {
                  const cfg = SCRATCH_CATEGORY_COLORS[catKey];
                  const isSelected = selectedBlockCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSelectedBlockCategory(catKey)}
                      style={{
                        backgroundColor: isSelected ? cfg.primary : '#f3f4f6',
                        color: isSelected ? cfg.text : '#4b5563',
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-xs"
                    >
                      {cfg.labelId.split(' ')[0]}
                    </button>
                  );
                })}
              </div>

              {/* Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari balok / opcode..."
                  value={searchBlockQuery}
                  onChange={(e) => setSearchBlockQuery(e.target.value)}
                  className="w-full sm:w-48 pl-7 pr-3 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 outline-none focus:border-[#006194]"
                />
                <span className="absolute left-2 top-1.5 text-xs text-gray-400">🔍</span>
              </div>
            </div>

            {/* Official Source Reference Note */}
            <div className="p-2.5 bg-[#f7f9fb] border border-gray-200 rounded-xl flex items-center justify-between text-[11px] text-gray-500">
              <span>
                🏛️ Standar resmi: <strong>scratchfoundation/scratch-blocks</strong> & <strong>scratch-vm</strong>
              </span>
              <a
                href="https://github.com/scratchfoundation/scratch-blocks"
                target="_blank"
                rel="noreferrer"
                className="text-[#006194] font-bold hover:underline"
              >
                GitHub Resmi ↗
              </a>
            </div>

            {/* Grid of Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBlocks.map((block) => (
                <div
                  key={block.opcode}
                  className="bg-white border border-gray-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs hover:border-[#006194]/40 transition-colors"
                >
                  <div className="mb-2">
                    <ScratchBlockSnippet block={block} />
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-2 pt-2 border-t border-gray-100">
                    {block.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STORAGE & EXPORT */}
        {activeTab === 'storage' && (
          <div className="flex flex-col gap-3 py-1 text-xs text-gray-700 leading-relaxed">
            <div className="bg-[#f0f4f8] border border-blue-200 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#006194] mb-1">
                Kemandirian Data Offline di IndexedDB
              </h3>
              <p className="text-xs text-gray-600">
                Ardena Playground dirancang 100% tanpa database server untuk menjamin privasi Anda. Seluruh kode, gambar sprite, dan variabel game Anda disimpan langsung di browser lokal Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-2xl mb-2 block">💾</span>
                <h4 className="font-bold text-gray-900 mb-1">Penyimpanan Lokal Otomatis</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Setiap perubahan disimpan otomatis ke IndexedDB peramban Anda. Anda dapat membuka kembali game melalui menu <em>Pustaka Proyek</em>.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-2xl mb-2 block">📦</span>
                <h4 className="font-bold text-gray-900 mb-1">Ekspor Berkas .sb3 Standar</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Berkas <code>.sb3</code> yang Anda unduh adalah arsip ZIP standar Scratch 3.0 yang dapat langsung dimuat di situs resmi <strong>scratch.mit.edu</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TROUBLESHOOTING */}
        {activeTab === 'troubleshooting' && (
          <div className="flex flex-col gap-3 py-1 text-xs text-gray-700 leading-relaxed">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col gap-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <span>🔌</span> Backend Port 3001 Tidak Terhubung
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Pastikan server backend lokal Anda aktif di terminal dengan perintah <code>npm run dev</code> di dalam direktori <code>backend/</code>.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col gap-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <span>⏱️</span> Hitung Mundur Rate Limit (15 Detik)
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Jika kuota permintaan per menit AI terlampaui, sistem akan menampilkan hitung mundur 15 detik. Tombol akan otomatis terbuka kembali setelah waktu habis.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#006194] text-white hover:bg-[#004e77] transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </Modal>
  );
};

