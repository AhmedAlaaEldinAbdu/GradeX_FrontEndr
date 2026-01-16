import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

const LANGUAGE_STORAGE_KEY = 'gradex-language';

interface UseLanguageReturn {
  currentLanguage: Language;
  direction: Direction;
  isRTL: boolean;
  isArabic: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = (): UseLanguageReturn => {
  const { i18n } = useTranslation();

  const currentLanguage = (i18n.language || 'ar') as Language;
  const isRTL = currentLanguage === 'ar';
  const isArabic = currentLanguage === 'ar';
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
  if (saved === 'ar' || saved === 'en') {
    return saved;
  }

  return 'ar';
};

export default useLanguage;
