import { useGameStoreData } from '../contexts/gameStoreData';
import { useGameStoreActions } from '../contexts/gameStoreActions';
import { useLanguageState, useTranslations } from '../contexts/i18n';
import { useGameController } from '../contexts/gameController';

// Selective hooks for better performance - only subscribe to specific data
// Instead of consuming entire contexts, these hooks provide granular access
// This prevents components from re-rendering on unrelated context changes

// Only user data
export const useCurrentUser = () => {
    const { currentUser } = useGameStoreData();
    return currentUser;
};

// Only loading state
export const useGameStoreLoading = () => {
    const { loading } = useGameStoreData();
    return loading;
};

// Only achievements data
export const useAchievements = () => {
    const { allAchievements, currentUser } = useGameStoreData();
    return {
        allAchievements,
        userAchievements: currentUser?.achievements || []
    };
};

// Only game records
export const useGameRecords = () => {
    const { currentUser } = useGameStoreData();
    return currentUser?.gameRecords || [];
};

// Only user management actions
export const useUserManagement = () => {
    const { login, logout, switchUser, listUsers, createUser, deleteUser, renameCurrentUser } = useGameStoreActions();
    return {
        login,
        logout,
        switchUser,
        listUsers,
        createUser,
        deleteUser,
        renameCurrentUser
    };
};

// Only game data actions
export const useGameActions = () => {
    const { addGameAchievements, addGameRecord, unlockAchievementCheck } = useGameStoreActions();
    return {
        addGameAchievements,
        addGameRecord,
        unlockAchievementCheck
    };
};

// Language-only hooks
export const useCurrentLanguage = () => {
    const { language } = useLanguageState();
    return language;
};

export const useTranslationFunction = () => {
    try {
        const { t } = useTranslations();
        return t;
    } catch (error) {
        console.warn('Translation context not available, using fallback');
        // Fallback translation function
        return (key: string) => key;
    }
};

// GameController selective hooks
export const useGameStatus = () => {
    const { status } = useGameController();
    return status;
};

export const useGameScore = () => {
    const { score } = useGameController();
    return score;
};

export const useGameControllerActions = () => {
    const { startGame, endGame, updateScore, setGameContext, setModifications } = useGameController();
    return { startGame, endGame, updateScore, setGameContext, setModifications };
};

export const useGameSession = () => {
    const { status, startedAt, gameId, gameProps, isPerfect } = useGameController();
    return { status, startedAt, gameId, gameProps, isPerfect };
};

// Re-export language hooks for convenience
export { useLanguageState } from '../contexts/i18n';
