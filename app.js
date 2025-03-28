const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

log.transports.file.level = 'info';
autoUpdater.logger = log;

log.info('App starting...');

autoUpdater.allowPrerelease = true;

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    win.setMenuBarVisibility(false);
    win.maximize();
    win.show();
    win.loadFile('index.html');

    ipcMain.on('app-quit', () => {
        app.quit();
    });

    ipcMain.on('navigate', (event, targetPath) => {
        win.loadFile(path.join(__dirname, targetPath));
    });

    win.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Logging settings

autoUpdater.on('checking-for-update', () => {
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

    dialog.showMessageBox({
        type: 'info',
        buttons: ['Перейти на страницу', 'Посмотреть позже'],
        defaultId: 0,
        title: 'Доступно обновление',
        message: `Доступно обновление до версии ${info.version}.`,
        detail: `Изменения:\n\n${releaseNotes}`,
        noLink: true
    }).then(result => {
        if (result.response === 0) {
            shell.openExternal(releaseUrl);
        } else {
            log.info('User chose to update later.');
        }
    });
});

autoUpdater.on('update-not-available', (info) => {
    log.info('No update available. Current version:', app.getVersion());
    log.info('Update info:', info);
});

autoUpdater.removeAllListeners('download-progress');
autoUpdater.removeAllListeners('update-downloaded');
autoUpdater.removeAllListeners('error');