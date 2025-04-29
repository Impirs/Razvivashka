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

function saveUser(data) {
    ensureAppDirExists();
    writeJSON(userFile, data);
}

function saveSettings(data) {
    ensureAppDirExists();
    writeJSON(settingsFile, data);
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

function getHighScores() {
    const data = getUser();
    return data.highScores;
}

function getGameSettings() {
    const data = getSettings();
    return data.games;
}

function getVolume() {
    const data = getSettings();
    return data.volume;
}

function getName() {
    const data = getUser();
    return data.name;
}

function setName(name) {
    if (typeof name !== "string") {
        throw new TypeError("The 'name' argument must be a string.");
    }
    const data = getUser();
    data.name = name.trim();
    saveUser(data);
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
        return true;
    } catch (error) {
        console.error("Error adding new highscore:", error);
        return false;
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
        saveUser(data);
        console.log(`High score removed for game "${game}", id "${id}", score "${score}", date "${date}".`);
        return true;
    } else {
        console.warn(`No matching high score found for game "${game}", id "${id}", score "${score}", date "${date}".`);
        return false;
    }
}

function getPlayedCounter(game, id) {
    try {
        const data = loadData();
        const playedGame = data.user.played[game]?.find(entry => entry.id === id);
        return playedGame ? playedGame.count : 0;
    } catch (error) {
        console.error(`Error getting played counter for game "${game}" and id "${id}":`, error);
        return 0;
    }
}

function setPlayedCounter(game, id, counter) {
    try {
        const data = loadData();
        let playedGame = data.user.played[game]?.find(entry => entry.id === id);

        if (playedGame) {
            playedGame.count = counter; 
        } else {
            if (!data.user.played[game]) {
                data.user.played[game] = [];
            }
            data.user.played[game].push({ id, count: counter });
        }

        saveData(data);
    } catch (error) {
        console.error(`Error setting played counter for game "${game}" and id "${id}":`, error);
    }
}

module.exports = {
    saveUser,
    saveSettings,
    hasFlag,
    setFlag,
    ensureAppDirExists,
    
    getUser,
    getName,
    getGames,
    getTypes,
    getAchievements,
    getHighScores,
    getPlayedCounter,

    getSettings,
    getVolume,
    getGameSettings,

    setName,
    addHighScore,
    setPlayedCounter,
    removeHighScore,
    unlockAchievement
};