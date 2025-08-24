import type { AppSettings } from '../src_ts/types/settings';

interface SettingsAPI {
  get<K extends keyof AppSettings>(key: K): AppSettings[K];
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void;
  getAll(): AppSettings;
  subscribe(callback: (key: keyof AppSettings, value: any) => void): () => void;
}

interface GamestoreAPI {
  loadUserData(username: string): Promise<any>;
  saveUserData(username: string, data: any): void;
  listUsers(): string[];
  createUser(username: string): boolean;
  deleteUser(username: string): boolean;
  renameUser(oldUsername: string, newUsername: string): boolean;
}

interface ElectronAPI {
  quitApp(): void;
  openExternal(url: string): void;
  openReleasePage(url: string): void;
  onUpdateAvailable(callback: (event: any, updateInfo: any) => void): void;
  removeUpdateListeners(): void;
}

declare global {
  interface Window {
    settingsAPI: SettingsAPI;
    gameStoreAPI: GamestoreAPI;
    electronAPI: ElectronAPI;
  }
}

export {};

// Image module declarations
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}