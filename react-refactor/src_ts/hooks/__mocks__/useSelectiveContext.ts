// Mock for useSelectiveContext.ts to provide all selective hooks
// This mock prevents the real file from importing actual context dependencies

const mockT = (key: string): string => {
    const mockTranslations: Record<string, string> = {
        'buttons.filter': 'Выберите...',
        'routes.home': 'Развивашка',
        'routes.catalog': 'Каталог',
        'routes.settings': 'Настройки',
        'routes.achievements': 'Достижения',
        'buttons.play': 'Играть',
        'buttons.back': 'Назад',
        'types.all': 'Все категории',
        'types.math': 'Счет',
        'types.attention': 'Внимательность',
        'types.logic': 'Логика',
        'types.reading': 'Чтение',
        'games.all': 'Все игры',
        'games.digit': 'Состав числа',
        'games.shulte': 'Таблица Шульте',
        'games.queens': 'Ферзи',
        // Settings page translations
        'settings.volume': 'Громкость',
        'settings.notifications': 'Уведомления',
        'settings.effects': 'Эффекты',
        'settings.language': 'Язык',
        'settings.user_management': 'Управление пользователями',
        'settings.current_user': 'Текущий пользователь',
        'settings.gameplay_settings': 'Настройки игр',
        'settings.view_modification': 'Показывать модификации',
        'settings.general': 'Общие',
        'settings.player.name': 'Имя игрока',
        'settings.player.placeholder': 'Введите имя',
        'settings.language.label': 'Язык интерфейса',
        'settings.language.options.ru': 'Русский',
        'settings.volume.notifications': 'Уведомления',
        'settings.volume.effects': 'Эффекты',
        'settings.gameplay.label': 'Настройки игр',
        'settings.gameplay.digit.label': 'Состав числа',
        'settings.gameplay.digit.description': 'Показывать подсказки',
        'settings.gameplay.shulte.label': 'Таблица Шульте',
        'settings.gameplay.shulte.description': 'Показывать подсказки',
        'settings.gameplay.queens.label': 'Ферзи',
        'settings.gameplay.queens.description': 'Показывать подсказки',
        // Achievement page translations
        'achievements.filter': 'Фильтр достижений',
        'achievements.all': 'Все игры',
        // Home page translations
        'navigation.exit': 'Выход'
    };
    return mockTranslations[key] || key;
};

// User data hooks
export const useCurrentUser = () => ({ id: 1, name: 'TestUser' });
export const useAllUsers = () => ([{ id: 1, name: 'TestUser' }]);
export const useCurrentUserData = () => ({ totalTime: 1000, gamesPlayed: 5 });

// Game actions hooks
export const useGameActions = () => ({
    restart: jest.fn(),
    win: jest.fn(),
    lose: jest.fn(),
    setStatus: jest.fn()
});

// Language hooks
export const useCurrentLanguage = () => 'ru';
export const useTranslationFunction = () => mockT;

// GameController hooks
export const useGameStatus = () => 'idle';
export const useGameSound = () => ({
    playWin: jest.fn(),
    playLose: jest.fn(),
    playClick: jest.fn()
});

// Settings hooks
export const useSettingsControllers = () => ({
    volume: { notifications: 0.5, effects: 0.5 },
    language: 'ru',
    setVolume: jest.fn(),
    setLanguage: jest.fn()
});

export const useGameSettings = () => ({
    digit: { view_modification: true },
    shulte: { view_modification: true },
    setSetting: jest.fn()
});

// Achievement hooks
export const useAllAchievements = () => ([
    {
        id: 'digit_speed',
        name: 'Speed Master',
        description: 'Complete digit game quickly',
        tiers: [
            { level: 1, threshold: 10, name: 'Bronze', unlocked: false },
            { level: 2, threshold: 5, name: 'Silver', unlocked: false },
            { level: 3, threshold: 3, name: 'Gold', unlocked: false }
        ]
    }
]);

export const useFilteredAchievements = () => ([
    {
        id: 'digit_speed',
        name: 'Speed Master',
        description: 'Complete digit game quickly',
        tiers: [
            { level: 1, threshold: 10, name: 'Bronze', unlocked: false },
            { level: 2, threshold: 5, name: 'Silver', unlocked: false },
            { level: 3, threshold: 3, name: 'Gold', unlocked: false }
        ]
    }
]);

// User management hooks
export const useUserManagement = () => ({
    listUsers: jest.fn(() => [{ id: 1, name: 'TestUser' }]),
    switchUser: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    renameCurrentUser: jest.fn()
});
