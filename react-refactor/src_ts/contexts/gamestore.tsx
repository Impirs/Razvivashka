import React, { createContext, useContext, useReducer, useEffect } from 'react';
import achievementsData from '@/data/achievements.json';
import { 
    GameStoreContextType, 
    GameStoreState, 
    User, 
    GameAchievement,
    UserAchievement,
    UserGameRecord
} from '../types/gamestore';
import { generateAchievementProps } from '@/utils/pt';
import { useNotification } from './notifProvider';
import { useLanguage } from './i18n';

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
        default:
            return state;
    }
}

export const GameStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(gameStoreReducer, initialState);
    const { addNotification } = useNotification();
    const { t } = useLanguage();

    // Load achievements definitions at startup so unlocks work even if Achievements page wasn't opened
    useEffect(() => {
        if (Object.keys(state.allAchievements).length > 0) return;
        try {
            const grouped = new Map<string, any[]>();
            (achievementsData as any[]).forEach((a) => {
                const arr = grouped.get(a.gameId) ?? [];
                arr.push(a);
                grouped.set(a.gameId, arr);
            });
            grouped.forEach((list, gameId) => {
                dispatch({
                    type: 'ADD_GAME_ACHIEVEMENTS',
                    payload: {
                        gameId,
                        achievements: list.map((l) => ({ gameId: l.gameId, gameProps: l.gameProps, requirements: l.requirements })),
                    },
                });
            });
        } catch (e) {
            console.error('Failed to load achievements data:', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If the same app is used for multiple accounts, then
    // save user in local storage but save the ability to change "account" in settings
    // So there will be several users in storage file with all related data
    const login = async (username: string) => {
        try {
            const userData: User = await window.gameStoreAPI.loadUserData(username);

            // If achievements definitions aren't loaded yet, don't normalize now to avoid wiping progress.
            // We'll normalize once allAchievements are available (see effect below).
            if (Object.keys(state.allAchievements).length === 0) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
            } else {
                const initializedUser = initializeUserAchievements(userData, state.allAchievements);
                dispatch({ type: 'LOGIN_SUCCESS', payload: initializedUser });
            }
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

    const addGameRecord = (gameId: string, gameProps: string, score: number, isPerfect: boolean = false, modifications?: string[]) => {
        if (!state.currentUser) return;

        // Add the new game record
        dispatch({
            type: 'ADD_GAME_RECORD',
            payload: { gameId, gameProps, score, isPerfect, modifications }
        });
    };

    const unlockAchievementCheck = (
        gameId: string, 
        gameProps: string, 
        score: number, 
        isPerfect: boolean = false
    ) => {
        if (!state.currentUser) return;

        // Build list of achievement props to check. If perfect run, check both normal and x100 variants.
        const toCheck = new Set<string>();
        const normalProps = generateAchievementProps(gameId, gameProps, false);
        if (normalProps) toCheck.add(normalProps);
        if (isPerfect) {
            const perfectProps = generateAchievementProps(gameId, gameProps, true);
            if (perfectProps) toCheck.add(perfectProps);
        }

        toCheck.forEach((achievementProps) => {
            const gameAchievements = state.allAchievements[gameId]?.filter(
                a => a.gameProps === achievementProps
            ) || [];

            gameAchievements.forEach(achievement => {
                const userAchievement = state.currentUser!.achievements.find(
                    a => a.gameId === gameId && a.gameProps === achievementProps
                );

                if (!userAchievement) {
                    // console.log(`No user achievement found for ${gameId}/${achievementProps}`);
                    return;
                }

                // requirements are ordered from highest tier down (gold, silver, bronze)
                // For our games, lower score (time) is better, so unlock when score <= required
                const newUnlockedTiers = achievement.requirements.map((req, idx) => {
                    const prev = userAchievement.unlockedTiers[idx] || false;
                    const unlocked = prev || (typeof req === 'number' && score <= req);
                    // console.log(`Tier ${idx}: prev=${prev}, req=${req}, score=${score}, unlocked=${unlocked}`);
                    return unlocked;
                });

                // If any tier was unlocked, update the achievement
                if (newUnlockedTiers.some((unlocked, i) => unlocked !== userAchievement.unlockedTiers[i])) {
                    // console.log(`Achievement unlocked! Updating and showing notification`);

                    dispatch({
                        type: 'UPDATE_ACHIEVEMENT',
                        payload: {
                            gameId,
                            gameProps: achievementProps,
                            unlockedTiers: newUnlockedTiers,
                        }
                    });
                    
                    const titleKey = t(`achievements.${achievement.gameId}.${achievement.gameProps}.title`);
                    const baseDescKey = t(`achievements.${achievement.gameId}.${achievement.gameProps}.description`);
                    
                    // Find which tier was just unlocked (highest tier that was just unlocked)
                    const newlyUnlockedTierIndex = newUnlockedTiers.findIndex((unlocked, i) => 
                        unlocked && !userAchievement.unlockedTiers[i]
                    );
                    
                    // Create enhanced description with requirements info
                    let enhancedTitle = titleKey;
                    let enhancedDesc = baseDescKey;
                    if (newlyUnlockedTierIndex !== -1 && achievement.requirements[newlyUnlockedTierIndex]) {
                        const requiredTime = achievement.requirements[newlyUnlockedTierIndex];
                        const tierNames = ['🥇', '🥈', '🥉'];
                        const tierName = tierNames[newlyUnlockedTierIndex] || '🏆';

                        enhancedTitle += ` ${tierName}`;

                        if (!enhancedDesc.trim().endsWith('.')) {
                            enhancedDesc += `${requiredTime} ${t('record.seconds')}.`;
                        }

                        // Add actual time achieved if better than requirement
                        // if (score < requiredTime) {
                        //     enhancedDesc += ` (${score} ${t('record.seconds')}!)`;
                        // }
                    }
                    
                    // Add Notification with enhanced text
                    addNotification("achievement", enhancedTitle, enhancedDesc);
                }
            });
        });
    };

    // Initialize user achievements when achievements are added or user logs in
    useEffect(() => {
        if (state.currentUser && Object.keys(state.allAchievements).length > 0) {
            const initializedUser = initializeUserAchievements(state.currentUser, state.allAchievements);
            const needsUpdate =
                initializedUser.achievements.length !== state.currentUser.achievements.length ||
                // also update if any tiers length mismatches
                initializedUser.achievements.some((ua) => {
                    const existing = state.currentUser!.achievements.find(
                        a => a.gameId === ua.gameId && a.gameProps === ua.gameProps
                    );
                    return !existing || existing.unlockedTiers.length !== ua.unlockedTiers.length;
                });
            if (needsUpdate) {
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
function initializeUserAchievements(
    user: User, 
    allAchievements: Record<string, GameAchievement[]>
): User {
    // Helper to find requirements for a given achievement
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

export const useGameStore = () => {
    const context = useContext(GameStoreContext);
    if (!context) {
        throw new Error('useGameStore must be used within a GameStoreProvider');
    }
    return context;
};