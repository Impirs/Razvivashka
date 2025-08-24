const { existsSync, writeFileSync } = require('fs');
const path = require('path');
let log;
try { log = require('electron-log'); }
catch { log = console; }

// This file handles migration of legacy data to the new format
//
// before v2.0.0 data was stored in localstorage and had a different structure
// This migration script converts that data into the new format and creates a migration flag in the filesystem

function parseLegacyDate(str) {
    try {
        if (!str || typeof str !== 'string') return new Date();
        const m = str.match(/^(\d{1,2}):(\d{2})\s+(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (!m) return new Date(str);
        const [, hhStr, mmStr, ddStr, monStr, yyyyStr] = m;
        const   hh = Number(hhStr), 
                mm = Number(mmStr), 
                dd = Number(ddStr), 
                mon = Number(monStr), 
                yyyy = Number(yyyyStr);
        return new Date(yyyy, mon - 1, dd, hh, mm, 0, 0);
    } catch {
        return new Date();
    }
}

function migrateIfNeeded(ctx) {
    const { appDir, settingsPath, gameStoragePath, settings, gameStorage, writeJson } = ctx;
    try {
        const migrationMarkerPath = path.join(appDir, '.migratedv2');
        log.info('[Migration] Start');
        if (existsSync(migrationMarkerPath)) {
            log.info('[Migration] Marker found, skipping:', migrationMarkerPath);
            return;
        }

        // Try to access legacy localStorage
        let legacyRaw = null;
        try {
            log.info('[Migration] Reading localStorage.gameData ...');
            legacyRaw = globalThis.localStorage ? globalThis.localStorage.getItem('gameData') : null;
        } catch (e) {
            log.warn('[Migration] localStorage is not accessible in preload:', e?.message || e);
            legacyRaw = null;
        }
        if (!legacyRaw) {
            log.info('[Migration] No legacy data found. Nothing to migrate.');
            return;
        }

        let legacy = null;
        try { 
            legacy = JSON.parse(legacyRaw); 
            log.info('[Migration] Legacy data parsed successfully');
        } catch (e) { 
            log.error('[Migration] Failed to parse legacy JSON:', e?.message || e); 
            legacy = null; 
        }
        if (!legacy || typeof legacy !== 'object') {
            log.warn('[Migration] Legacy data is not an object. Abort.');
            return;
        }

    const username = (  legacy.user && 
                            (legacy.user.name || legacy.user.username)) 
                            || legacy.name 
                            || 'user';
        log.info('[Migration] Username detected:', username);

        const migratedUser = {
            username,
            achievements: [],
            gameRecords: [],
        };

        const hs = legacy.highScores || (legacy.user && legacy.user.highScores) || {};
        const digitKeys = hs.digit ? Object.keys(hs.digit) : [];
        const shulteKeys = hs.shulte ? Object.keys(hs.shulte) : [];
        log.info('[Migration] HighScores keys:', { digit: digitKeys, shulte: shulteKeys });
        let digitRecCount = 0, shulteRecCount = 0;
        if (hs.digit && typeof hs.digit === 'object') {
            Object.entries(hs.digit).forEach(([props, arr]) => {
                if (!Array.isArray(arr)) return;
                arr.forEach((rec) => {
                    if (!rec || typeof rec.score !== 'number') return;
                    migratedUser.gameRecords.push({
                        gameId: 'digit',
                        gameProps: String(props),
                        modification: [],
                        isperfect: false,
                        score: rec.score,
                        played: parseLegacyDate(rec.date),
                    });
                    digitRecCount++;
                });
            });
        }
        if (hs.shulte && typeof hs.shulte === 'object') {
            Object.entries(hs.shulte).forEach(([props, arr]) => {
                if (!Array.isArray(arr)) return;
                arr.forEach((rec) => {
                    if (!rec || typeof rec.score !== 'number') return;
                    migratedUser.gameRecords.push({
                        gameId: 'shulte',
                        gameProps: String(props),
                        modification: [],
                        isperfect: false,
                        score: rec.score,
                        played: parseLegacyDate(rec.date),
                    });
                    shulteRecCount++;
                });
            });
        }
        log.info('[Migration] Records migrated:', { digit: digitRecCount, shulte: shulteRecCount });

        function addAchievements(gameId, list) {
            if (!Array.isArray(list)) return;
            list.forEach((a) => {
                if (!a || !a.id) return;
                const unlocked = Array.isArray(a.unlocked) ? a.unlocked.map(Boolean) : [];
                migratedUser.achievements.push({
                    gameId,
                    gameProps: String(a.id),
                    unlockedTiers: unlocked,
                });
            });
        }

        // Try to find achievements in various possible locations
        let achDigit = 0, achShulte = 0;
        const achRoot = (legacy.achievements || legacy.achivements || (legacy.user && (legacy.user.achievements || legacy.user.achivements))) || null;
        const achSources = [];
        if (achRoot && typeof achRoot === 'object') {
            if (Array.isArray(achRoot.digit)) achSources.push({ gameId: 'digit', list: achRoot.digit, source: 'achievements.digit' });
            if (Array.isArray(achRoot.shulte)) achSources.push({ gameId: 'shulte', list: achRoot.shulte, source: 'achievements.shulte' });
        }
        // Fallback: top-level arrays that look like achievements
        if (achSources.length === 0) {
            const maybeDigit = legacy.digit;
            const maybeShulte = legacy.shulte;
            if (Array.isArray(maybeDigit) && maybeDigit.some(x => x && typeof x === 'object' && ('id' in x))) {
                achSources.push({ gameId: 'digit', list: maybeDigit, source: 'legacy.digit' });
            }
            if (Array.isArray(maybeShulte) && maybeShulte.some(x => x && typeof x === 'object' && ('id' in x))) {
                achSources.push({ gameId: 'shulte', list: maybeShulte, source: 'legacy.shulte' });
            }
        }
        // Last resort: scan object for properties that are arrays of objects with id/unlocked
        if (achSources.length === 0) {
            try {
                Object.entries(legacy).forEach(([k, v]) => {
                    if (achSources.length >= 2) return; // we only care about digit/shulte
                    if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] && ('id' in v[0])) {
                        if (/digit/i.test(k)) achSources.push({ gameId: 'digit', list: v, source: `scan:${k}` });
                        if (/shult|schult|shulte/i.test(k)) achSources.push({ gameId: 'shulte', list: v, source: `scan:${k}` });
                    }
                });
            } catch {}
        }

        if (achSources.length === 0) {
            log.warn('[Migration] Achievements not found in legacy data.');
        } else {
            achSources.forEach(({ gameId, list, source }) => {
                log.info(`[Migration] Achievements detected for ${gameId} at ${source}. Count: ${Array.isArray(list) ? list.length : 0}`);
                const preview = (Array.isArray(list) ? list.slice(0, 2) : []).map(a => ({ id: a?.id, unlocked: a?.unlocked }));
                log.info(`[Migration] ${gameId} achievements preview:`, preview);
                addAchievements(gameId, list);
                if (gameId === 'digit') achDigit = Array.isArray(list) ? list.length : 0;
                if (gameId === 'shulte') achShulte = Array.isArray(list) ? list.length : 0;
            });
        }
        log.info('[Migration] Achievements migrated:', { digit: achDigit, shulte: achShulte, total: migratedUser.achievements.length });

        // Save migrated user
        try {
            gameStorage[username] = migratedUser;
            writeJson(gameStoragePath, gameStorage);
            log.info('[Migration] Saved gameStorage for user:', username);
        } catch (e) {
            log.error('[Migration] Failed to save gameStorage:', e?.message || e);
            throw e;
        }

        // Map settings
        try {
            settings.currentUser = username;

            const legacySettings = legacy.settings || {};
            const legacyVolume = legacy.volume || legacySettings.volume || {};
            if (typeof legacyVolume.notification === 'number') 
                settings.volume.notifications = legacyVolume.notification;
            if (typeof legacyVolume.game_effects === 'number') 
                settings.volume.effects = legacyVolume.game_effects;

            const games = legacy.games || (legacySettings.games || {});
            if (games.digit && 
                games.digit.show_available && 
                typeof games.digit.show_available.state === 'boolean'
            ) {
                settings.games = settings.games || 
                { 
                    digit: { view_modification: true }, 
                    shulte: { view_modification: true } 
                };
                settings.games.digit = settings.games.digit || { view_modification: true };
                settings.games.digit.view_modification = !!games.digit.show_available.state;
            }
            if (games.shulte) 
            {
                const state = (games.shulte.shide_scored && games.shulte.shide_scored.state);
                if (typeof state === 'boolean') {
                    settings.games = settings.games || 
                    { 
                        digit: { view_modification: true }, 
                        shulte: { view_modification: true } 
                    };
                    settings.games.shulte = settings.games.shulte || { view_modification: true };
                    settings.games.shulte.view_modification = !!state;
                }
            }
            writeJson(settingsPath, settings);
            log.info('[Migration] Settings updated:', {
                currentUser: settings.currentUser,
                volume: settings.volume,
                games: {
                    digit: settings.games?.digit,
                    shulte: settings.games?.shulte,
                }
            });
        } catch (e) {
            log.error('[Migration] Failed to update settings:', e?.message || e);
        }

        try {
            writeFileSync(  migrationMarkerPath, 
                            JSON.stringify(
                                { migratedAt: new Date().toISOString(), username }, 
                                null, 2),
                            'utf-8');
            log.info('[Migration] Marker written at:', migrationMarkerPath);
        } catch {}
    } catch (e) {
        log.error('[Migration] Failed with error:', e?.message || e);
    }
}

module.exports = { migrateIfNeeded };
