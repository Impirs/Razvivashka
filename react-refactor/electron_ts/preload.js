const { contextBridge, ipcRenderer } = require('electron');
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');
const os = require('os');

// Storage locations
const appDir = path.join(os.homedir(), 'AppData/Roaming/play_and_learn', 'data');
const settingsPath = path.join(appDir, 'settings.json');
const gameStoragePath = path.join(appDir, 'gamestorage.json');

function ensureDirs() {
    if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });
}

const defaultSettings = {
    volume: { notifications: 0.5, effects: 0.5 },
    language: 'ru',
    games: {
        digit: { show_available: true },
        shulte: { check_all_letters_tested: false },
    },
};

function readJson(file, fallback) {
    try {
        if (!existsSync(file)) {
            ensureDirs();
            writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf-8');
            return fallback;
        }
        const raw = readFileSync(file, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        try { writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf-8'); } catch {}
        return fallback;
    }
}

function writeJson(file, data) {
    ensureDirs();
    writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

let settings = readJson(settingsPath, defaultSettings);
let gameStorage = readJson(gameStoragePath, {});

const listeners = [];
function notify(key, value) {
    listeners.forEach((cb) => cb(key, value));
}

contextBridge.exposeInMainWorld('settingsAPI', {
    get: (key) => settings[key],
    getAll: () => ({ ...settings, volume: { ...settings.volume }, games: { ...settings.games } }),
    set: (key, value) => {
        settings[key] = value;
        writeJson(settingsPath, settings);
        notify(key, value);
    },
    subscribe: (cb) => {
        listeners.push(cb);
        return () => {
            const index = listeners.indexOf(cb);
            if (index !== -1) listeners.splice(index, 1);
        };
    },
});

contextBridge.exposeInMainWorld('gameStoreAPI', {
    loadUserData: (username) => {
        if (!gameStorage[username]) {
            gameStorage[username] = { username, achievements: [], gameRecords: [] };
            writeJson(gameStoragePath, gameStorage);
        }
        return Promise.resolve(gameStorage[username]);
    },
    saveUserData: (username, data) => {
        gameStorage[username] = data;
        writeJson(gameStoragePath, gameStorage);
    },
});

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('app-quit'),
    openExternal: (url) => ipcRenderer.send('open-external', url),
});
