// Import locale data
import thCommon from '../../locales/th/common.json';
import enCommon from '../../locales/en/common.json';
import thPages from '../../locales/th/pages.json';
import enPages from '../../locales/en/pages.json';
import { type Locale } from './i18n-config';

export type TranslationKey = string;

// Combined translation resources
const resources = {
  th: {
    common: thCommon,
    pages: thPages,
  },
  en: {
    common: enCommon,
    pages: enPages,
  },
} as const;

// Type for nested object keys
type NestedKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeys<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

// Get all possible translation keys
type CommonKeys = NestedKeys<typeof thCommon>;
type PageKeys = NestedKeys<typeof thPages>;
export type AllTranslationKeys = `common.${CommonKeys}` | `pages.${PageKeys}`;

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Main translation function
export function translate(
  key: AllTranslationKeys,
  locale: Locale = 'th',
  options?: { [key: string]: string | number }
): string {
  const [namespace, ...keyPath] = key.split('.');
  const fullKey = keyPath.join('.');

  let value: string | undefined;

  if (namespace === 'common') {
    value = getNestedValue(resources[locale].common, fullKey);
  } else if (namespace === 'pages') {
    value = getNestedValue(resources[locale].pages, fullKey);
  }

  // Fallback to English if Thai translation is missing
  if (!value && locale === 'th') {
    if (namespace === 'common') {
      value = getNestedValue(resources.en.common, fullKey);
    } else if (namespace === 'pages') {
      value = getNestedValue(resources.en.pages, fullKey);
    }
  }

  // Final fallback to the key itself
  if (!value) {
    console.warn(`Translation missing for key: ${key} (locale: ${locale})`);
    return key;
  }

  // Replace variables in the translation
  if (options) {
    Object.entries(options).forEach(([variable, replacement]) => {
      value = value!.replace(new RegExp(`{{\\s*${variable}\\s*}}`, 'g'), String(replacement));
    });
  }

  return value;
}

// Custom hook for translations (for client components)
export function useTranslation(locale: Locale = 'th') {
  const t = (key: AllTranslationKeys, options?: { [key: string]: string | number }) =>
    translate(key, locale, options);

  return {
    locale,
    t,
  };
}

// Utility functions for common operations
export function formatCurrency(amount: number, locale: Locale = 'th'): string {
  const symbol = translate('common.currency.symbol', locale);

  if (locale === 'th') {
    return `${amount.toLocaleString('th-TH')} ${translate('common.currency.thb', locale)}`;
  } else {
    return `${symbol}${amount.toLocaleString('en-US')}`;
  }
}

export function formatDateTime(date: Date, locale: Locale = 'th'): string {
  if (locale === 'th') {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } else {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}

export function getRelativeTime(date: Date, locale: Locale = 'th'): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    if (diffMins <= 1) {
      return translate('common.time.now', locale);
    }
    return translate('common.time.ago', locale, {
      time: `${diffMins} ${translate(diffMins === 1 ? 'common.time.minute' : 'common.time.minutes', locale)}`
    });
  } else if (diffHours < 24) {
    return translate('common.time.ago', locale, {
      time: `${diffHours} ${translate(diffHours === 1 ? 'common.time.hour' : 'common.time.hours', locale)}`
    });
  } else if (diffDays < 7) {
    return translate('common.time.ago', locale, {
      time: `${diffDays} ${translate(diffDays === 1 ? 'common.time.day' : 'common.time.days', locale)}`
    });
  } else {
    return formatDateTime(date, locale);
  }
}