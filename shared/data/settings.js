const fs = require('fs');
const { get } = require('http');
const path = require('path');

const settingsPath = path.join(__dirname, '..', 'storage', 'settings.json');

function readSettings() { 
    if (!fs.existsSync(settingsPath)) return {};
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); 
}

function updateSettings(key, value) {
    const settings = readSettings();
    settings[key] = value;
    fs.writeFileSync= (settingsPath, JSON.stringify(settings, null, 2));
}

function getSettings(key) {
    const settings = getSettings();
    return settings[key];
}

module.exports = {
    readSettings,
    updateSettings,
    getSettings
};