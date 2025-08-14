const { cleanTitlesAndDescriptions, saveCleanedData } = require('./update');
const path = require('path');

function migrateFromLocalStorage() {
    try {
        const storedData = localStorage.getItem('gameData');
        if (!storedData) return null;

        const parsed = JSON.parse(storedData);
        return {
            user: parsed.user,
            settings: parsed.settings
        };
    } catch (e) {
        console.error('Failed to migrate from localStorage:', e);
        return null;
    }
}

module.exports = {
    migrateFromLocalStorage
}