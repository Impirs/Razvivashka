const { ipcMain } = require('electron');
const language = require('../../shared/data/language.js');
const storage = require('./storage');

function handleLanguageAPI() {
    language.initLanguage();

    ipcMain.handle('language-get', (event) => {
        // console.log('Handling language-get');
        return language.getLanguage();
    });

    ipcMain.handle('language-set', (event, langCode) => {
        console.log(`Handling language-set: ${langCode}`);
        return language.setLanguage(langCode);
    });

    ipcMain.handle('language-t', (event, tag) => {
        // console.log(`Handling language-t: ${tag}`);
        return language.t(tag);
    });
}

function handleStorageAPI() {
    ipcMain.handle('get-user', () => {
        return storage.getUser();
    });
    ipcMain.handle('get-settings', () => {
        return storage.getSettings();
    });
    // save data
    ipcMain.handle('save-user', (event, data) => {
        storage.saveUser(data);
    });
    ipcMain.handle('save-settings', (event, data) => {
        try {
            storage.saveSettings(data);
            return { success: true };
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    });
    // user info
    ipcMain.handle('get-username', () => {
        return storage.getName();
    })
    ipcMain.handle('get-games', () => {
        return storage.getGames();
    });
    ipcMain.handle('get-types', () => {
        return storage.getTypes();
    })
    ipcMain.handle('get-achievements', () => {
        return storage.getAchievements();
    });
    ipcMain.handle('get-highscores', () => {
        return storage.getHighScores();
    })
    // settings info
    ipcMain.handle('get-gamesettings', () => {
        return storage.getGameSettings();
    })
    ipcMain.handle('get-volume', () => {
        return storage.getVolume();
    })
    // change data 
    ipcMain.handle('set-name', (event, name) => {
        if (typeof name !== "string") {
            throw new TypeError("The 'name' argument must be a string.");
        }
        console.warn(name === "" ? "Username set to an empty string." : `Username set to: ${name}`);
        storage.setName(name.trim());
    });
    ipcMain.handle('add-highscore', (event, game, id, score, date) => {
        storage.addHighScore(game, id, score, date);
    });
    ipcMain.handle('remove-highscore', (event, game, id, score, date) => {
        storage.removeHighScore(game, id, score, date);
    });
    ipcMain.handle('unlock-achieve', (event, game, id, score) => {
        storage.unlockAchievement(game, id, score);
    })
}

module.exports = {
    handleLanguageAPI,
    handleStorageAPI
}