import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getTranslation } from '../i18n';
import { storageService } from '../services/storage.service';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'id',
  setLocale: () => {},
  t: (path: string, params?: Record<string, string | number>) => getTranslation('id', path, params),
});

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || 'id');

  useEffect(() => {
    if (!initialLocale) {
      storageService.getPreferences().then((prefs) => {
        if (prefs.language && (prefs.language === 'id' || prefs.language === 'en')) {
          setLocaleState(prefs.language);
        }
      }).catch(() => {
        // Fallback default 'id'
      });
    }
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    storageService.savePreferences({ language: newLocale }).catch((err) => {
      console.warn('[I18n] Gagal menyimpan preferensi bahasa ke storage:', err);
    });
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    return getTranslation(locale, path, params);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  return useContext(I18nContext);
};
