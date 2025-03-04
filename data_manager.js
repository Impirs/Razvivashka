const initialData = {
    user: {
        name: "default",
        highScores: {},
        achievements: {
            "digit": [
                { id: "7x6", ranks: [60, 120], unlocked: [false, false], title: "Отличное начало!" },
                { id: "7x7", ranks: [60, 120], unlocked: [false, false], title: "7Я" },
                { id: "7x8", ranks: [60, 120], unlocked: [false, false], title: "Знаток основ" },
                { id: "9x8", ranks: [120, 180, 240], unlocked: [false, false, false], title: "Высшая лига" },
                { id: "9x9", ranks: [120, 180, 240], unlocked: [false, false, false], title: "Юный математик" },
                { id: "9x10", ranks: [120, 180, 240], unlocked: [false, false, false], title: "Профессионал" },
                { id: "7x100", ranks: [10000], unlocked: [false], title: "Идеальный подход" },
                { id: "9x100", ranks: [20000], unlocked: [false], title: "Идеальный подход" },
            ],
        },
        games: [
            {id: "digit", title: "Состав числа"},
            {id: "sum", title: "Сумма чисел"},
            {id: "multi", title: "Произведение чисел"},
        ]
    },
    settings: {
        volume: 100,
        password: "default",
        games: {
            "digit": {
                show_available: true,
            },
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

export function changePassword(new_password) {
    let data = loadData();
    data.settings.password = new_password;
    saveData(data);
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

export function getPassword() {
    let data = loadData();
    return data.settings.password;
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
