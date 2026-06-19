import en from './en.json';
import ja from './ja.json';

export type Locale = 'ja' | 'en';
const dicts = { ja, en } as const;

export function getDict(locale: Locale) {
  return dicts[locale];
}

export function t(locale: Locale, key: string): string {
  const parts = key.split('.');
  let cur: unknown = dicts[locale];
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      throw new Error(`i18n key not found: ${key} (${locale})`);
    }
  }
  if (typeof cur !== 'string') throw new Error(`i18n key not a string: ${key}`);
  return cur;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'ja' ? 'en' : 'ja';
}
