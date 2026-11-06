import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { id } from '../src/i18n/id';
import { en } from '../src/i18n/en';
import { getTranslation, dictionaries } from '../src/i18n';
import { I18nProvider, useI18n } from '../src/contexts/I18nContext';
import { LanguageToggle } from '../src/components/common/LanguageToggle';
import { storageService } from '../src/services/storage.service';

describe('Sub-Fase 09-B: Lokalisasi Dwibahasa (i18n: ID & EN)', () => {
  beforeEach(async () => {
    await storageService.clearAllData();
  });

  describe('1. Dictionary Symmetry & Completeness', () => {
    it('memastikan kamus ID dan EN memiliki struktur kunci yang 100% simetris', () => {
      const getKeys = (obj: any, prefix = ''): string[] => {
        return Object.keys(obj).reduce((acc: string[], key: string) => {
          const path = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            return [...acc, ...getKeys(obj[key], path)];
          }
          return [...acc, path];
        }, []);
      };

      const idKeys = getKeys(id).sort();
      const enKeys = getKeys(en).sort();

      expect(idKeys).toEqual(enKeys);
      expect(idKeys.length).toBeGreaterThan(20);
    });

    it('mendukung terminologi resmi Scratch Foundation dalam kamus EN', () => {
      expect(en.scratch.categories.motion).toBe('Motion');
      expect(en.scratch.categories.looks).toBe('Looks');
      expect(en.scratch.categories.sound).toBe('Sound');
      expect(en.scratch.categories.events).toBe('Events');
      expect(en.scratch.categories.control).toBe('Control');
      expect(en.scratch.categories.sensing).toBe('Sensing');
      expect(en.scratch.categories.operators).toBe('Operators');
      expect(en.scratch.categories.variables).toBe('Variables');
    });

    it('mendukung terminologi ramah anak Indonesia dalam kamus ID', () => {
      expect(id.scratch.categories.motion).toBe('Gerakan');
      expect(id.scratch.categories.looks).toBe('Tampilan');
      expect(id.scratch.categories.sound).toBe('Suara');
      expect(id.scratch.categories.events).toBe('Kejadian');
      expect(id.scratch.categories.control).toBe('Kontrol');
      expect(id.scratch.categories.sensing).toBe('Sensor');
      expect(id.scratch.categories.operators).toBe('Operator');
      expect(id.scratch.categories.variables).toBe('Variabel');
    });
  });

  describe('2. getTranslation Function Unit Tests', () => {
    it('mengembalikan teks terjemahan yang benar untuk kunci sederhana', () => {
      expect(getTranslation('id', 'common.save')).toBe('Simpan');
      expect(getTranslation('en', 'common.save')).toBe('Save');
    });

    it('mendukung substitusi parameter dinamis {key}', () => {
      const translated = getTranslation('id', 'importer.importSuccess', {
        title: 'Petualangan Kucing',
        sprites: 3,
        blocks: 15,
      });
      expect(translated).toContain('Petualangan Kucing');
      expect(translated).toContain('3 sprite');
      expect(translated).toContain('15 balok');
    });

    it('fallback ke Bahasa Indonesia jika kunci di kamus lain tidak ditemukan', () => {
      const translated = getTranslation('en', 'nonexistent.dummy.key');
      expect(translated).toBe('nonexistent.dummy.key');
    });
  });

  describe('3. I18nContext & LanguageToggle Component', () => {
    const TestConsumer: React.FC = () => {
      const { locale, t } = useI18n();
      return (
        <div>
          <span data-testid="current-locale">{locale}</span>
          <span data-testid="app-title">{t('common.appTitle')}</span>
          <span data-testid="save-btn">{t('common.save')}</span>
          <LanguageToggle />
        </div>
      );
    };

    it('menginisialisasi dengan Bahasa Indonesia secara default dan menyimpan ke storage saat diubah', async () => {
      render(
        <I18nProvider initialLocale="id">
          <TestConsumer />
        </I18nProvider>
      );

      expect(screen.getByTestId('current-locale').textContent).toBe('id');
      expect(screen.getByTestId('save-btn').textContent).toBe('Simpan');

      // Klik tombol English
      const enBtn = screen.getByTitle('English');
      fireEvent.click(enBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-locale').textContent).toBe('en');
        expect(screen.getByTestId('save-btn').textContent).toBe('Save');
      });

      // Verifikasi preferensi tersimpan di storage
      const prefs = await storageService.getPreferences();
      expect(prefs.language).toBe('en');
    });

    it('dapat beralih kembali dari English ke Bahasa Indonesia', async () => {
      render(
        <I18nProvider initialLocale="en">
          <TestConsumer />
        </I18nProvider>
      );

      expect(screen.getByTestId('current-locale').textContent).toBe('en');
      expect(screen.getByTestId('save-btn').textContent).toBe('Save');

      // Klik tombol Bahasa Indonesia
      const idBtn = screen.getByTitle('Bahasa Indonesia');
      fireEvent.click(idBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-locale').textContent).toBe('id');
        expect(screen.getByTestId('save-btn').textContent).toBe('Simpan');
      });
    });
  });
});
