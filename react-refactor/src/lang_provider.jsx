import React, { createContext, useContext, useState, useEffect } from "react";

import usei18n from "./hooks/usei18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const { t, lang, setLanguage } = usei18n();
    const [currentLang, setCurrentLang] = useState(lang);

    useEffect(() => {
        setCurrentLang(lang);
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ t, lang: currentLang, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}