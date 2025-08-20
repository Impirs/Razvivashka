import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Language, LanguageContextType, TranslationKey } from '../types/language';
import { useSettings } from './pref';

const defaultLanguage: Language = 'ru';

// Type for our translations (we'll load this dynamically)
type AppLanguage = Record<string, any>;

// Split language contexts for better performance:
// - LanguageContext: only language state changes  
// - TranslationsContext: only translation data changes
// This prevents unnecessary re-renders when only one aspect changes

// Separate contexts for language and translations to prevent unnecessary rerenders
const LanguageContext = createContext<{ language: Language; setLanguage: (lang: Language) => void } | undefined>(undefined);
const TranslationsContext = createContext<{ t: (key: TranslationKey<AppLanguage>) => string; translations: Record<Language, AppLanguage> } | undefined>(undefined);

type LanguageProviderProps = {
    children: ReactNode;
};

// Optimized provider that separates language state from translation logic
export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    // Use Settings as the single source of truth for language
    const { useSetting } = useSettings();
    const [language, setLanguageSetting] = useSetting('language');
    const [loading, setLoading] = React.useState(false);

    const [translations, setTranslations] = React.useState<Record<Language, AppLanguage>>({
        ru: {},
        sb_lat: {}, // Will be loaded dynamically
        sb_cy: {},  // Will be loaded dynamically
        en: {}      // Will be loaded dynamically
    });

    // Load other languages as needed
    const loadLanguage = useCallback(async (lang: Language) => {
        if (!translations[lang] || Object.keys(translations[lang]).length === 0) {
            setLoading(true);
            try {
                const module = await import(`../languages/${lang}.json`);
                setTranslations(prev => ({ ...prev, [lang]: module.default }));
            } catch (error) {
                console.error(`Failed to load ${lang} translations:`, error);
            } finally {
                setLoading(false);
            }
        }
    }, [translations]);

    // Memoized translation function to prevent recreation on every render
    const t = useCallback((key: TranslationKey<AppLanguage>): string => {
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
    }, [translations, language]);

    // Memoized language context value
    const languageContextValue = useMemo(() => ({
        language,
        setLanguage: setLanguageSetting
    }), [language, setLanguageSetting]);

    // Memoized translations context value
    const translationsContextValue = useMemo(() => ({
        t,
        translations
    }), [t, translations]);

    // Load all languages on initialization
    useEffect(() => {
        const loadAllLanguages = async () => {
            const languages: Language[] = ['ru', 'sb_lat', 'sb_cy', 'en'];
            const loadedTranslations: Record<Language, AppLanguage> = {} as Record<Language, AppLanguage>;
            
            for (const lang of languages) {
                try {
                    const module = await import(`../languages/${lang}.json`);
                    loadedTranslations[lang] = module.default;
                } catch (error) {
                    console.error(`Failed to load ${lang} translations:`, error);
                    loadedTranslations[lang] = {};
                }
            }
            
            setTranslations(loadedTranslations);
        };
        
        loadAllLanguages();
    }, []);

    // Ensure translations are loaded when language changes
    useEffect(() => {
        if (!language) return;
        loadLanguage(language);
    }, [language, loadLanguage]);

    return (
        <LanguageContext.Provider value={languageContextValue}>
            <TranslationsContext.Provider value={translationsContextValue}>
                {children}
            </TranslationsContext.Provider>
        </LanguageContext.Provider>
    );
};

// Hook to get language state only
export const useLanguageState = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguageState must be used within a LanguageProvider');
    }
    return context;
};

// Hook to get translations only
export const useTranslations = () => {
    const context = useContext(TranslationsContext);
    if (!context) {
        throw new Error('useTranslations must be used within a LanguageProvider');
    }
    return context;
};

// Combined hook for backward compatibility
export const useLanguage = () => {
    const languageContext = useLanguageState();
    const translationsContext = useTranslations();
    
    return {
        ...languageContext,
        ...translationsContext
    };
};