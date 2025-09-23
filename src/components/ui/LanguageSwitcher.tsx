"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { locales, localeNames, localeFlags, getLocaleFromPathname, removeLocaleFromPathname, type Locale } from '@/lib/i18n-config';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = getLocaleFromPathname(pathname);
  const currentLanguage = {
    code: currentLocale,
    name: localeNames[currentLocale],
    flag: localeFlags[currentLocale]
  };

  const getLocalizedPath = (locale: Locale) => {
    const pathWithoutLocale = removeLocaleFromPathname(pathname);

    // For default locale (Thai), don't add locale prefix
    if (locale === 'th') {
      return pathWithoutLocale === '/' ? '/' : pathWithoutLocale;
    }

    // For other locales, add locale prefix
    return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Languages className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.name}</span>
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 bg-base-100 border border-base-300 rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px]"
          >
            {locales.map((locale) => (
              <Link
                key={locale}
                href={getLocalizedPath(locale)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-left hover:bg-base-200 transition-colors duration-200 ${
                  locale === currentLocale ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <span className="text-lg">{localeFlags[locale]}</span>
                <span className="text-sm font-medium">{localeNames[locale]}</span>
                {locale === currentLocale && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 rounded-full bg-primary"
                  />
                )}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}