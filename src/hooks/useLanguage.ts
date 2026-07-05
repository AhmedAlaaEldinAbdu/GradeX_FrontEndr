import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY, type SupportedLanguage } from '@/i18n';

export type Language = SupportedLanguage;
export type Direction = 'rtl' | 'ltr';

interface UseLanguageReturn {
  currentLanguage: Language;
  direction: Direction;
  isRTL: boolean;
  isArabic: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const isSupportedLanguage = (value: string): value is Language =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

export const useLanguage = (): UseLanguageReturn => {
  const { i18n } = useTranslation();

  const rawLanguage = i18n.language || 'ar';
  const currentLanguage: Language = isSupportedLanguage(rawLanguage) ? rawLanguage : 'ar';
  const isArabic = currentLanguage === 'ar';
  const isRTL = isArabic;
  const direction: Direction = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;

    localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  }, [currentLanguage, direction]);

  const setLanguage = useCallback(
    (lang: Language) => {
      if (lang !== currentLanguage) {
        i18n.changeLanguage(lang);
      }
    },
    [i18n, currentLanguage]
  );

  const toggleLanguage = useCallback(() => {
    const newLang: Language = currentLanguage === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
  }, [currentLanguage, setLanguage]);

  return {
    currentLanguage,
    direction,
    isRTL,
    isArabic,
    toggleLanguage,
    setLanguage,
  };
};

export const getSavedLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ar';

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && isSupportedLanguage(saved)) {
    return saved;
  }

  return 'ar';
};

export default useLanguage;
