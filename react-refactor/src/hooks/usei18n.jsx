import { useState, useEffect } from 'react';

export default function usei18n() {
    const [lang, setLang] = useState(null);

    const t = async (tag) => {
        try {
            return await window.languageAPI.t(tag);
        } catch (error) {
            console.error(`Error fetching translation for tag "${tag}":`, error);
            return tag;
        }
    };

    const setLanguage = async (newLang) => {
        try {
            await window.languageAPI.setLanguage(newLang);
            setLang(newLang);
        } catch (error) {
            console.error(`Error setting language to "${newLang}":`, error);
        }
    };

    useEffect(() => {
        const fetchLanguage = async () => {
            try {
                const currentLang = await window.languageAPI.getLanguage();
                setLang(currentLang);
            } catch (error) {
                console.error('Error fetching current language:', error);
            }
        };

        fetchLanguage();
    }, []);

    return { t, lang, setLanguage };
};