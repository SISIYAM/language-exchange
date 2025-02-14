"use client";
import { createContext, useContext, useEffect, useState } from "react";
import en from "../translations/en/common.json";
import fr from "../translations/fr/common.json";
import it from "../translations/it/common.json";
 
export const LanguageContext = createContext();

const translations = { en, fr, it };

const getNestedTranslation = (obj, key) => {
  return key.split(".").reduce((res, part) => {
    if (res) return res[part];
    return null;
  }, obj);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLan] = useState("en");
  const [loader, setLoader] = useState(1);
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
      setLan(savedLang);
    } else {
      // Get the browser's language
      const browserLanguage = navigator.language || navigator.userLanguage;

      // Split the language code into language and region
      const [languageCode, regionCode] = browserLanguage.split("-");

      localStorage.setItem("lang", languageCode);
      setLan(languageCode);
      setLoader(loader + 1);
 
    }
    //   console.log(savedLang)
  }, [loader]);
  const setLanguage = (lan) => {
    localStorage.setItem("lang", lan);
    setLoader(loader + 1);
    // console.log(lan)
  };

  //   const t = (key) => translations[language][key] || key;
  const t = (key) => getNestedTranslation(translations[language], key) || key;

  return (
    <LanguageContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
