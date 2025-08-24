// Debug functions for testing notifications
// These functions will be available in the browser console for testing

import { NotificationType } from '../../types/notification';

// Global notification testing function
(window as any).testNotification = (type: NotificationType = 'achievement', title?: string, message?: string) => {
    const defaultTitles = {
        achievement: 'Тестовое достижение!',
        update: 'Доступно обновление',
        warning: 'Предупреждение'
    };
    
    const defaultMessages = {
        achievement: 'Поздравляем! Вы получили тестовое достижение.',
        update: 'Установите последнюю версию приложения.',
        warning: 'Это тестовое предупреждение.'
    };

    // Get notification context from the app
    const event = new CustomEvent('testNotification', {
        detail: {
            type,
            title: title || defaultTitles[type],
            message: message || defaultMessages[type]
        }
    });
    
    window.dispatchEvent(event);
    console.log(`Test notification sent: ${type} - ${title || defaultTitles[type]}`);
};

// Convenience functions for each notification type
(window as any).testAchievement = (title?: string, message?: string) => {
    const achievementTitle = title || 'Новое достижение!';
    const achievementMessage = message || 'Поздравляем! Вы разблокировали новое достижение.';
    (window as any).testNotification('achievement', achievementTitle, achievementMessage);
};

// Function to test realistic achievement notifications with time requirements
(window as any).testRealisticAchievement = (gameProps?: string, tier: number = 0, actualTime?: number) => {
    const achievements = {
        '7x6': { title: 'Отличное начало', desc: 'Закончить игру на стандартном поле для числа 6 за ', reqs: [60, 90] },
        '7x7': { title: 'Семь+Я', desc: 'Закончить игру на стандартном поле для числа 7 за ', reqs: [75, 105] },
        '7x8': { title: 'Знаток основ', desc: 'Закончить игру на стандартном поле для числа 8 за ', reqs: [90, 120] },
        '9x8': { title: 'Высшая лига', desc: 'Закончить игру на большом поле для числа 8 за ', reqs: [120, 150, 180] }
    };
    
    const props = gameProps || '7x6';
    const achievement = achievements[props as keyof typeof achievements] || achievements['7x6'];
    const tierNames = ['🥇', '🥈', '🥉'];
    const tierName = tierNames[tier] || '🏆';
    const requiredTime = achievement.reqs[tier] || achievement.reqs[0];
    const actualTimeUsed = actualTime || (requiredTime - Math.floor(Math.random() * 20)); // Random time better than requirement
    
    let description = achievement.desc + `${requiredTime}с ${tierName}`;
    if (actualTimeUsed < requiredTime) {
        description += ` (${actualTimeUsed}с!)`;
    }
    
    (window as any).testNotification('achievement', achievement.title, description);
};

(window as any).testUpdate = (title?: string, message?: string) => {
    (window as any).testNotification('update', title, message);
};

(window as any).testWarning = (title?: string, message?: string) => {
    (window as any).testNotification('warning', title, message);
};

// Function to test multiple notifications (queue testing)
(window as any).testNotificationQueue = () => {
    setTimeout(() => (window as any).testAchievement('Первое достижение', 'Это первое тестовое достижение'), 100);
    setTimeout(() => (window as any).testUpdate('Обновление 1.0.1', 'Доступна новая версия'), 200);
    setTimeout(() => (window as any).testWarning('Внимание!', 'Тестовое предупреждение'), 300);
    setTimeout(() => (window as any).testAchievement('Второе достижение', 'Это второе тестовое достижение'), 400);
    console.log('Sent 4 test notifications to queue');
};

// Function to test real achievement notifications
(window as any).testRealAchievement = (gameId: string = 'digit', gameProps: string = '7x7') => {
    const tierNames = ['🥉 Бронза', '🥈 Серебро', '🥇 Золото'];
    const randomTier = tierNames[Math.floor(Math.random() * tierNames.length)];
    
    const gameNames = {
        'digit': 'Числовая композиция',
        'shulte': 'Таблица Шульте'
    };
    
    const gameName = gameNames[gameId as keyof typeof gameNames] || gameId;
    const randomTime = Math.floor(Math.random() * 60) + 30; // 30-90 seconds
    
    (window as any).testAchievement(
        `${randomTier} - ${gameName}`,
        `Поздравляем! Вы прошли игру за ${randomTime} секунд или быстрее!`
    );
    
    console.log(`Sent real achievement notification: ${randomTier} in ${gameName}`);
};

console.log(`
Notification Debug Functions Available:
- testNotification(type, title?, message?) - Send custom notification
- testAchievement(title?, message?) - Send achievement notification  
- testRealisticAchievement(gameProps?, tier?, actualTime?) - Test realistic achievement with timing
- testUpdate(title?, message?) - Send update notification
- testWarning(title?, message?) - Send warning notification
- testNotificationQueue() - Test multiple notifications
- testRealAchievement(gameId?, gameProps?) - Test realistic achievement

Example usage:
testAchievement("Мастер игры", "Вы завершили все уровни!")
testRealisticAchievement("7x7", 0, 55) - Gold achievement for 7x7 in 55 seconds (req: 75s)
testRealAchievement("digit", "7x7")
testNotificationQueue()
`);
