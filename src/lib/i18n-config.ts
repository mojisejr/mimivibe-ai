export type Locale = 'th' | 'en';

export const locales: Locale[] = ['th', 'en'];
export const defaultLocale: Locale = 'th';

export const localeNames: Record<Locale, string> = {
  th: 'ไทย',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  th: '🇹🇭',
  en: '🇺🇸',
};

export function getLocaleFromPathname(pathname: string): Locale {
  // Check if pathname starts with a locale
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

export function removeLocaleFromPathname(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}