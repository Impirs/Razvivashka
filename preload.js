const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    navigate: (path) => ipcRenderer.send('navigate', path),
    quitApp: () => ipcRenderer.send('app-quit')
});