import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('krishisetu_lang') || 'en'
  );

  const changeLanguage = async (langCode) => {
    i18n.changeLanguage(langCode);
    setCurrentLanguage(langCode);
    localStorage.setItem('krishisetu_lang', langCode);

    // Sync with backend profile if logged in
    try {
      if (localStorage.getItem('krishisetu_token')) {
        await api.put('/auth/preferences', { preferredLanguage: langCode });
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
