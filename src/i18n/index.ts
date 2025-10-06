import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locals/ar.json';
import en from './locals/en.json';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: 'ar', // default language
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
