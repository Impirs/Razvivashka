const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

// TODO:
// Write a script witch will automativaly send a bug report to the developer via mail.

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        icon: path.join(__dirname, '../src_ts/assets/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false, // increases memory usage, but allows using Node.js APIs for file system access without any restrictions
                            // TODO: try to remove sandboxing and see how big is the impact on memory usage
                            // the api restrictions might be passed through fs contextBridge's in third file like api.js, just not in the preload script
        },
    });

    win.setMenuBarVisibility(false);
    win.maximize();

    if (isDev) {
        win.loadURL('http://localhost:5173');
        // win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    win.once('ready-to-show', () => {
        win.show();
    });

    ipcMain.on('app-quit', () => app.quit());
    ipcMain.on('open-external', (_event, url) => {
        try {
            shell.openExternal(url);
        } catch (err) {
            console.error('Failed to open external URL', err);
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
