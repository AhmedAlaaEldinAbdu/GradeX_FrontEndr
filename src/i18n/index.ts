import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locals/ar.json';
import en from './locals/en.json';
import ru from './locals/ru.json';
import de from './locals/de.json';
import fr from './locals/fr.json';

export const SUPPORTED_LANGUAGES = ['ar', 'en', 'ru', 'de', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'gradex-language';

const getSavedLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'ar';

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && (SUPPORTED_LANGUAGES as readonly string[]).includes(saved)) {
    return saved as SupportedLanguage;
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
    ru: { translation: ru },
    de: { translation: de },
    fr: { translation: fr },
  },
  lng: savedLanguage,
  fallbackLng: {
    ar: ['en'],
    ru: ['en'],
    de: ['en'],
    fr: ['en'],
    default: ['en'],
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
