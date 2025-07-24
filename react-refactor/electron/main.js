const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const os = require('os');

const { cleanTitlesAndDescriptions, ensureTypes } = require('../src/data/update.js');
const { migrateFromLocalStorage } = require('../src/data/migrate.js');
const initialData = require('../src/data/initialData.js');
const storage = require('./storage.js');
const api = require('./api.js');

log.transports.file.level = 'info';
autoUpdater.logger = log;
log.info('App starting...');

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        icon: path.join(__dirname, '../../shared/assets/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    win.setMenuBarVisibility(false);
    win.maximize();

    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    win.once('ready-to-show', () => {
        win.show();
        autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.on('app-quit', () => {
        app.quit();
    });

    ipcMain.on('open-external', (event, url) => {
        try {
            shell.openExternal(url);
        } catch (error) {
            console.error('Error while opening external URL:', error);
        }
    });
}

// ========================= APP OPEN AND EXIT ========================= //

app.whenReady().then(() => {
    storage.ensureAppDirExists();

    // Registrate API
    api.handleLanguageAPI();
    api.handleStorageAPI();

    if (!storage.hasFlag('.migrated')) {
        const localData = migrateFromLocalStorage();

        let userData, settingsData;

        if (localData) {
            console.log("Migrating from localStorage...")
            userData = localData.user;
            settingsData = localData.settings;
        } else {
            console.log("No localStorage found. Initializing with default data...");
            userData = initialData.user;
            settingsData = initialData.settings;
        }

        userData = cleanTitlesAndDescriptions('user', userData);
        settingsData = cleanTitlesAndDescriptions('settings', settingsData);

        storage.saveUser(userData);
        storage.saveSettings(settingsData);
        storage.setFlag('.migrated');

        console.log('Migration (or initialization) complete.');
    }
    if (!storage.hasFlag('.UPDtypes')) {
        console.log('Game types are stored in an unsupported form. Updating...');
        let userData = storage.getUser();

        userData = ensureTypes(userData);
        storage.saveUser(userData);
        storage.setFlag('.UPDtypes');

        console.log('Game types update complete.');
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// ========================= AUTO UPDATE ========================= //

autoUpdater.on('checking-for-update', () =>{
    log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);

    const releaseUrl = 'https://github.com/Impirs/Summ_solver/releases';

    const cleanReleaseNotes = (notes) => {
        if (Array.isArray(notes)) {
            return notes.map(note => {
                if (typeof note === 'string') {
                    return note.replace(/<\/?[^>]+(>|$)/g, '');
                }
                return note;
            }).join('\n\n');
        } else if (typeof notes === 'string') {
            return notes.replace(/<\/?[^>]+(>|$)/g, '');
        }
        return 'Изменения не указаны.';
    };

    const releaseNotes = cleanReleaseNotes(info.releaseNotes);

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-available', {
            version: info.version,
            releaseNotes,
            releaseUrl
        });
    });
});

autoUpdater.on('update-not-available', (info) => {
    log.info('No update available. Current version:', app.getVersion());
    log.info('Update info:', info);
});

if (isDev) {
    setTimeout(() => {
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('update-available', {
                version: app.getVersion(),
                releaseNotes: 'Тестовое уведомление: это последняя версия приложения.',
                releaseUrl: 'https://github.com/Impirs/Summ_solver/releases'
            });
        });
    }, 2000);
}

autoUpdater.on('error', (error) => {
    log.error("Updating error: ", error);
});

autoUpdater.removeAllListeners('download-progress');
autoUpdater.removeAllListeners('update-downloaded');