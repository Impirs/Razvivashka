import { 
    addHighScore, unlockAchievement,
    getAchievements, getHighScores, getGames,
    parseAchievementId, generateAchievementId 
} from './data_manager.js';

document.addEventListener("DOMContentLoaded", () => {   
    const games = getGames();
    const allRecords = [];

    const game_list = document.getElementById("game_list");
    const game_records = document.getElementById("achievements_list");

    function getAllRecords() {
        for (let game of games) {
            const achievements = getAchievements(game.id);
            if (!achievements || !Array.isArray(achievements)) {
                console.error(`Achievements for game ${game.id} is not an array or is undefined.`);
                continue;
            }
            const records = [];
            for (let achievement of achievements) {
                records.push({
                    game: game.id,
                    title: achievement.title,
                    description: `Закончить игру в режиме ${achievement.id} за ${Math.min(...achievement.ranks)} секунд или быстрее.`,
                    ranks: achievement.ranks,
                    unlocked: achievement.unlocked,
                });
            }
            allRecords.push(...records);
        }
        console.log(allRecords);
    }

    function renderGameList() {
        game_list.innerHTML = '';
        const allItem = document.createElement("div");
        allItem.textContent = "Все игры";
        allItem.dataset.gameId = 'all';
        allItem.classList.add("game_list_item");
        allItem.addEventListener("click", () => {
            renderAchievements('all');
        });
        game_list.appendChild(allItem);
        for (let game of games) {
            const gameItem = document.createElement("div");
            gameItem.textContent = game.title;
            gameItem.dataset.gameId = game.id;
            gameItem.classList.add("game_list_item");
            gameItem.addEventListener("click", () => {
                renderAchievements(game.id);
            });
            game_list.appendChild(gameItem);
        }
    }

    function renderAchievements(gameId) {
        game_records.innerHTML = '';
        for (let record of allRecords) {
            console.log("Record:", record);
            if (gameId === 'all' || record.game === gameId) {
                const achievement = document.createElement("div");
                achievement.classList.add("achievement");

                const trophies = document.createElement("div");
                trophies.classList.add("trophies");
                for (let i = 0; i < record.ranks.length; i++) {
                    const trophy = document.createElement("div");
                    trophy.classList.add("achievement_icon");
                    trophy.id = "trophy";
                    const unlocked = record.unlocked[i];
                    trophy.classList.add(unlocked ? "unlocked" : "locked");
                    trophy.classList.add(`rank_${i + 1}`);
                    trophies.appendChild(trophy);
                }

                const description = document.createElement("div");
                description.classList.add("description");
                description.innerHTML = `
                    <h3>${record.title}</h3>
                    <p>${record.description}</p>
                `;

                achievement.appendChild(trophies);
                achievement.appendChild(description);
                game_records.appendChild(achievement);
            }
        }
    }

    getAllRecords();
    renderGameList();
    renderAchievements('all');
});