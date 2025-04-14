const fs = require('fs');
const path = require('path');

function cleanTitlesAndDescriptions(userData, settingsData) {
    for (const game in userData.achievements) {
        userData.achievements[game] = userData.achievements[game].map(ach => {
            const { title, description, ...cleanAch } = ach;
            return cleanAch;
        });
    }

    if (Array.isArray(userData.games)) {
        userData.games = userData.games.map(game => {
            const { title, description, ...cleanGame } = game;
            return cleanGame;
        });
    }

    if (settingsData.games) {
        for (const game in settingsData.games) {
            for (const key in settingsData.games[game]) {
                if (settingsData.games[game][key].description) {
                    delete settingsData.games[game][key].description;
                }
            }
        }
    }

    return { userData, settingsData };
}

function saveCleanedData(userPath, settingsPath, userData, settingsData) {
    fs.writeFileSync(userPath, JSON.stringify(userData, null, 2));
    fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2));
}

module.exports = {
    cleanTitlesAndDescriptions,
    saveCleanedData
};