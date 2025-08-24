import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { 
    GameStoreState, 
    User, 
    GameAchievement,
    UserAchievement,
    UserGameRecord
} from '../types/gamestore';

// Data-only context for game store state
// Split from actions to prevent unnecessary re-renders when only state changes
// Components that only need to read data don't re-render on action reference changes
interface GameStoreDataContextType {
    currentUser: User | null;
    allAchievements: Record<string, GameAchievement[]>;
    usersList: string[];
    loading: boolean;
    error: string | null;
    dispatch: React.Dispatch<any>;
}

// Initial state
const initialState: GameStoreState = {
    currentUser: null,
    allAchievements: {},
    usersList: [],
    loading: false,
    error: null,
};

const GameStoreDataContext = createContext<GameStoreDataContextType | undefined>(undefined);

function gameStoreDataReducer(state: GameStoreState, action: any): GameStoreState {
    switch (action.type) {
        case 'LOGIN_SUCCESS': {
            // Normalize user data to ensure required properties exist
            const normalizedUser = {
                ...action.payload,
                achievements: Array.isArray(action.payload.achievements) ? action.payload.achievements : [],
                gameRecords: Array.isArray(action.payload.gameRecords) ? action.payload.gameRecords : [],
            };
            return { ...state, currentUser: normalizedUser, loading: false };
        }
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
                        ...state.currentUser!.gameRecords,
                        {
                            gameId: action.payload.gameId,
                            gameProps: action.payload.gameProps,
                            modification: Array.isArray(action.payload.modifications) ? action.payload.modifications : [],
                            isperfect: !!action.payload.isPerfect,
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
                        (() => {
                            // Determine required tiers count based on definitions
                            const defs = state.allAchievements[action.payload.gameId] || [];
                            const def = defs.find((d) => d.gameProps === action.payload.gameProps);
                            const tiers = new Array(def?.requirements?.length || 0).fill(false);
                            return {
                                gameId: action.payload.gameId,
                                gameProps: action.payload.gameProps,
                                unlockedTiers: tiers,
                            };
                        })()
                    ],
                },
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'UPDATE_USERS_LIST':
            // console.log('Reducer: Updating users list to:', action.payload);
            return { ...state, usersList: action.payload };
        default:
            return state;
    }
}

export const GameStoreDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(gameStoreDataReducer, initialState);

    // Load achievements definitions at startup so unlocks work even if Achievements page wasn't opened
    useEffect(() => {
        const loadAchievements = async () => {
            try {
                const achievements = await import('@/data/achievements.json');
                console.log('Loaded achievements from file:', achievements.default);
                
                const achievementsByGame = achievements.default.reduce((acc: Record<string, GameAchievement[]>, achievement: GameAchievement) => {
                    if (!acc[achievement.gameId]) {
                        acc[achievement.gameId] = [];
                    }
                    acc[achievement.gameId].push(achievement);
                    return acc;
                }, {});

                console.log('Grouped achievements by game:', Object.fromEntries(
                    Object.entries(achievementsByGame).map(([k, v]) => [k, v.length])
                ));

                // Add all achievement definitions
                for (const [gameId, gameAchievements] of Object.entries(achievementsByGame)) {
                    dispatch({
                        type: 'ADD_GAME_ACHIEVEMENTS',
                        payload: { gameId, achievements: gameAchievements },
                    });
                }
            } catch (error) {
                console.error('Failed to load achievements:', error);
            }
        };

        loadAchievements();
    }, []);

    // Auto-login on initialization
    useEffect(() => {
        const initUser = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                // Load users list
                const usersList = window.gameStoreAPI.listUsers();
                dispatch({ type: 'UPDATE_USERS_LIST', payload: usersList });

                const currentUserSetting = window.settingsAPI.get('currentUser') as unknown as string;
                const userData = await window.gameStoreAPI.loadUserData(currentUserSetting || 'user');
                
                if (userData) {
                    const normalizedUser = normalizeUserAchievements(userData, state.allAchievements);
                    dispatch({ type: 'LOGIN_SUCCESS', payload: normalizedUser });
                } else {
                    dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
                }
            } catch (error) {
                console.error('Failed to initialize user:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize user' });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        // Only init after achievements are loaded
        if (Object.keys(state.allAchievements).length > 0) {
            initUser();
        }
    }, [state.allAchievements]);

    // Memoized context value to prevent unnecessary rerenders
    const contextValue = useMemo(() => ({
        currentUser: state.currentUser,
        allAchievements: state.allAchievements,
        usersList: state.usersList,
        loading: state.loading,
        error: state.error,
        dispatch
    }), [state.currentUser, state.allAchievements, state.usersList, state.loading, state.error]);

    return (
        <GameStoreDataContext.Provider value={contextValue}>
            {children}
        </GameStoreDataContext.Provider>
    );
};

// Hook to access game store data
export const useGameStoreData = () => {
    const context = useContext(GameStoreDataContext);
    if (!context) {
        throw new Error('useGameStoreData must be used within a GameStoreDataProvider');
    }
    return context;
};

// Utility function to normalize user achievements (moved from original file)
function normalizeUserAchievements(user: User, allAchievements: Record<string, GameAchievement[]>): User {
    // Ensure user has required properties
    const normalizedUser = {
        ...user,
        achievements: Array.isArray(user.achievements) ? user.achievements : [],
        gameRecords: Array.isArray(user.gameRecords) ? user.gameRecords : [],
    };

    console.log('Normalizing user achievements for Queens game');

    const getReqs = (gameId: string, props: string): number[] => {
        const defs = allAchievements[gameId] || [];
        const def = defs.find(d => d.gameProps === props);
        return def?.requirements ?? [];
    };

    // Get all unique gameId + gameProps combinations from achievements
    const allDefs = Object.values(allAchievements).flat();
    const uniqueKeys = [...new Set(allDefs.map(a => `${a.gameId}|${a.gameProps}`))];

    // Normalize existing and keep only those that still exist, fixing tiers length
    const normalizedExisting = normalizedUser.achievements
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

    console.log('Queens achievements after normalization:', { 
        queensTotal: normalizedExisting.concat(missing).filter(a => a.gameId === 'queens').length
    });

    return {
        ...normalizedUser,
        achievements: [...normalizedExisting, ...missing],
    };
}
