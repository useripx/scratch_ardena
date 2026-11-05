import React from 'react';
import { Modal } from '../common/Modal';

export interface ErrorRecoveryDialogProps {
  isOpen: boolean;
  errorCode?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onEditPrompt?: () => void;
  onClose: () => void;
}

interface ErrorDetails {
  title: string;
  description: string;
  tips: string[];
  icon: string;
}

function getErrorDetails(code?: string, rawMsg?: string): ErrorDetails {
  switch (code) {
    case 'PAYLOAD_TOO_LARGE':
      return {
        title: 'Instruksi Terlalu Panjang',
        description:
          'Panjang teks atau data yang dikirimkan melampaui batas payload 10 MB. Mohon persingkat instruksimu.',
        tips: [
          'Gunakan kalimat yang lebih padat dan langsung pada inti cerita.',
          'Hindari menyalin teks cerita yang sangat panjang sekaligus.',
        ],
        icon: '📦',
      };
    case 'INVALID_REQUEST_BODY':
    case 'VALIDATION_ERROR':
    case 'OUTPUT_VALIDATION_ERROR':
      return {
        title: 'Format Prompt Belum Sesuai',
        description:
          rawMsg ||
          'AI Copilot membutuhkan instruksi yang lebih jelas untuk merancang karakter dan kontrol game.',
        tips: [
          'Gunakan kata kerja aksi seperti "menangkap", "menghindari", atau "menembak".',
          'Sebutkan peran karakter utama (misal: "kucing", "astronot", atau "pesawat").',
          'Tentukan aturan menang atau kalah secara eksplisit.',
        ],
        icon: '✍️',
      };
    case 'AI_TIMEOUT':
      return {
        title: 'AI Membutuhkan Waktu Lebih Lama',
        description:
          'Proses perancangan logika melampaui batas waktu maksimal 45 detik karena antrean server atau prompt kompleks.',
        tips: [
          'Coba klik tombol "Coba Lagi Sekarang".',
          'Atau sederhanakan skenario game menjadi beberapa sprite terlebih dahulu.',
        ],
        icon: '⏳',
      };
    case 'NETWORK_ERROR':
      return {
        title: 'Koneksi ke Server Terputus',
        description:
          'Browser tidak dapat terhubung ke server backend lokal di port 3001. Pastikan backend sedang aktif.',
        tips: [
          'Periksa apakah server backend berjalan di terminal (`npm run dev` pada folder `backend/`).',
          'Pastikan tidak ada firewall yang memblokir port 3001.',
        ],
        icon: '🔌',
      };
    default:
      return {
        title: 'Kendala Sistem Tak Terduga',
        description:
          rawMsg ||
          'Terjadi kendala saat merakit balok Scratch. Tenang, proyek yang sudah ada tetap aman.',
        tips: [
          'Klik tombol "Coba Lagi" untuk meminta AI menyusun ulang logika.',
          'Gunakan salah satu template resmi kami jika ingin memulai lebih cepat.',
        ],
        icon: '🛡️',
      };
  }
}

export const ErrorRecoveryDialog: React.FC<ErrorRecoveryDialogProps> = ({
  isOpen,
  errorCode,
  errorMessage,
  onRetry,
  onEditPrompt,
  onClose,
}) => {
  if (!isOpen) return null;

  const details = getErrorDetails(errorCode, errorMessage);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pusat Bantuan & Pemulihan Cepat"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Error Mascot / Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-3xl flex items-center justify-center mb-3 shadow-inner border border-amber-200">
          {details.icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
          {details.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed max-w-sm mb-4">
          {details.description}
        </p>

        {/* Solution Tips Box */}
        <div className="w-full bg-[#f7f9fb] border border-gray-200 rounded-xl p-3.5 text-left mb-6 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            💡 Tips Pemulihan:
          </span>
          <ul className="flex flex-col gap-1.5 text-xs text-gray-700">
            {details.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-[#006194] font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
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

          <div className="flex items-center gap-2">
            {onEditPrompt && (
              <button
                type="button"
                onClick={onEditPrompt}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ✏️ Edit Prompt
              </button>
            )}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold shadow-md transition-all"
              >
                🔄 Coba Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
