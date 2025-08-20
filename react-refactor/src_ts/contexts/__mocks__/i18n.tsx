import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// Mock translations data
const mockTranslations = {
    ru: {
        games: {
            digit: "Состав числа",
            shulte: "Таблица Шульте",
            syllable: "По сло-гам"
        },
        types: {
            math: "Счет",
            attention: "Внимательность",
            reading: "Чтение",
            logic: "Логика",
            all: "Все категории"
        },
        routes: {
            home: "Развивашка",
            catalog: "Каталог",
            settings: "Настройки",
            achievements: "Достижения"
        },
        buttons: {
            play: "Играть",
            back: "Назад",
            filter: "Выберите..."
        }
    },
    en: {
        games: {
            digit: "Number Composition",
            shulte: "Schulte Table",
            syllable: "Syllables"
        },
        types: {
            math: "Math",
            attention: "Attention",
            reading: "Reading",
            logic: "Logic",
            all: "All categories"
        },
        routes: {
            home: "Razvivashka",
            catalog: "Catalog",
            settings: "Settings",
            achievements: "Achievements"
        },
        buttons: {
            play: "Play",
            back: "Back",
            filter: "Choose..."
        }
    }
};

const LanguageContext = createContext<any>(undefined);

const mockT = (key: string): string => {
    const keys = key.split('.');
    let value: any = mockTranslations.ru; // Default to Russian for tests

    for (const k of keys) {
        if (typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key; // Return key if translation not found
        }
    }

    return typeof value === 'string' ? value : key;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const contextValue = {
        language: 'ru',
        setLanguage: () => {},
        t: mockT,
        translations: mockTranslations
    };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        // Return mock values instead of throwing error during tests
        return {
            language: 'ru',
            setLanguage: () => {},
            t: mockT,
            translations: mockTranslations
        };
    }
    return context;
};

export const useLanguageState = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        return {
            language: 'ru',
            setLanguage: () => {}
        };
    }
    return {
        language: context.language,
        setLanguage: context.setLanguage
    };
};

export const useTranslations = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        return {
            t: mockT,
            translations: mockTranslations
        };
    }
    return {
        t: context.t,
        translations: context.translations
    };
};
