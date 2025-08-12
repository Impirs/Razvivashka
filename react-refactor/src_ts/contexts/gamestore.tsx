import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
    GameStoreContextType, 
    GameStoreState, 
    User, 
    GameAchievement,
    UserAchievement,
    UserGameRecord
} from '../types/gamestore';

// Initial state
const initialState: GameStoreState = {
    currentUser: null,
    allAchievements: {},
    loading: false,
    error: null,
};

const GameStoreContext = createContext<GameStoreContextType | undefined>(undefined);

function gameStoreReducer(state: GameStoreState, action: any): GameStoreState {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, currentUser: action.payload, loading: false };
        case 'LOGOUT':
            return { ...initialState };
        case 'ADD_GAME_ACHIEVEMENTS':
            return {
                ...state,
                allAchievements: {
                    ...state.allAchievements,
                    [action.payload.gameId]: action.payload.achievements,
                },
            };
        case 'ADD_GAME_RECORD':
            return {
                ...state,
                currentUser: {
                    ...state.currentUser!,
                    gameRecords: [
                        ...state.currentUser!.gameRecords.filter(
                            r => r.gameId !== action.payload.gameId || r.gameProps !== action.payload.gameProps
                        ),
                        {
                            gameId: action.payload.gameId,
                            gameProps: action.payload.gameProps,
                            modification: [''], // default placeholder to satisfy [string]
                            isperfect: false,
                            score: action.payload.score,
                            played: new Date(),
                        }
                    ],
                },
            };
        case 'UPDATE_ACHIEVEMENT':
            return {
                ...state,
                currentUser: {
                    ...state.currentUser!,
                    achievements: state.currentUser!.achievements.map(a => 
                        a.gameId === action.payload.gameId && a.gameProps === action.payload.gameProps
                            ? { ...a, unlockedTiers: action.payload.unlockedTiers }
                            : a
                    ),
                },
            };
        case 'ADD_NEW_ACHIEVEMENT':
            return {
                ...state,
                currentUser: {
                    ...state.currentUser!,
                    achievements: [
                        ...state.currentUser!.achievements,
                        {
                            gameId: action.payload.gameId,
                            gameProps: action.payload.gameProps,
                            unlockedTiers: [false, false, false],
                        }
                    ],
                },
            };
        default:
            return state;
    }
}

