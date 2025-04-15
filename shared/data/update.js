function cleanTitlesAndDescriptions(dataType, data) {
    switch (dataType) {
        case 'user' : 
            for (const game in data.achievements) {
                data.achievements[game] = data.achievements[game].map(ach => {
                    const { title, description, ...cleanAch } = ach;
                    return cleanAch;
                })
            }
            if (Array.isArray(data.games)) {
                data.games = data.games.map(game => {
                    const { title, description, ...cleanGame } = game;
                    return cleanGame;
                });
            }
            break;
        case 'settings' :
            for (const game in data.games) {
                for (const key in data.games[game]) {
                    const feature = data.games[game][key];
                    const { description, ...cleanFeature } = feature;
                    data.games[game][key] = cleanFeature;
                }
            }
            break;
        default:
            throw new Error(`Unknown dataType: ${dataType}`);
    }

    return data;
}

module.exports = {
    cleanTitlesAndDescriptions
};