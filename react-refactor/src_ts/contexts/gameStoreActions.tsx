import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { generateAchievementProps } from '@/utils/pt';
import { useGameStoreData } from './gameStoreData';
import { useNotification } from './notifProvider';
import { useTranslations } from './i18n';
import { User, GameAchievement } from '../types/gamestore';

// Actions-only context for game store operations
// Split from data to prevent re-renders when action references change
// Components that only need actions don't re-render on data changes
interface GameStoreActionsContextType {
    // User management
    login: (username: string) => Promise<void>;
    logout: () => void;
    switchUser: (username: string) => Promise<boolean>;
    listUsers: () => string[];
    createUser: (username: string, switchTo?: boolean) => Promise<boolean>;
    deleteUser: (username: string) => Promise<boolean>;
    renameCurrentUser: (newUsername: string) => Promise<boolean>;
    
    // Game data
    addGameAchievements: (gameId: string, achievements: GameAchievement[]) => void;
    addGameRecord: (gameId: string, gameProps: string, score: number, isPerfect?: boolean, modifications?: string[]) => void;
    unlockAchievementCheck: (gameId: string, gameProps: string, score: number, isPerfect?: boolean) => void;
}

const GameStoreActionsContext = createContext<GameStoreActionsContextType | undefined>(undefined);

