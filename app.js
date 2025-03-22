const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

log.transports.file.level = 'info';
autoUpdater.logger = log;

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

autoUpdater.on('update-available', () => {
    log.info('Update available.');
});

autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded; will install now');
    autoUpdater.quitAndInstall();
});