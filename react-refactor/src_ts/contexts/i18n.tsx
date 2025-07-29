import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Language, LanguageContextType, TranslationKey } from '../types/language';

const defaultLanguage: Language = 'ru';

import ruTranslations from '../languages/ru.json';
import sbLatTranslations from '../languages/sb_lat.json';
import sbCyTranslations from '../languages/sb_cy.json'; 
import enTranslations from '../languages/en.json'; 

type AppLanguage = typeof ruTranslations; // translations structure type

const LanguageContext = createContext<LanguageContextType<AppLanguage> | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = React.useState<Language>(defaultLanguage);
    const [loading, setLoading] = React.useState(false);

    const [translations, setTranslations] = React.useState<Record<Language, AppLanguage>>({
        ru: ruTranslations,
        sb_lat: sbLatTranslations,
        sb_cy: sbCyTranslations,
        en: enTranslations
    });

    // Load other languages as needed
    const loadLanguage = async (lang: Language) => {
        if (!translations[lang]) {
            setLoading(true);
            try {
                const module = await import(`../translations/${lang}.json`);
                setTranslations(prev => ({ ...prev, [lang]: module.default }));
            } catch (error) {
                console.error(`Failed to load ${lang} translations:`, error);
            } finally {
                setLoading(false);
            }
        }
    };

    const t = (key: TranslationKey<AppLanguage>): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key "${key}" not found for language "${language}"`);
                return key; // Return key if translation not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    const handleSetLanguage = async (lang: Language) => {
        await loadLanguage(lang);
        setLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ 
            language, 
            setLanguage: handleSetLanguage, 
            t, 
            translations 
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};