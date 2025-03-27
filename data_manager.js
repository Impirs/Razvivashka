const initialData = {
    user: {
        name: "default",
        highScores: {},
        achievements: {
            "digit": [
                { id: "7x6", ranks: [150, 200], unlocked: [false, false], title: "Отличное начало!" },
                { id: "7x7", ranks: [150, 200], unlocked: [false, false], title: "Семь+Я" },
                { id: "7x8", ranks: [150, 200], unlocked: [false, false], title: "Знаток основ" },
                { id: "9x8", ranks: [180, 240, 360], unlocked: [false, false, false], title: "Высшая лига" },
                { id: "9x9", ranks: [180, 240, 360], unlocked: [false, false, false], title: "Юный математик" },
                { id: "9x10", ranks: [180, 240, 360], unlocked: [false, false, false], title: "Профессионал" },
                { id: "7x100", ranks: [10000], unlocked: [false], title: "Идеальный подход" },
                { id: "9x100", ranks: [20000], unlocked: [false], title: "Идеальный подход" },
            ],
            "syllable": [
                { id: "1x1", ranks: [1, 5, 10], unlocked: [false, false, false], title: "Секреты букваря" },
                { id: "1x2", ranks: [1, 5, 10], unlocked: [false, false, false], title: "Весёлый буквоед" },
                { id: "2x1", ranks: [1, 5, 10], unlocked: [false, false, false], title: "Загадочный шёпот" },
                { id: "2x2", ranks: [1, 5, 10], unlocked: [false, false, false], title: "Читающий герой" }
            ],
            "shulte": [
                { id: "4x4", ranks: [45, 60, 90], unlocked: [false, false, false], title: "Зоркий глаз"},
                { id: "5x5", ranks: [60, 90, 120], unlocked: [false, false, false], title: "Сама Внимательность"}
            ],
        },  
        games: [
            {id: "digit", title: "Состав числа", type: "count"},
            {id: "shulte", title: "Таблица Шульте", type: "attention"},
            {id: "syllable", title: "Гласные - согласные", type: "reading"},
            //{id: "sum", title: "Сумма чисел", type: "count"},
            //{id: "multi", title: "Произведение чисел", type: "count"},
        ]
    },
    settings: {
        volume: {
            notification: 0.5,
            game_effects: 0.5,
        },
        games: {
            "digit": {
                show_available: {
                    state: true,
                    description: "Подсвечивать доступные к нажатию клетки другим цветом"
                },
            },
            "syllable": {
                check_all_letters_tested: {
                    state: true,
                    description: "Засчитывать упражнения только когда все буквы были прочитаны"
                },
            },
            "shulte": {
                shide_scored: {
                    state: true,
                    description: "Скрывать цифры после нажатия"
                } 
            }
        }
    }
};

function initData() {
    saveData(initialData);
}

