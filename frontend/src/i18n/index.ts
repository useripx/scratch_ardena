import { id, Translations } from './id';
import { en } from './en';

export type Locale = 'id' | 'en';
export { id, en };
export type { Translations };

export const dictionaries: Record<Locale, Translations> = {
  id,
  en,
};

/**
 * Mengambil teks terjemahan berdasarkan path berpemisah titik (contoh: 'common.save')
 * dengan dukungan penggantian parameter {param} dan fallback otomatis ke Bahasa Indonesia.
 */
export function getTranslation(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>
): string {
  const dict = dictionaries[locale] || dictionaries.id;
  const parts = path.split('.');
  
  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback ke dictionary 'id'
      let fallbackCurrent: any = dictionaries.id;
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbPart];
        } else {
          return path; // Jika tetap tidak ditemukan, kembalikan key
        }
      }
      current = fallbackCurrent;
      break;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  let result = current;
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }
  }

  return result;
}

