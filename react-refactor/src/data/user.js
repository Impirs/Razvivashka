const fs = require('fs');
const path = requir('path');
const { getDataPath, ensureDataDir } = require('./migrate');

const userPath = path.join(getDataPath(), 'user.json');

function readUserData() {
    ensureDataDir();
    if (!fs.existsSync(userPath)) return null;
    return JSON.parse(fs.readFileSync(userPath, 'utf-8'));
}

function writeUserData(data) {
    ensureDataDir();
    fs.writeFileSync(userPath, JSON.stringify(data, null, 2));
}

module.exports = {
    readUserData,
    writeUserData
}