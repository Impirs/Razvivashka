const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const axios = require('axios');
const path = require('path');

const isDev = !app.isPackaged;

// Setup logging
log.transports.file.level = 'info';
autoUpdater.logger = log;
log.info('App starting...');

autoUpdater.allowPrerelease = true;

// On Windows ensure AUMID is set so taskbar uses the correct icon
try {
    app.setAppUserModelId('com.impirs.razvivashka');
} catch {}

// Function to check for updates in development mode using GitHub API
async function checkForUpdatesDev(win) {
    try {
        log.info('Checking for updates in dev mode...');
        const currentVersion = app.getVersion();
        log.info('Current version:', currentVersion);
        
        const response = await axios.get('https://api.github.com/repos/Impirs/Summ_solver/releases/latest');
        const latestRelease = response.data;
        const latestVersion = latestRelease.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present
        
        log.info('Latest version from GitHub:', latestVersion);
        
        // Simple version comparison (assumes semantic versioning)
        const isNewer = isNewerVersion(latestVersion, currentVersion);
        
        if (isNewer) {
            log.info('Update available in dev mode');
            
            const updateInfo = {
                version: latestVersion,
                releaseNotes: latestRelease.body || 'Изменения не указаны.',
                releaseUrl: 'https://github.com/Impirs/Summ_solver/releases'
            };
            
            // Send update info to renderer process
            win.webContents.send('update-available', updateInfo);
        } else {
            log.info('No update available in dev mode');
        }
    } catch (error) {
        log.error('Error checking for updates in dev mode:', error);
    }
}

// Simple version comparison function
function isNewerVersion(latest, current) {
    const parseVersion = (version) => version.split('.').map(num => parseInt(num, 10));
    const latestParts = parseVersion(latest);
    const currentParts = parseVersion(current);
    
    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
        const latestPart = latestParts[i] || 0;
        const currentPart = currentParts[i] || 0;
        
        if (latestPart > currentPart) return true;
        if (latestPart < currentPart) return false;
    }
    
    return false;
}

// TODO:
// Write a script witch will automativaly send a bug report to the developer via mail.

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        icon: isDev 
            ? path.join(__dirname, '../src_ts/assets/icon.ico')
            : path.join(process.resourcesPath || path.join(__dirname, '..'), 'icon.ico'),
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
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    win.once('ready-to-show', () => {
        win.show();
        // Check for updates after window is ready
        if (!isDev) {
            autoUpdater.checkForUpdatesAndNotify();
        } else {
            // In development mode, check GitHub API manually
            checkForUpdatesDev(win);
        }
    });

    ipcMain.on('app-quit', () => app.quit());
    ipcMain.on('open-external', (_event, url) => {
        try {
            shell.openExternal(url);
        } catch (err) {
            console.error('Failed to open external URL', err);
        }
    });

    // IPC handler for opening release page
    ipcMain.on('open-release-page', (_event, url) => {
        try {
            shell.openExternal(url);
        } catch (err) {
            console.error('Failed to open release page', err);
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

// Auto-updater event handlers
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

    // Send update info to renderer process
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length > 0) {
        allWindows[0].webContents.send('update-available', {
            version: info.version,
            releaseNotes: releaseNotes,
            releaseUrl: releaseUrl
        });
    }
});

autoUpdater.on('update-not-available', (info) => {
    log.info('No update available. Current version:', app.getVersion());
    log.info('Update info:', info);
});

autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err);
});
