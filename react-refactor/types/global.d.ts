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
}

declare global {
  interface Window {
    settingsAPI: SettingsAPI;
    gameStoreAPI: GamestoreAPI;
  }
}

export {};