function loadData() {
    try {
        const data = localStorage.getItem('gameData');
        if (!data) {
            console.log("Data not found. Initializing new data...");
            initData();
            return initialData;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading data:", error);
        return initialData;
    }
}

function saveData(data) {
    try {
        localStorage.setItem('gameData', JSON.stringify(data));
        // console.log("Data saved!");
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

export function updateData(section, key, value) {
    let data = loadData();
    if (data[section]) {
        data[section][key] = value;
        saveData(data);
    } else {
        console.error(`Section "${section}" not found in data.`);
    }
}

export function addHighScore(game, id, score) {
    let data = loadData();
    if (!data.user.highScores[game]) {
        data.user.highScores[game] = [];
    }
    if (!data.user.highScores[game].some(hs => hs.id === id)) {
        data.user.highScores[game].push({ id, score });
        saveData(data);
        return true;
    } else if (data.user.highScores[game].some(hs => hs.id === id && hs.score > score)) {
        data.user.highScores[game].find(hs => hs.id === id).score = score;
        saveData(data);
        return true;
    } else {
        return false;
    }
}

export function unlockAchievement(game, id, score) {
    let data = loadData();
    let achievements = data.user.achievements[game];
    let unlockedAchievements = [];
    
    if (achievements) {
        achievements.forEach(achievement => {
            if (achievement.id === id) {
                achievement.ranks.forEach((rank, index) => {
                    if (!achievement.unlocked[index] && score < rank) {
                        achievement.unlocked[index] = true;
                        unlockedAchievements.unshift({ ...achievement, rank: index + 1 });
                    }
                });
            }
        });
        saveData(data);
    }
    return unlockedAchievements;
}

export function getName() {
    let data = loadData();
    return data.user.name;
}

export function getVolume() {
    let data = loadData();
    return data.settings.volume;
}

export function getSettings() {
    let data = loadData();
    return data.settings;
}

export function getGames() {
    let data = loadData();
    return data.user.games;
}

export function getAchievements(game) {
    let data = loadData();
    return data.user.achievements[game];
}

export function getHighScores(game) {
    let data = loadData();
    return data.user.highScores[game];
}

export function parseAchievementId(id) {
    const [size, digit] = id.split('x').map(Number);
    //console.log("Size:", size, "Digit:", digit);
    if (isNaN(size) || isNaN(digit)) {
        console.error(`Invalid achievement ID format: size=${size}, digit=${digit}`);
        return { size: undefined, digit: undefined};
    }
    return { size, digit };
}

export function generateAchievementId({ size, digit }) {
    if (size === undefined || digit === undefined ) {
        console.error("Invalid parameters for generating achievement ID");
        return null;
    }
    return `${size}x${digit}`;
}

function changeAchievementScore({ gameId, id, ranks }) {
    let data = loadData();
    let achievements = data.user.achievements[gameId];

    if (achievements) {
        let achievement = achievements.find(ach => ach.id === id);
        if (achievement) {
            achievement.ranks = ranks;
            saveData(data);
            console.log(`Achievement ${id} ranks updated to:`, ranks);
        } else {
            console.error(`Achievement with id ${id} not found.`);
        }
    } else {
        console.error(`No achievements found for game "${gameId}".`);
    }
}

function deleteHighScore(game, id) {
    let data = loadData();
    if (data.user.highScores[game]) {
        data.user.highScores[game] = data.user.highScores[game].filter(hs => hs.id !== id);
        saveData(data);
        console.log(`High score with id ${id} deleted for game ${game}.`);
    } else {
        console.error(`No high scores found for game "${game}".`);
    }
}

function updateAchievementUnlocked(game, id, unlocked) {
    let data = loadData();
    let achievements = data.user.achievements[game];

    if (achievements) {
        let achievement = achievements.find(ach => ach.id === id);
        if (achievement) {
            achievement.unlocked = unlocked;
            saveData(data);
            console.log(`Achievement ${id} unlocked state updated to:`, unlocked);
        } else {
            console.error(`Achievement with id ${id} not found.`);
        }
    } else {
        console.error(`No achievements found for game "${game}".`);
    }
}

function removeInvalidSettings(data) {
    const validSettings = Object.keys(initialData.settings.games);
    let updated = false;

    for (let gameId in data.settings.games) {
        if (validSettings.includes(gameId)) {
            const validKeys = Object.keys(initialData.settings.games[gameId]);
            for (let key in data.settings.games[gameId]) {
                if (!validKeys.includes(key)) {
                    console.log(`Removing invalid setting "${key}" from game "${gameId}".`);
                    delete data.settings.games[gameId][key];
                    updated = true;
                }
            }
        }
    }

    if (updated) {
        console.log("Invalid settings removed. Saving updated data...");
        saveData(data); 
    }
}

export function syncDataWithInitial() {
    let data = loadData();
    let updated = false;

    for (let game in initialData.user.achievements) {
        if (!data.user.achievements[game]) {
            data.user.achievements[game] = initialData.user.achievements[game];
            updated = true;
        } else {
            initialData.user.achievements[game].forEach(initialAchievement => {
                let achievement = data.user.achievements[game].find(ach => ach.id === initialAchievement.id);
                if (!achievement) {
                    data.user.achievements[game].push(initialAchievement);
                    updated = true;
                } else {
                    if (JSON.stringify(achievement.ranks) !== JSON.stringify(initialAchievement.ranks)) {
                        achievement.ranks = initialAchievement.ranks;
                        updated = true;
                    }
                    let highScore = data.user.highScores[game]?.find(hs => hs.id === initialAchievement.id);
                    if (highScore) {
                        initialAchievement.ranks.forEach((rank, index) => {
                            if (highScore.score < rank) {
                                achievement.unlocked[index] = true;
                            } else {
                                achievement.unlocked[index] = false;
                            }
                        });
                    }
                }
            });
        }
    }

    initialData.user.games.forEach(initialGame => {
        let existingGame = data.user.games.find(game => game.id === initialGame.id);
        if (!existingGame) {
            data.user.games.push(initialGame);
            updated = true;
        } else {
            if (existingGame.title !== initialGame.title) {
                existingGame.title = initialGame.title;
                updated = true;
            }
            if (!existingGame.type || existingGame.type !== initialGame.type) {
                existingGame.type = initialGame.type;
                updated = true;
            }
        }
    });

    for (let gameId in initialData.settings.games) {
        if (!data.settings.games[gameId]) {
            data.settings.games[gameId] = initialData.settings.games[gameId];
            updated = true;
        } else {
            for (let settingKey in initialData.settings.games[gameId]) {
                if (!data.settings.games[gameId][settingKey]) {
                    data.settings.games[gameId][settingKey] = initialData.settings.games[gameId][settingKey];
                    updated = true;
                } else {
                    let initialSetting = initialData.settings.games[gameId][settingKey];
                    let currentSetting = data.settings.games[gameId][settingKey];

                    if (typeof currentSetting !== 'object' || currentSetting === null) {
                        data.settings.games[gameId][settingKey] = { ...initialSetting };
                        updated = true;
                    } else {
                        if (currentSetting.state === undefined) {
                            currentSetting.state = initialSetting.state;
                            updated = true;
                        }
                        if (currentSetting.description === undefined) {
                            currentSetting.description = initialSetting.description;
                            updated = true;
                        }
                    }
                }
            }
        }
    }

    removeInvalidSettings(data);

    if (updated) {
        saveData(data);
        console.log("Data synchronized with initial data.");
    } else {
        console.log("Data is already up-to-date.");
    }
}

window.deleteHighScore = deleteHighScore;
window.updateAchievementUnlocked = updateAchievementUnlocked;
window.changeAchievementScore = changeAchievementScore;