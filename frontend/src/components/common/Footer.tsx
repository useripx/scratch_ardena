import React from 'react';
import { BrandLogo } from './BrandLogo';
import { useI18n } from '../../contexts/I18nContext';

export const Footer: React.FC = () => {
  const { locale } = useI18n();
  const isEn = locale === 'en';

  return (
    <footer className="w-full bg-[#f2f4f6] border-t border-gray-200/80 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <BrandLogo size={28} showText={false} />
            <span className="font-extrabold text-lg text-gray-900">
              Ardena Playground
            </span>
            <span className="text-xs bg-blue-100 text-[#006194] font-semibold px-2 py-0.5 rounded-full">
              v1.0.0 (Scratch 3.0 Compatible)
            </span>
          </div>
          <p className="text-sm text-gray-500 text-center md:text-left">
            {isEn
              ? 'Visual Programming Platform Powered by Scratch 3.0 & AI Copilot for All Ages.'
              : 'Platform Pemrograman Visual Berbasis Scratch 3.0 & AI Copilot untuk Semua Usia.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 font-medium">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
            {isEn
              ? '🔒 100% Client-Side Privacy (IndexedDB) • No Database Server'
              : '🔒 100% Penyimpanan Lokal di Browser (IndexedDB) • Tanpa Server Database'}
          </span>
        </div>

        <div className="text-xs text-gray-500 text-center md:text-right">
          {isEn
            ? 'Copyright © 2026 Yogi Ario. All rights reserved.'
            : 'Hak Cipta © 2026 Yogi Ario. Dilindungi oleh Undang-Undang.'}
        </div>
      </div>
    </footer>
  );
};
