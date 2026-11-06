import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '', compact = false }) => {
  const { locale, setLocale } = useI18n();

  return (
    <div
      role="group"
      aria-label="Pilih Bahasa / Select Language"
      className={`inline-flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200 shadow-inner ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale('id')}
        aria-pressed={locale === 'id'}
        title="Bahasa Indonesia"
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1 ${
          locale === 'id'
            ? 'bg-white text-[#006194] shadow-sm font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>🇮🇩</span>
        {!compact && <span>ID</span>}
      </button>

      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        title="English"
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1 ${
          locale === 'en'
            ? 'bg-white text-[#006194] shadow-sm font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>🇬🇧</span>
        {!compact && <span>EN</span>}
      </button>
    </div>
  );
};
