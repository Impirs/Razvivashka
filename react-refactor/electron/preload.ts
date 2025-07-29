import { subscribe } from 'diagnostics_channel';
import { contextBridge } from 'electron';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
const os = require('os');

const appDir = path.join(os.homedir(),'AppData/Roaming/play_and_learn' ,'data');
const settingsPath = path.join(appDir, 'settings.json');
const gamestoragePath = path.join(appDir, 'gamestorage.json');

let settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
let gamestorage = JSON.parse(readFileSync(gamestoragePath, 'utf-8'));

const listeners: ((key: string, value: any) => void)[] = [];

function notify(key: string, value: any) {
  listeners.forEach((cb) => cb(key, value));
}

contextBridge.exposeInMainWorld('settingsAPI', {
  get: (key : string) => settings[key],
  getAll: () => settings,
  set: (key : string, value : any) => {
    settings[key] = value;
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    notify(key, value);
  },
  subscribe: (cb) => {
    listeners.push(cb);
    return () => {
      const index = listeners.indexOf(cb);
      if (index !== -1) listeners.splice(index, 1);
    };
  }
});

contextBridge.exposeInMainWorld('gamestoreAPI',{
  loadUserData: (username: string) => {
    const userDataPath = path.join(appDir, `${username}.json`);
    if (!gamestorage[username]) {
      gamestorage[username] = { username, achievements: [], gameRecords: [] };
      writeFileSync(gamestoragePath, JSON.stringify(gamestorage, null, 2), 'utf-8');
    }
    return Promise.resolve(gamestorage[username]);
  },
  saveUserData: (username: string, data: any) => {
    gamestorage[username] = data;
    writeFileSync(gamestoragePath, JSON.stringify(gamestorage, null, 2), 'utf-8');
  }
});
