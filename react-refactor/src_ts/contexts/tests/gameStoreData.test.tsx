import React from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import { GameStoreDataProvider, useGameStoreData } from '../gameStoreData';
import { User, GameAchievement } from '../../types/gamestore';

// Mock window.gameStoreAPI and settingsAPI
const mockGameStoreAPI = {
    loadUserData: jest.fn(),
    saveUserData: jest.fn(),
    listUsers: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    loadGameAchievements: jest.fn(),
};

const mockSettingsAPI = {
    get: jest.fn(() => 'user'),
    set: jest.fn(),
};

Object.defineProperty(window, 'gameStoreAPI', {
    value: mockGameStoreAPI,
    writable: true,
});

Object.defineProperty(window, 'settingsAPI', {
    value: mockSettingsAPI,
    writable: true,
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <GameStoreDataProvider>{children}</GameStoreDataProvider>
);

describe('GameStoreData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock returns to prevent errors
        mockGameStoreAPI.loadGameAchievements.mockResolvedValue([]);
        mockSettingsAPI.get.mockReturnValue('user');
    });

    describe('GameStoreDataProvider', () => {
        it('renders children without crashing', () => {
            const { container } = render(
                <GameStoreDataProvider>
                    <div>Test Content</div>
                </GameStoreDataProvider>
            );
            expect(container.textContent).toBe('Test Content');
        });

        it('initializes user data on mount', async () => {
            const mockUser = {
                username: 'testuser',
                achievements: [],
                gameRecords: [],
            };
            
            mockGameStoreAPI.loadUserData.mockResolvedValue(mockUser);
            mockSettingsAPI.get.mockReturnValue('testuser');

            render(
                <GameStoreDataProvider>
                    <div>Test</div>
                </GameStoreDataProvider>
            );

            // Wait for async initialization
            await waitFor(() => {
                expect(mockGameStoreAPI.loadUserData).toHaveBeenCalledWith('testuser');
            }, { timeout: 1000 });
        });
    });

    describe('useGameStoreData hook', () => {
        it('throws error when used outside provider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => {
                renderHook(() => useGameStoreData());
            }).toThrow('useGameStoreData must be used within a GameStoreDataProvider');
            
            consoleSpy.mockRestore();
        });

        it('provides initial state values', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            expect(result.current.currentUser).toBeNull();
            expect(result.current.allAchievements).toEqual({});
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(typeof result.current.dispatch).toBe('function');
        });
    });

    describe('Reducer actions', () => {
        it('handles LOGIN_SUCCESS action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockUser: User = {
                username: 'testuser',
                achievements: [],
                gameRecords: [],
            };

            // Access the dispatch function and test reducer behavior
            const dispatch = result.current.dispatch;
            
            React.act(() => {
                dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            });

            expect(result.current.currentUser).toEqual(mockUser);
            expect(result.current.loading).toBe(false);
        });

        it('handles LOGOUT action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockUser: User = {
                username: 'testuser',
                achievements: [],
                gameRecords: [],
            };

            React.act(() => {
                // First login
                result.current.dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            });

            expect(result.current.currentUser).toEqual(mockUser);

            React.act(() => {
                // Then logout
                result.current.dispatch({ type: 'LOGOUT' });
            });

            expect(result.current.currentUser).toBeNull();
            expect(result.current.allAchievements).toEqual({});
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('handles SET_LOADING action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            React.act(() => {
                result.current.dispatch({ type: 'SET_LOADING', payload: true });
            });

            expect(result.current.loading).toBe(true);

            React.act(() => {
                result.current.dispatch({ type: 'SET_LOADING', payload: false });
            });

            expect(result.current.loading).toBe(false);
        });

        it('handles SET_ERROR action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            React.act(() => {
                result.current.dispatch({ type: 'SET_ERROR', payload: 'Test error message' });
            });

            expect(result.current.error).toBe('Test error message');
        });

        it('handles ADD_GAME_ACHIEVEMENTS action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockAchievements: GameAchievement[] = [
                {
                    gameId: 'test-game',
                    gameProps: '4x4',
                    requirements: [100, 75, 50], // [gold, silver, bronze]
                },
            ];

            React.act(() => {
                result.current.dispatch({
                    type: 'ADD_GAME_ACHIEVEMENTS',
                    payload: { gameId: 'test-game', achievements: mockAchievements },
                });
            });

            expect(result.current.allAchievements).toEqual({
                'test-game': mockAchievements,
            });
        });

        it('handles ADD_GAME_RECORD action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockUser: User = {
                username: 'testuser',
                achievements: [],
                gameRecords: [],
            };

            const mockRecord = {
                gameId: 'test-game',
                gameProps: '4x4',
                score: 100,
                isPerfect: false,
                modifications: [],
            };

            React.act(() => {
                // First set user
                result.current.dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            });

            React.act(() => {
                // Add game record
                result.current.dispatch({ type: 'ADD_GAME_RECORD', payload: mockRecord });
            });

            expect(result.current.currentUser?.gameRecords).toHaveLength(1);
            const addedRecord = result.current.currentUser?.gameRecords[0];
            expect(addedRecord?.gameId).toBe('test-game');
            expect(addedRecord?.gameProps).toBe('4x4');
            expect(addedRecord?.score).toBe(100);
            expect(addedRecord?.isperfect).toBe(false);
            expect(addedRecord?.modification).toEqual([]);
            expect(addedRecord?.played).toBeInstanceOf(Date);
        });

        it('handles UPDATE_ACHIEVEMENT action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockUser: User = {
                username: 'testuser',
                achievements: [
                    {
                        gameId: 'test-game',
                        gameProps: '4x4',
                        unlockedTiers: [false, false, false],
                    }
                ],
                gameRecords: [],
            };

            const mockAchievementUpdate = {
                gameId: 'test-game',
                gameProps: '4x4',
                unlockedTiers: [true, false, false], // Update to unlock first tier
            };

            React.act(() => {
                // First set user
                result.current.dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            });

            React.act(() => {
                // Update achievement
                result.current.dispatch({ type: 'UPDATE_ACHIEVEMENT', payload: mockAchievementUpdate });
            });

            expect(result.current.currentUser?.achievements).toHaveLength(1);
            expect(result.current.currentUser?.achievements[0]).toEqual(mockAchievementUpdate);
        });

        it('handles ADD_NEW_ACHIEVEMENT action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockUser: User = {
                username: 'testuser',
                achievements: [],
                gameRecords: [],
            };

            const testAchievements: GameAchievement[] = [
                {
                    gameId: 'test-game',
                    gameProps: '4x4',
                    requirements: [100, 75, 50], // [gold, silver, bronze]
                },
            ];

            // First set achievements definitions
            React.act(() => {
                result.current.dispatch({
                    type: 'ADD_GAME_ACHIEVEMENTS',
                    payload: { gameId: 'test-game', achievements: testAchievements },
                });
            });

            React.act(() => {
                // Set user
                result.current.dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            });

            React.act(() => {
                // Add new achievement
                result.current.dispatch({
                    type: 'ADD_NEW_ACHIEVEMENT',
                    payload: { gameId: 'test-game', gameProps: '4x4' },
                });
            });

            expect(result.current.currentUser?.achievements).toHaveLength(1);
            expect(result.current.currentUser?.achievements[0]).toEqual({
                gameId: 'test-game',
                gameProps: '4x4',
                unlockedTiers: [false, false, false], // Based on requirements array length
            });
        });

        it('handles UPDATE_USER_PROFILE action', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockUser: User = {
                username: 'testuser',
                achievements: [],
                gameRecords: [],
            };

            React.act(() => {
                // First set user
                result.current.dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            });

            React.act(() => {
                // Update profile - this action doesn't exist, so state should remain unchanged
                result.current.dispatch({
                    type: 'UPDATE_USER_PROFILE',
                    payload: { username: 'newusername' },
                });
            });

            // Since UPDATE_USER_PROFILE doesn't exist in reducer, username should remain unchanged
            expect(result.current.currentUser?.username).toBe('testuser');
        });

        it('handles unknown action type', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const initialState = {
                currentUser: result.current.currentUser,
                allAchievements: result.current.allAchievements,
                loading: result.current.loading,
                error: result.current.error,
            };

            React.act(() => {
                result.current.dispatch({ type: 'UNKNOWN_ACTION', payload: 'test' });
            });

            // State should remain unchanged
            expect(result.current.currentUser).toBe(initialState.currentUser);
            expect(result.current.allAchievements).toEqual(initialState.allAchievements);
            expect(result.current.loading).toBe(initialState.loading);
            expect(result.current.error).toBe(initialState.error);
        });
    });

    describe('Data normalization', () => {
        it('handles user data without achievements', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockUser = {
                username: 'testuser',
                gameRecords: [],
                // Missing achievements property
            } as unknown as User;

            React.act(() => {
                result.current.dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            });

            expect(result.current.currentUser?.achievements).toBeDefined();
            expect(Array.isArray(result.current.currentUser?.achievements)).toBe(true);
        });

        it('handles user data without gameRecords', () => {
            const { result } = renderHook(() => useGameStoreData(), {
                wrapper: TestWrapper,
            });

            const mockUser = {
                username: 'testuser',
                achievements: [],
                // Missing gameRecords property
            } as unknown as User;

            React.act(() => {
                result.current.dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            });

            expect(result.current.currentUser?.gameRecords).toBeDefined();
            expect(Array.isArray(result.current.currentUser?.gameRecords)).toBe(true);
        });
    });
});
