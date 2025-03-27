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
    log.info('Update available.');

    const isPrerelease = info.releaseNotes && info.releaseNotes.some(note => note.includes('pre-release'));
    const releaseUrl = 'https://github.com/Impirs/Summ_solver/releases';

    if (isPrerelease) {
        dialog.showMessageBox({
            type: 'question',
            buttons: ['Обновить', 'Посмотреть детали', 'Нет'],
            defaultId: 0,
            title: 'Доступно обновление',
            message: 'Доступен пре-релиз новой версии приложения. Хотите обновиться?',
            detail: `Версия: ${info.version}\n\nВы также можете посмотреть изменения в релизах.`,
            cancelId: 2,
            noLink: true
        }).then(result => {
            if (result.response === 0) {
                // "Обновить"
                autoUpdater.downloadUpdate();
            } else if (result.response === 1) {
                // "Посмотреть детали"
                shell.openExternal(releaseUrl);
            }
        });
    } else {
        autoUpdater.downloadUpdate();
    }
});

autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
});

autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater. ' + err);
    log.error(err.stack);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    log.info(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded; will install now');

    dialog.showMessageBox({
        type: 'info',
        buttons: ['Перезапустить', 'Позже'],
        defaultId: 0,
        title: 'Обновление загружено',
        message: 'Обновление загружено. Хотите перезапустить приложение для установки?',
        cancelId: 1,
        noLink: true
    }).then(result => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});