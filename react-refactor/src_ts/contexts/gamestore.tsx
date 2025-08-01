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
                            score: action.payload.score,
                            lastPlayed: new Date(),
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

export const GameStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameStoreReducer, initialState);

    // If the same app is used for multiple accounts, then
    // save user in local storage but save the ability to change "account" in settings
    // So there will be several user files on device and family members can switch between them
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

            // Check which tiers can be unlocked based on the score
            const newUnlockedTiers = achievement.requirements.map(
                (requirement, index) => 
                    userAchievement.unlockedTiers[index] || score >= requirement
            );

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

    return (
        <GameStoreContext.Provider
            value={{
                ...state,
                login,
                logout,
                addGameAchievements,
                unlockAchievementCheck,
                addGameRecord,
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