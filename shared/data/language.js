const fs = require('fs');
const os = require('os');
const path = require('path');

const languageDir = path.join(__dirname, '..', 'languages');
const appDir = path.join(os.homedir(),'AppData/Roaming/play_and_learn' ,'data');
const settingsFile = path.join(appDir, 'settings.json');

let currentLanguage = 'ru';
let translations = {};

function loadLanguage(langCode) {
    const filePath = path.join(languageDir, `${langCode}.json`);
    if (!fs.existsSync(filePath)) {
        console.error(`Translation file for ${langCode} language was not found. Using the default language.`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    translations = JSON.parse(fileContent);
    currentLanguage = langCode;
}

function saveCurrentLanguage(langCode) {
    let settingsData = {};
    if (fs.existsSync(settingsFile)) {
        settingsData = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
    }
    settingsData.language = langCode;
    fs.writeFileSync(settingsFile, JSON.stringify(settingsData, null, 2), 'utf-8');
}

function loadSavedLanguage() {
    if (fs.existsSync(settingsFile)) {
        const settingsData = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
        if (settingsData.language) {
            return settingsData.language;
        }
    }
    return null;
}

function initLanguage() {
    const saved = loadSavedLanguage();
    if (saved) {
        loadLanguage(saved);
    } else {
        loadLanguage('ru');
    }
}

function setLanguage(langCode) {
    loadLanguage(langCode);
    saveCurrentLanguage(langCode);
}

function getLanguage() {
    return currentLanguage;
}

function t(tag) {
    // console.log(`Fetching translation for tag: ${tag} \nTranslation should be: ${translations[tag]}`);
    return translations[tag] || tag;
}

module.exports = {
    initLanguage,
    loadLanguage,
    setLanguage,
    getLanguage,
    t
}