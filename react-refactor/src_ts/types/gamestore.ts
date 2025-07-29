// Achievement definition (shared across all users)
export type GameAchievement = {
    gameId: string;
    gameProps: string; // game-specific properties
    title: string;
    description: string;
    requirements: number[]; // [bronze, silver, gold] thresholds
};

// User-specific achievement progress
export type UserAchievement = {
    gameId: string;
    gameProps: string; // game-specific properties
    unlockedTiers: boolean[]; // Which tiers are unlocked [bronze, silver, gold]
};

// User game progress
export type UserGameRecord = {
    gameId: string;
    gameProps: string; // game-specific properties
    score: number; // Current score
    lastPlayed: Date;   
};

// Complete user profile
export type User = {
    username: string;
    gameRecords: UserGameRecord[];
    achievements: UserAchievement[];
};

// Game store state
export type GameStoreState = {
    currentUser: User | null;
    allAchievements: Record<string, GameAchievement[]>; // { gameId: Achievement[] }
    loading: boolean;
    error: string | null;
};

// Game store actions
export type GameStoreActions = {
    login: (username: string) => Promise<void>;
    logout: () => void;
    addGameAchievements: (gameId: string, achievements: GameAchievement[]) => void;
    unlockAchievementCheck: (gameId: string, gameProps: string, score: number) => void;
    addGameRecord: (gameId: string, gameProps: string, score: number) => void;
    // claimAchievementReward: (achievementId: string, tier: number) => boolean;
};

export type GameStoreContextType = GameStoreState & GameStoreActions;