export const GameStoreActionsProvider = ({ children }: { children: React.ReactNode }) => {
    const { dispatch, currentUser, allAchievements, usersList } = useGameStoreData();
    const { addNotification } = useNotification();
    const { t } = useTranslations();

    // Helper function to update users list
    const updateUsersList = useCallback(() => {
        const usersList = window.gameStoreAPI.listUsers();
        // console.log('Updating users list:', usersList);
        dispatch({ type: 'UPDATE_USERS_LIST', payload: usersList });
    }, [dispatch]);

    const login = useCallback(async (username: string): Promise<void> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const userData = await window.gameStoreAPI.loadUserData(username);
            if (userData) {
                const normalizedUser = normalizeUserAchievements(userData, allAchievements);
                dispatch({ type: 'LOGIN_SUCCESS', payload: normalizedUser });
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error('Login failed:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Login failed' });
        }
    }, [dispatch, allAchievements]);

    const logout = useCallback(() => {
        if (currentUser) {
            window.gameStoreAPI.saveUserData(currentUser.username, currentUser);
        }
        dispatch({ type: 'LOGOUT' });
    }, [dispatch, currentUser]);

    const switchUser = useCallback(async (username: string): Promise<boolean> => {
        if (!username) return false;
        if (currentUser?.username === username) return true;
        
        // Save current state before switching
        if (currentUser) {
            window.gameStoreAPI.saveUserData(currentUser.username, currentUser);
        }
        
        // Persist selection and login
        window.settingsAPI.set('currentUser', username as any);
        await login(username);
        
        // Update users list after switch (in case new user was created)
        updateUsersList();
        
        return true;
    }, [currentUser, login, updateUsersList]);

    const listUsers = useCallback((): string[] => {
        return usersList || [];
    }, [usersList]);

    const createUser = useCallback(async (username: string, switchTo: boolean = true): Promise<boolean> => {
        if (!username) return false;
        const ok = window.gameStoreAPI.createUser(username);
        if (!ok) return false;
        
        // Update users list immediately
        updateUsersList();
        
        if (switchTo) {
            window.settingsAPI.set('currentUser', username as any);
            await login(username);
        }
        return true;
    }, [login, updateUsersList]);

    const deleteUser = useCallback(async (username: string): Promise<boolean> => {
        if (!username) return false;
        const isCurrent = currentUser?.username === username;
        const ok = window.gameStoreAPI.deleteUser(username);
        if (!ok) return false;
        
        // Update users list immediately
        updateUsersList();
        
        if (isCurrent) {
            // Preload resets currentUser to 'user' in settings when deleting current
            const nextUser = window.settingsAPI.get('currentUser') as unknown as string;
            await login(nextUser || 'user');
        }
        return true;
    }, [currentUser, login, updateUsersList]);

    const renameCurrentUser = useCallback(async (newUsername: string): Promise<boolean> => {
        if (!currentUser || !newUsername) return false;
        
        const oldUsername = currentUser.username;
        const renamedUser = { ...currentUser, username: newUsername };
        
        const ok = window.gameStoreAPI.renameUser(oldUsername, newUsername);
        if (!ok) return false;
        
        // Update users list immediately
        updateUsersList();
        
        // Update user data and persist
        window.settingsAPI.set('currentUser', newUsername as any);
        dispatch({ type: 'LOGIN_SUCCESS', payload: renamedUser });
        
        // Save the renamed user data
        window.gameStoreAPI.saveUserData(newUsername, renamedUser);
        
        return true;
    }, [currentUser, dispatch, updateUsersList]);

    const addGameAchievements = useCallback((gameId: string, achievements: GameAchievement[]) => {
        dispatch({
            type: 'ADD_GAME_ACHIEVEMENTS',
            payload: { gameId, achievements },
        });
    }, [dispatch]);

    const addGameRecord = useCallback((
        gameId: string, 
        gameProps: string, 
        score: number, 
        isPerfect: boolean = false,
        modifications: string[] = []
    ) => {
        // console.log('addGameRecord called:', { gameId, gameProps, score, isPerfect, modifications, currentUser: !!currentUser });
        if (!currentUser) return;

        dispatch({
            type: 'ADD_GAME_RECORD',
            payload: {
                gameId,
                gameProps,
                score,
                isPerfect,
                modifications,
            },
        });

        // Save immediately after adding record
        const updatedUser = {
            ...currentUser,
            gameRecords: [
                ...currentUser.gameRecords,
                {
                    gameId,
                    gameProps,
                    modification: modifications,
                    isperfect: isPerfect,
                    score,
                    played: new Date(),
                }
            ],
        };
        window.gameStoreAPI.saveUserData(currentUser.username, updatedUser);
    }, [currentUser, dispatch]);

    const unlockAchievementCheck = useCallback((
        gameId: string, 
        gameProps: string, 
        score: number, 
        isPerfect: boolean = false
    ) => {
        console.log('unlockAchievementCheck called:', { gameId, gameProps, score, isPerfect, currentUser: !!currentUser });
        if (!currentUser) return;

        // Build list of achievement props to check. 
        // For queens game, perfect results should still check normal achievements only (not x100 variants)
        const toCheck = new Set<string>();
        const normalProps = generateAchievementProps(gameId, gameProps, false);
        if (normalProps) toCheck.add(normalProps);
        
        // Only add perfect props for games other than queens (digit/shulte have x100 achievements)
        if (isPerfect && gameId !== 'queens') {
            const perfectProps = generateAchievementProps(gameId, gameProps, true);
            if (perfectProps) toCheck.add(perfectProps);
        }

        console.log('Checking achievements for props:', Array.from(toCheck));

        toCheck.forEach((achievementProps) => {
            const gameAchievements = allAchievements[gameId]?.filter(
                a => a.gameProps === achievementProps
            ) || [];

            if (gameAchievements.length === 0) {
                console.log('No achievements found for props:', achievementProps);
                return;
            }

            gameAchievements.forEach(achievement => {
                const userAchievement = currentUser.achievements.find(
                    a => a.gameId === gameId && a.gameProps === achievementProps
                );

                if (!userAchievement) {
                    console.log('No user achievement found for:', { gameId, achievementProps });
                    return;
                }

                // requirements are ordered from highest tier down (gold, silver, bronze)
                // For our games, lower score (time) is better, so unlock when score <= required
                const newUnlockedTiers = achievement.requirements.map((req, idx) => {
                    const prev = userAchievement.unlockedTiers[idx] || false;
                    const unlocked = prev || (typeof req === 'number' && score <= req);
                    console.log('Tier check:', { 
                        tier: idx, 
                        requirement: req, 
                        score, 
                        prev, 
                        unlocked: unlocked,
                        scoreCheck: score <= req 
                    });
                    return unlocked;
                });

                console.log('Achievement tier update:', { 
                    gameId, 
                    achievementProps, 
                    oldTiers: userAchievement.unlockedTiers, 
                    newTiers: newUnlockedTiers,
                    hasChanges: newUnlockedTiers.some((unlocked, i) => unlocked !== userAchievement.unlockedTiers[i])
                });

                // If any tier was unlocked, update the achievement
                if (newUnlockedTiers.some((unlocked, i) => unlocked !== userAchievement.unlockedTiers[i])) {
                    dispatch({
                        type: 'UPDATE_ACHIEVEMENT',
                        payload: {
                            gameId,
                            gameProps: achievementProps,
                            unlockedTiers: newUnlockedTiers,
                        }
                    });
                    
                    // Show notification for newly unlocked achievements
                    const newlyUnlocked = newUnlockedTiers.filter((unlocked, i) => 
                        unlocked && !userAchievement.unlockedTiers[i]
                    );
                    
                    if (newlyUnlocked.length > 0) {
                        const tierNames = ['🥇', '🥈', '🥉'];
                        const unlockedTierName = tierNames[newUnlockedTiers.findIndex(tier => tier)] || 'достижение';
                        const notificationtext = t('achievements.notification')
                        const title = t(`achievements.${gameId}.${achievementProps}.title`)
                        const description = t(`achievements.${gameId}.${achievementProps}.description`)

                        console.log('Showing achievement notification:', { unlockedTierName });
                        addNotification(
                            'achievement',
                            `${unlockedTierName} ${notificationtext}`,
                            `${title}: ${description}`
                        );
                    }
                }
            });
        });
    }, [currentUser, allAchievements, dispatch, addNotification, t]);

    // Memoized context value to prevent unnecessary rerenders
    const contextValue = useMemo(() => ({
        login,
        logout,
        switchUser,
        listUsers,
        createUser,
        deleteUser,
        renameCurrentUser,
        addGameAchievements,
        addGameRecord,
        unlockAchievementCheck,
    }), [
        login,
        logout,
        switchUser,
        listUsers,
        createUser,
        deleteUser,
        renameCurrentUser,
        addGameAchievements,
        addGameRecord,
        unlockAchievementCheck,
    ]);

    return (
        <GameStoreActionsContext.Provider value={contextValue}>
            {children}
        </GameStoreActionsContext.Provider>
    );
};

