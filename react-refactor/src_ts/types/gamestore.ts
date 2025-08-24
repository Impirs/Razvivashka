// Achievement definition (shared across all users)
export type GameAchievement = {
    gameId: string;
    gameProps: string; // game-specific properties
    requirements: number[]; // [gold, silver, bronze] thresholds
};

// User-specific achievement progress
export type UserAchievement = {
    gameId: string;
    gameProps: string; // game-specific properties
    unlockedTiers: boolean[]; // Which tiers are unlocked [gold, silver, bronze]
};

// User game progress
export type UserGameRecord = {
    gameId: string;
    gameProps: string; // game-specific properties
    modification: string[]; // list of modifications applied during the run
    isperfect: boolean; // whether the game is perfect
    score: number; // Current score
    played: Date;   
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
    usersList: string[]; // List of all available users
    loading: boolean;
    error: string | null;
};

// Game store actions
export type GameStoreActions = {
    login: (username: string) => Promise<void>;
    logout: () => void;
    addGameAchievements: (gameId: string, achievements: GameAchievement[]) => void;
    unlockAchievementCheck: (gameId: string, 
                            gameProps: string, 
                            score: number, 
                            isPerfect?: boolean) => void;
    addGameRecord: (gameId: string, 
                    gameProps: string, 
                    score: number, 
                    isPerfect?: boolean, 
                    modifications?: string[]) => void;
    // User management
    listUsers: () => string[];
    switchUser: (username: string) => Promise<boolean>;
    createUser: (username: string, switchTo?: boolean) => Promise<boolean>;
    deleteUser: (username: string) => Promise<boolean>;
    renameCurrentUser: (newUsername: string) => Promise<boolean>;
    // claimAchievementReward: (achievementId: string, tier: number) => boolean;
};

export type GameStoreContextType = GameStoreState & GameStoreActions;