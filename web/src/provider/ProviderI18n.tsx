import React, { createContext, useState, useEffect } from 'react';
import { i18n, Languages, Translation } from '@/i18n';

type I18nContextType = {
  t: (key: string, params?: Record<string, string>) => string;
  setLanguage: (lang: Languages) => void;
  currentLanguage: Languages;
};

export const I18nContext = createContext<I18nContextType | null>(null);

export const ProviderI18n: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Languages>(i18n.getCurrentLanguage());

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Languages | null;
    if(savedLang && savedLang !== currentLanguage) {
      i18n.setLanguage(savedLang);
      setCurrentLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Languages) => {
    i18n.setLanguage(lang);
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const value = {
    t: (key: string, params?: Record<string, string>) => i18n.t(key, params),
    setLanguage: handleSetLanguage,
    currentLanguage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
