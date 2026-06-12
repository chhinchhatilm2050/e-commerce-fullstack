import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import kh from './locales/kh.json';

export type MessageSchema = typeof en;
export type SupportedLocale = 'en' | 'kh';

const savedLocale = localStorage.getItem('chhatstore_locale') || 'en';
const i18n = createI18n<[MessageSchema], SupportedLocale>({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, kh },
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      },
    },
    kh: {
      currency: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      },
    },
  },
});

export default i18n;
