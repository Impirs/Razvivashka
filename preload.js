const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');
contextBridge.exposeInMainWorld('electronAPI', {
    navigate: (path) => {
        // console.log('Navigating to:', path);
        ipcRenderer.send('navigate', path);
    },
    quitApp: () => {
        // console.log('Quitting app');
        ipcRenderer.send('app-quit');
    },
    openExternal: (url) => {
        // console.log('Request to open external URL:', url);
        ipcRenderer.send('open-external', url);
    },
});