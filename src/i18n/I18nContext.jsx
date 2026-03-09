import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import fr from './fr.json';
import en from './en.json';

const I18nContext = createContext();

const TRANSLATIONS = { fr, en };

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() =>
    localStorage.getItem('aiguessr-locale') || 'fr'
  );

  const translations = TRANSLATIONS[locale] || TRANSLATIONS.fr;

  const t = useCallback((key, params) => {
    let str = key.split('.').reduce((obj, k) => obj?.[k], translations);
    if (str === undefined) return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replaceAll(`{${k}}`, v);
      });
    }
    return str;
  }, [translations]);

  // Helper pour le contenu bilingue (questions, etc.)
  // Lit field_fr / field_en avec fallback sur field
  const tContent = useCallback((obj, field) => {
    if (!obj) return '';
    const localized = obj[`${field}_${locale}`];
    if (localized !== undefined) return localized;
    return obj[field] ?? '';
  }, [locale]);

  const changeLocale = useCallback((newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('aiguessr-locale', newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    changeLocale(locale === 'fr' ? 'en' : 'fr');
  }, [locale, changeLocale]);

  const value = useMemo(() => ({
    t,
    tContent,
    locale,
    setLocale: changeLocale,
    toggleLocale
  }), [t, tContent, locale, changeLocale, toggleLocale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback pour les composants hors provider
    return {
      t: (key) => key,
      tContent: (obj, field) => obj?.[field] ?? '',
      locale: 'fr',
      setLocale: () => {},
      toggleLocale: () => {}
    };
  }
  return ctx;
}