// Hook to access game store actions
export const useGameStoreActions = () => {
    const context = useContext(GameStoreActionsContext);
    if (!context) {
        throw new Error('useGameStoreActions must be used within a GameStoreActionsProvider');
    }
    return context;
};

// Combined hook for backward compatibility
export const useGameStore = () => {
    const data = useGameStoreData();
    const actions = useGameStoreActions();
    
    return {
        ...data,
        ...actions,
    };
};

// Utility function to normalize user achievements
function normalizeUserAchievements(user: User, allAchievements: Record<string, GameAchievement[]>): User {
    const getReqs = (gameId: string, props: string): number[] => {
        const defs = allAchievements[gameId] || [];
        const def = defs.find(d => d.gameProps === props);
        return def?.requirements ?? [];
    };

    // Get all unique gameId + gameProps combinations from achievements
    const allDefs = Object.values(allAchievements).flat();
    const uniqueKeys = [...new Set(allDefs.map(a => `${a.gameId}|${a.gameProps}`))];

    // Normalize existing and keep only those that still exist, fixing tiers length
    const normalizedExisting = user.achievements
        .filter(a => uniqueKeys.includes(`${a.gameId}|${a.gameProps}`))
        .map(a => {
            const reqs = getReqs(a.gameId, a.gameProps);
            const targetLen = reqs.length;
            let tiers = Array.isArray(a.unlockedTiers) ? a.unlockedTiers.slice() : [];
            // Truncate if legacy had more tiers than current
            if (tiers.length > targetLen) tiers = tiers.slice(0, targetLen);
            // If legacy had fewer tiers, extend by copying the last known value (or false if none)
            if (tiers.length < targetLen) {
                const lastVal = tiers.length > 0 ? tiers[tiers.length - 1] : false;
                while (tiers.length < targetLen) tiers.push(lastVal);
            }
            return { ...a, unlockedTiers: tiers };
        });

    const existingKeySet = new Set(normalizedExisting.map(a => `${a.gameId}|${a.gameProps}`));

    // Add missing achievements with proper tiers length
    const missing = uniqueKeys
        .filter(key => !existingKeySet.has(key))
        .map(key => {
            const [gameId, gameProps] = key.split('|');
            const reqs = getReqs(gameId, gameProps);
            return {
                gameId,
                gameProps,
                unlockedTiers: new Array(reqs.length).fill(false),
            };
        });

    return {
        ...user,
        achievements: [...normalizedExisting, ...missing],
    };
}
