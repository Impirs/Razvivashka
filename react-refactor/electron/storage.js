const fs = require('fs');
const path = require('path');
const os = require('os');

const appDir = path.join(os.homedir(),'AppData/Roaming/play_and_learn' ,'data');
const userFile = path.join(appDir, 'user.json');
const settingsFile = path.join(appDir, 'settings.json');

//////////////////// MIGRATE & UPDATE ////////////////////

// v2.0
function ensureAppDirExists() {
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir, { recursive: true });
    }
}

function hasFlag(flagName) {
    const flagPath = path.join(appDir, 'flags', flagName);
    return fs.existsSync(flagPath);
}

function setFlag(flagName) {
    const flagPath = path.join(appDir, 'flags', flagName);
    ensureAppDirExists(); // Убедимся, что папка существует
    const flagsDir = path.join(appDir, 'flags');
    if (!fs.existsSync(flagsDir)) {
        fs.mkdirSync(flagsDir, { recursive: true });
    }
    fs.writeFileSync(flagPath, 'true', 'utf8');
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

//////////////////// functions for API ////////////////////

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

function getGames() {
    const data = getUser();
    return data.games;
}

function getTypes() {
    const data = getUser();
    return data.types;
}

function getAchievements() {
    const data = getUser();
    return data.achievements;
}

function unlockAchievement(game, id, score) {
    let data = getUser();
    let achievements = data.achievements[game];
    let unlockedAchievements = [];
    
    if (achievements) {
        achievements.forEach(achievement => {
            if (achievement.id === id) {
                achievement.ranks.forEach((rank, index) => {
                    if (game === "digit" && !achievement.unlocked[index] && score < rank) {
                        achievement.unlocked[index] = true;
                        unlockedAchievements.unshift({ ...achievement, rank: index + 1 });
                    } else if (game === "shulte" && !achievement.unlocked[index] && score < rank) {
                        achievement.unlocked[index] = true;
                        unlockedAchievements.unshift({ ...achievement, rank: index + 1 });
                    } else if (game === "syllable" && !achievement.unlocked[index] && score >= rank) {
                        achievement.unlocked[index] = true;
                        unlockedAchievements.unshift({ ...achievement, rank: index + 1 });
                    }
                });
            }
        });
        saveUser(data);
    }
    return unlockedAchievements;
}

function getHighScores(game) {
    const data = getUser();
    return data.highScores[game];
}

function addHighScore(game, id, score, date) {
    try {
        let data = getUser();
        console.log("Got data for adding:", game, id, score, date);
    
        if (!data.highScores[game]) {
            data.highScores[game] = {};
        }
        if (!data.highScores[game][id]) {
            data.highScores[game][id] = [];
        }
    
        data.highScores[game][id].push({ score, date });
        data.highScores[game][id].sort((a, b) => a.score - b.score);
        saveUser(data);
    } catch (error) {
        console.error("Error adding new highscore:", error);
    }
}

function removeHighScore(game, id, score, date) {
    let data = getUser();

    if (!data.highScores[game] || !data.highScores[game][id]) {
        console.warn(`No high scores found for game "${game}" and id "${id}".`);
        return false;
    }

    const index = data.highScores[game][id].findIndex(record => record.score === score && record.date === date);
    if (index !== -1) {
        data.highScores[game][id].splice(index, 1);
        saveData(data);
        console.log(`High score removed for game "${game}", id "${id}", score "${score}", date "${date}".`);
        return true;
    } else {
        console.warn(`No matching high score found for game "${game}", id "${id}", score "${score}", date "${date}".`);
        return false;
    }
}

module.exports = {
    saveUser,
    saveSettings,
    hasFlag,
    setFlag,
    ensureAppDirExists,
    
    getUser,
    getSettings,
    getGames,
    getTypes,
    getAchievements,
    getHighScores,

    addHighScore,
    removeHighScore,
    unlockAchievement
};