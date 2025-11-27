import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locals/ar.json';
import en from './locals/en.json';

const LANGUAGE_STORAGE_KEY = 'gradex-language';

const getSavedLanguage = (): 'ar' | 'en' => {
  if (typeof window === 'undefined') return 'ar';

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'ar' || saved === 'en') {
    return saved;
  }

  return 'ar';
};

const savedLanguage = getSavedLanguage();

if (typeof document !== 'undefined') {
  document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = savedLanguage;
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
