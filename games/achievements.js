import { unlockAchievement, parseAchievementId } from '../data_manager.js';

let notificationQueue = [];
let isDisplayingNotification = false;
const achieveSound = document.getElementById("achieve_sound");

export function checkAchievement(game, id, score) {
    let unlockedAchievements = unlockAchievement(game, id, score);
    if (unlockedAchievements.length > 0) {
        notificationQueue.push(...unlockedAchievements);
        if (!isDisplayingNotification) {
            displayNextNotification();
        }
    }
}

function displayNextNotification() {
    if (notificationQueue.length === 0) {
        isDisplayingNotification = false;
        return;
    }
    
    isDisplayingNotification = true;
    let achievement = notificationQueue.shift();
    
    let notification = document.createElement("div");
    let icon = document.createElement("div");
    icon.classList.add("achievement_icon");
    icon.classList.add(`rank_${achievement.rank}`);
    icon.id = "trophy";
    let avards_section = document.createElement("div");
    avards_section.classList.add("avards_section");
    let title = document.createElement("h3");
    title.textContent = achievement.title;
    let description = document.createElement("p");
    const parsed = parseAchievementId(achievement.id);
    description.textContent = `Закончить игру с размером игровой доски ${parsed.size} за ${achievement.ranks[achievement.rank - 1]} секунд или быстрее.`;

    notification.classList.add("achievement_notification");
    notification.addEventListener('click', () => {
        window.location.href = '../../pages/page_achievements.html'
    })
    console.log(`Достижение разблокировано: ${achievement.title} (Ранг ${achievement.rank})`);
    
    const container = document.querySelector(".game_container") || document.body;
    notification.appendChild(icon);
    avards_section.appendChild(title);
    avards_section.appendChild(description);
    notification.appendChild(avards_section);
    container.appendChild(notification);

    achieveSound.play();
    
    setTimeout(() => {
        notification.remove();
        displayNextNotification();
    }, 3000);
}