export const GameStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(gameStoreReducer, initialState);

    // If the same app is used for multiple accounts, then
    // save user in local storage but save the ability to change "account" in settings
    // So there will be several users in storage file with all related data
    const login = async (username: string) => {
        try {
            const userData: User = await window.gameStoreAPI.loadUserData(username);
            
            // Initialize achievements if missing
            const initializedUser = initializeUserAchievements(userData, state.allAchievements);
            
            dispatch({ type: 'LOGIN_SUCCESS', payload: initializedUser });
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => {
        if (state.currentUser) {
            // Save data before logout
            window.gameStoreAPI.saveUserData(state.currentUser.username, state.currentUser);
        }
        dispatch({ type: 'LOGOUT' });
    };

    // Switch active user profile and persist choice to settings
    const switchUser = async (username: string): Promise<boolean> => {
        if (!username) return false;
        if (state.currentUser?.username === username) return true;
        // Save current state before switching
        if (state.currentUser) {
            window.gameStoreAPI.saveUserData(state.currentUser.username, state.currentUser);
        }
        // Persist selection and login
        window.settingsAPI.set('currentUser', username as any);
        await login(username);
        return true;
    };

    const listUsers = (): string[] => {
        try {
            return window.gameStoreAPI.listUsers();
        } catch {
            return [];
        }
    };

    const createUser = async (username: string, switchTo: boolean = true): Promise<boolean> => {
        if (!username) return false;
        const ok = window.gameStoreAPI.createUser(username);
        if (!ok) return false;
        if (switchTo) {
            window.settingsAPI.set('currentUser', username as any);
            await login(username);
        }
        return true;
    };

    const deleteUser = async (username: string): Promise<boolean> => {
        if (!username) return false;
        const isCurrent = state.currentUser?.username === username;
        const ok = window.gameStoreAPI.deleteUser(username);
        if (!ok) return false;
        if (isCurrent) {
            // Preload resets currentUser to 'user' in settings when deleting current
            const nextUser = window.settingsAPI.get('currentUser') as unknown as string;
            await login(nextUser || 'user');
        }
        return true;
    };

    const renameCurrentUser = async (newUsername: string): Promise<boolean> => {
        if (!state.currentUser || !newUsername) return false;
        const old = state.currentUser.username;
        if (old === newUsername) return true;
        const ok = window.gameStoreAPI.renameUser(old, newUsername);
        if (!ok) return false;
        // Persist and refresh state from storage to be safe
        window.settingsAPI.set('currentUser', newUsername as any);
        await login(newUsername);
        return true;
    };

    const addGameAchievements = (gameId: string, achievements: GameAchievement[]) => {
        dispatch({
            type: 'ADD_GAME_ACHIEVEMENTS',
            payload: { gameId, achievements }
        });

        // Update current user's achievements if logged in
        if (state.currentUser) {
            const newAchievements = achievements.filter(achievement => 
                !state.currentUser!.achievements.some(
                    a => a.gameId === achievement.gameId && a.gameProps === achievement.gameProps
                )
            );

            newAchievements.forEach(achievement => {
                dispatch({
                    type: 'ADD_NEW_ACHIEVEMENT',
                    payload: {
                        gameId: achievement.gameId,
                        gameProps: achievement.gameProps,
                    }
                });
            });
        }
    };

    const addGameRecord = (gameId: string, gameProps: string, score: number) => {
        if (!state.currentUser) return;

        // Add the new game record
        dispatch({
            type: 'ADD_GAME_RECORD',
            payload: { gameId, gameProps, score }
        });

        // Check for unlocked achievements
        unlockAchievementCheck(gameId, gameProps, score);
    };

    const unlockAchievementCheck = (gameId: string, gameProps: string, score: number) => {
        if (!state.currentUser) return;

        const gameAchievements = state.allAchievements[gameId]?.filter(
            a => a.gameProps === gameProps
        ) || [];

        gameAchievements.forEach(achievement => {
            const userAchievement = state.currentUser!.achievements.find(
                a => a.gameId === gameId && a.gameProps === gameProps
            );

            if (!userAchievement) return;

            // requirements are ordered [gold, silver, bronze]
            // unlockedTiers is [bronze, silver, gold]
            const newUnlockedTiers = [
                // bronze (requirements[2])
                (userAchievement.unlockedTiers[0] || (achievement.requirements[2] != null && score >= achievement.requirements[2])) ?? false,
                // silver (requirements[1])
                (userAchievement.unlockedTiers[1] || (achievement.requirements[1] != null && score >= achievement.requirements[1])) ?? false,
                // gold (requirements[0])
                (userAchievement.unlockedTiers[2] || (achievement.requirements[0] != null && score >= achievement.requirements[0])) ?? false,
            ];

            // If any tier was unlocked, update the achievement
            if (newUnlockedTiers.some((unlocked, i) => unlocked !== userAchievement.unlockedTiers[i])) {
                dispatch({
                    type: 'UPDATE_ACHIEVEMENT',
                    payload: {
                        gameId,
                        gameProps,
                        unlockedTiers: newUnlockedTiers,
                    }
                });

                // TODO:
                // Call notification context to show the unlocked achievement
                console.log(`Unlocked achievement: ${achievement.gameId} - ${achievement.gameProps}`, newUnlockedTiers);
            }
        });
    };

    // Initialize user achievements when achievements are added or user logs in
    useEffect(() => {
        if (state.currentUser && Object.keys(state.allAchievements).length > 0) {
            const initializedUser = initializeUserAchievements(state.currentUser, state.allAchievements);
            if (initializedUser.achievements.length !== state.currentUser.achievements.length) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: initializedUser });
            }
        }
    }, [state.allAchievements]);

    // Auto-login selected user on startup
    useEffect(() => {
        const selected = window.settingsAPI.get('currentUser') as unknown as string;
        const username = selected || 'user';
        login(username);
    }, []);

    // Persist current user data whenever it changes (records/achievements, etc.)
    useEffect(() => {
        if (!state.currentUser) return;
        try {
            window.gameStoreAPI.saveUserData(state.currentUser.username, state.currentUser);
        } catch (e) {
            console.error('Failed to persist user data:', e);
        }
    }, [state.currentUser]);

    return (
        <GameStoreContext.Provider
            value={{
                ...state,
                login,
                logout,
                addGameAchievements,
                unlockAchievementCheck,
                addGameRecord,
                // user management
                listUsers,
                switchUser,
                createUser,
                deleteUser,
                renameCurrentUser,
            }}
        >
            {children}
        </GameStoreContext.Provider>
    );
};

// Helper function to initialize user achievements
function initializeUserAchievements(user: User, allAchievements: Record<string, GameAchievement[]>): User {
    // Get all unique gameId + gameProps combinations from achievements
    const allAchievementKeys = Object.values(allAchievements)
        .flat()
        .map(a => `${a.gameId}|${a.gameProps}`);
    const uniqueKeys = [...new Set(allAchievementKeys)];

    // Filter out achievements that no longer exist
    const filteredAchievements = user.achievements.filter(a => 
        uniqueKeys.includes(`${a.gameId}|${a.gameProps}`)
    );

    // Add missing achievements
    const userAchievementKeys = user.achievements.map(a => `${a.gameId}|${a.gameProps}`);
    const missingAchievements = uniqueKeys
        .filter(key => !userAchievementKeys.includes(key))
        .map(key => {
            const [gameId, gameProps] = key.split('|');
            return {
                gameId,
                gameProps,
                unlockedTiers: [false, false, false],
            };
        });

    return {
        ...user,
        achievements: [...filteredAchievements, ...missingAchievements],
    };
}

export const useGameStore = () => {
    const context = useContext(GameStoreContext);
    if (!context) {
        throw new Error('useGameStore must be used within a GameStoreProvider');
    }
    return context;
};