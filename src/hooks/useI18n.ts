import { usePathname } from 'next/navigation';
import { translate, type AllTranslationKeys } from '@/lib/i18n';
import { type Locale, getLocaleFromPathname, defaultLocale } from '@/lib/i18n-config';

/**
 * Simple i18n hook for App Router
 */
export function useI18n() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) || defaultLocale;

  const t = (key: AllTranslationKeys, options?: { [key: string]: string | number }) =>
    translate(key, locale, options);

  return {
    locale,
    t,
  };
}