export const locales = [
  'fr', 'en', 'es', 'de', 'ar', 'ja', 'zh'
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  ar: 'العربية',
  zh: '中文',
  ja: '日本語',
};
