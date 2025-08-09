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
    currentUser: 'user',
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
// Migrate settings to include currentUser if missing
if (!settings.currentUser) {
    settings.currentUser = 'user';
    writeJson(settingsPath, settings);
}

// Ensure default user profile exists at startup
function ensureDefaultUser() {
    const username = settings.currentUser || 'user';
    if (!gameStorage['user']) {
        gameStorage['user'] = { username: 'user', achievements: [], gameRecords: [] };
    }
    if (!gameStorage[username]) {
        gameStorage[username] = { username, achievements: [], gameRecords: [] };
    }
    writeJson(gameStoragePath, gameStorage);
}
ensureDefaultUser();

const listeners = [];
function notify(key, value) {
    listeners.forEach((cb) => cb(key, value));
}

//                                 [ Settings API ]

//   1. Volume control
//   2. Current user management
//   3. Current language management
//   4. Game settings management

// Handling games settings which will effect gameplay
// Handling current user and language settings to control the results and needed translations

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

//                                [ Game store API ]

//   1. User management
//   2. Record management
//   3. User achievements management

// Handling creating and deleting users for multiple accounts at the same time
// Handling user unlock achievements, adding new records and updating existing ones

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
    listUsers: () => Object.keys(gameStorage),
    createUser: (username) => {
        if (!username || typeof username !== 'string') return false;
        if (gameStorage[username]) return false;
        gameStorage[username] = { username, achievements: [], gameRecords: [] };
        writeJson(gameStoragePath, gameStorage);
        return true;
    },
    deleteUser: (username) => {
        if (!username || typeof username !== 'string') return false;
        if (!gameStorage[username]) return false;
        // Prevent deleting the very last user; always keep default 'user'
        if (username === 'user') {
            // allow clearing, but keep the key present
            gameStorage['user'] = { username: 'user', achievements: [], gameRecords: [] };
            writeJson(gameStoragePath, gameStorage);
            if (settings.currentUser === 'user') {
                writeJson(settingsPath, settings);
            }
            return true;
        }
        delete gameStorage[username];
        writeJson(gameStoragePath, gameStorage);
        if (settings.currentUser === username) {
            settings.currentUser = 'user';
            // Ensure default exists
            if (!gameStorage['user']) {
                gameStorage['user'] = { username: 'user', achievements: [], gameRecords: [] };
                writeJson(gameStoragePath, gameStorage);
            }
            writeJson(settingsPath, settings);
        }
        return true;
    },
    renameUser: (oldUsername, newUsername) => {
        if (!oldUsername || !newUsername) return false;
        if (!gameStorage[oldUsername]) return false;
        if (gameStorage[newUsername]) return false;
        const data = gameStorage[oldUsername];
        const newData = { ...data, username: newUsername };
        gameStorage[newUsername] = newData;
        delete gameStorage[oldUsername];
        writeJson(gameStoragePath, gameStorage);
        if (settings.currentUser === oldUsername) {
            settings.currentUser = newUsername;
            writeJson(settingsPath, settings);
        }
        return true;
    },
});

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('app-quit'),
    openExternal: (url) => ipcRenderer.send('open-external', url),
});
