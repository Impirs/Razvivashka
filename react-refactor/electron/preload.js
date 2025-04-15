const {contextBridge, ipcRenderer} = require('electron');
const { getUser, getGames, removeHighScore } = require('./storage');
const {getAchievements, getHighScores, addHighScore } = require('../../vanilla-app/data_manager');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (msg) => ipcRenderer.send('message', msg),
    onMessage: (callback) => ipcRenderer.on('message', callback),

    onRequestLocalStorage: (callback) => ipcRenderer.on('request-localstorage', callback),
    sendLocalStorage:(data) => ipcRenderer.invoke('send-localstorage', data),

    quitApp: () => ipcRenderer.send('app-quit'),
    openExternal: (url) => ipcRenderer.send('open-external', url)
});

contextBridge.exposeInMainWorld('languageAPI', {
    t: (tag) => ipcRenderer.invoke('language-t', tag),
    setLanguage: (langCode) => ipcRenderer.invoke('language-set', langCode),
    getLanguage: () => ipcRenderer.invoke('language-get')
});

contextBridge.exposeInMainWorld('storageAPI', {
    getUser: () => ipcRenderer.invoke('get-user'),
    getSettings: () => ipcRenderer.invoke('get-settings'),

    saveUser: (data) => ipcRenderer.invoke('save-user', data),
    saveSettings: (data) => ipcRenderer.invoke('save-settings', data),

    getAchievements: () => ipcRenderer.invoke('get-achievements'),
    getHighScores: () => ipcRenderer.invoke('get-highscore'),
    getGames: () => ipcRenderer.invoke('get-games'),
    
    addHighScore: (game, id, score, date) => 
        ipcRenderer.invoke('add-highscore', game, id, score, date),
    removeHighScore: (game, id, score, date) => 
        ipcRenderer.invoke('remove-highscore', game, id, score, date),
})
