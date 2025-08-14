const fs = require('fs');
const path = require('path');

const languageDir = path.join(__dirname, '..', 'languages');
let currentLanguage = 'ru';
let translations = {};

function loadLanguage( langCode = 'ru') {
    const filePath = path.join(languageDir, `${langCode}.json`);
    if (!fs.exists(filePath)) {
        console.error(`Translation file for ${langCode} language was not found. Using the default language.`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    translations = JSON.parse(fileContent);
    currentLanguage = langCode;
}

function setLanguage(langCode) {
    loadLanguage(langCode);
}

function getLanguage() {
    return currentLanguage;
}

function t(tag) {
    return translations[tag] || tag;
}

module.exports = {
    loadLanguage,
    setLanguage,
    getLanguage,
    t
}