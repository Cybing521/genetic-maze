// i18n Hook
import { useState, useEffect } from 'react';
import { translations, type Translations } from './translations';
import { loadLanguagePreference, saveLanguagePreference, type Language } from './languages';

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<Language>(loadLanguagePreference());
  const [t, setT] = useState<Translations>(translations[currentLang]);

  useEffect(() => {
    setT(translations[currentLang]);
  }, [currentLang]);

  const changeLanguage = (lang: Language) => {
    setCurrentLang(lang);
    saveLanguagePreference(lang);
  };

  return {
    t,
    currentLang,
    changeLanguage
  };
}

