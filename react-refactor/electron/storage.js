const fs = require('fs');
const path = require('path');
const os = require('os');

const appDir = path.join(os.homedir(), '.play_and_learn');
const userFile = path.join(appDir, 'user.json');
const settingsFile = path.join(appDir, 'settings.json');
const migrationFlag = path.join(appDir, '.migrated');

function ensureAppDirExists() {
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir, { recursive: true });
    }
}

function hasMigrated() {
    return fs.existsSync(migrationFlag);
}

function setMigrated() {
    fs.writeFileSync(migrationFlag, 'true', 'utf8');
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function saveUser(data) {
    ensureAppDirExists();
    writeJSON(userFile, data);
}

function saveSettings(data) {
    ensureAppDirExists();
    writeJSON(settingsFile, data);
}

function getUser() {
    return readJSON(userFile);
}

function getSettings() {
    return readJSON(settingsFile);
}

module.exports = {
    saveUser,
    saveSettings,
    getUser,
    getSettings,
    hasMigrated,
    setMigrated,
    ensureAppDirExists
};