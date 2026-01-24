import React, { ReactNode } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import de from './locales/de.json';

const LANGUAGE_KEY = '@promrkts_language';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
];

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
  es: { translation: es },
  pt: { translation: pt },
  zh: { translation: zh },
  ru: { translation: ru },
  tr: { translation: tr },
  de: { translation: de },
};

const deviceLanguage = getLocales()[0]?.languageCode || 'en';
const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);

i18n.use(initReactI18next).init({
  resources,
  lng: supportedCodes.includes(deviceLanguage) ? deviceLanguage : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
});

export const loadStoredLanguage = async () => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && supportedCodes.includes(stored)) {
      i18n.changeLanguage(stored);
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === stored);
      if (lang) {
        I18nManager.forceRTL(lang.rtl);
      }
    }
  } catch (e) {
    console.log('Failed to load language:', e);
  }
};

export const setLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
    const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    if (langConfig) {
      I18nManager.forceRTL(langConfig.rtl);
    }
  } catch (e) {
    console.log('Failed to save language:', e);
  }
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  React.useEffect(() => {
    loadStoredLanguage();
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default i18n;
