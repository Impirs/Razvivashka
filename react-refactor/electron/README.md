# Electron TS bridge for src_ts

This folder now contains a TypeScript-based Electron entry (`main.ts`) and a modernized `preload.ts` exposing:

- `window.settingsAPI` with get/set/getAll/subscribe matching `src_ts/contexts/pref.tsx`.
- `window.gameStoreAPI` with loadUserData/saveUserData matching `src_ts/contexts/gamestore.tsx`.

Notes:
- Languages are handled inside React (`src_ts/contexts/i18n.tsx`), so no IPC for language is needed.
- Storage is persisted under `%APPDATA%/play_and_learn/data/` in `settings.json` and `gamestorage.json`.
- Ensure your build step compiles these TS files to JS in-place or into a folder Electron uses at runtime (preload.js path must match `BrowserWindow` config).
