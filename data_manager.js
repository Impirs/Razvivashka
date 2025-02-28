const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "data.json");

function loadData() {
    try {
        if (!fs.existsSync(dataPath)) {
            console.log("JSON file not found. Creating a new one...");
            saveData({
                settings: { volume: 50, password: new_password },
                user: { name: "Guest", highScores: {}, achievements: [] }
            });
        }
        return JSON.parse(fs.readFileSync(dataPath, "utf8"));
    } catch (error) {
        console.error("Error loading JSON:", error);
        return {};
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), "utf8");
        console.log("Data saved!");
    } catch (error) {
        console.error("Error saving JSON:", error);
    }
}

function updateData(section, key, value) {
    let data = loadData();
    if (data[section]) {
        data[section][key] = value;
        saveData(data);
    } else {
        console.error(`Section "${section}" not found in JSON.`);
    }
}

function addAchievement(id, name) {
    let data = loadData();
    if (!data.user.achievements.some(ach => ach.id === id)) {
        data.user.achievements.push({ id, name, unlocked: false });
        saveData(data);
    }
}

function unlockAchievement(id) {
    let data = loadData();
    let achievement = data.user.achievements.find(ach => ach.id === id);
    if (achievement) {
        achievement.unlocked = true;
        saveData(data);
    } else {
        console.error(`Achievement with ID ${id} not found.`);
    }
}


module.exports = { loadData, saveData, updateData, addAchievement, unlockAchievement};
