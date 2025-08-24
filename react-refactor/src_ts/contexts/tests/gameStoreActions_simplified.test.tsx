import React from 'react';
import { renderHook } from '@testing-library/react';
import { GameStoreActionsProvider, useGameStoreActions } from '../gameStoreActions';

// Mock window APIs first
const mockGameStoreAPI = {
    loadUserData: jest.fn(),
    saveUserData: jest.fn(),
    listUsers: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    renameUser: jest.fn(),
    loadGameAchievements: jest.fn(),
};

const mockSettingsAPI = {
    get: jest.fn(),
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

// Mock dependencies
jest.mock('../gameStoreData', () => {
    return {
        useGameStoreData: () => ({
            dispatch: jest.fn(),
            currentUser: {
                username: 'testuser',
                achievements: [],
                gameRecords: [],
            },
            allAchievements: {
                'test-game': [
                    {
                        gameId: 'test-game',
                        gameProps: '4x4',
                        requirements: [100, 75, 50],
                    },
                ],
            },
            loading: false,
            error: null,
        }),
    };
});

jest.mock('../notifProvider', () => ({
    useNotification: () => ({
        addNotification: jest.fn(),
    }),
}));

jest.mock('../i18n', () => ({
    useTranslations: () => ({
        t: (key: string) => key,
    }),
}));

// Simple test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <GameStoreActionsProvider>{children}</GameStoreActionsProvider>
);

describe('GameStoreActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useGameStoreActions hook', () => {
        it('throws error when used outside provider', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => {
                renderHook(() => useGameStoreActions());
            }).toThrow('useGameStoreActions must be used within a GameStoreActionsProvider');
            
            consoleSpy.mockRestore();
        });

        it('provides all required methods', () => {
            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            expect(typeof result.current.login).toBe('function');
            expect(typeof result.current.logout).toBe('function');
            expect(typeof result.current.switchUser).toBe('function');
            expect(typeof result.current.listUsers).toBe('function');
            expect(typeof result.current.createUser).toBe('function');
            expect(typeof result.current.deleteUser).toBe('function');
            expect(typeof result.current.renameCurrentUser).toBe('function');
            expect(typeof result.current.addGameAchievements).toBe('function');
            expect(typeof result.current.addGameRecord).toBe('function');
            expect(typeof result.current.unlockAchievementCheck).toBe('function');
        });
    });

    describe('User management', () => {
        it('logs in user successfully', async () => {
            const mockUserData = {
                username: 'testuser',
                achievements: [],
                gameRecords: [],
            };

            mockGameStoreAPI.loadUserData.mockResolvedValue(mockUserData);

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            await result.current.login('testuser');

            expect(mockGameStoreAPI.loadUserData).toHaveBeenCalledWith('testuser');
        });

        it('handles login failure gracefully', async () => {
            mockGameStoreAPI.loadUserData.mockResolvedValue(null);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            await result.current.login('nonexistent');

            expect(consoleSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('logs out current user', () => {
            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            result.current.logout();

            expect(mockGameStoreAPI.saveUserData).toHaveBeenCalledWith(
                'testuser',
                expect.objectContaining({ username: 'testuser' })
            );
        });

        it('switches user successfully', async () => {
            const mockUserData = {
                username: 'newuser',
                achievements: [],
                gameRecords: [],
            };

            mockGameStoreAPI.loadUserData.mockResolvedValue(mockUserData);

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const success = await result.current.switchUser('newuser');

            expect(success).toBe(true);
            expect(mockSettingsAPI.set).toHaveBeenCalledWith('currentUser', 'newuser');
            expect(mockGameStoreAPI.saveUserData).toHaveBeenCalledWith(
                'testuser',
                expect.objectContaining({ username: 'testuser' })
            );
        });

        it('returns true when switching to same user', async () => {
            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const success = await result.current.switchUser('testuser');

            expect(success).toBe(true);
            expect(mockGameStoreAPI.loadUserData).not.toHaveBeenCalled();
        });

        it('returns false for empty username', async () => {
            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const success = await result.current.switchUser('');

            expect(success).toBe(false);
        });

        it('lists users', () => {
            const mockUsers = ['user1', 'user2', 'user3'];
            mockGameStoreAPI.listUsers.mockReturnValue(mockUsers);

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const users = result.current.listUsers();

            expect(users).toEqual(mockUsers);
            expect(mockGameStoreAPI.listUsers).toHaveBeenCalled();
        });

        it('handles listUsers error gracefully', () => {
            mockGameStoreAPI.listUsers.mockImplementation(() => {
                throw new Error('API Error');
            });

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const users = result.current.listUsers();

            expect(users).toEqual([]);
        });

        it('creates user successfully', async () => {
            mockGameStoreAPI.createUser.mockReturnValue(true);
            const mockUserData = {
                username: 'newuser',
                achievements: [],
                gameRecords: [],
            };
            mockGameStoreAPI.loadUserData.mockResolvedValue(mockUserData);

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const success = await result.current.createUser('newuser', true);

            expect(success).toBe(true);
            expect(mockGameStoreAPI.createUser).toHaveBeenCalledWith('newuser');
            expect(mockSettingsAPI.set).toHaveBeenCalledWith('currentUser', 'newuser');
        });

        it('creates user without switching', async () => {
            mockGameStoreAPI.createUser.mockReturnValue(true);

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const success = await result.current.createUser('newuser', false);

            expect(success).toBe(true);
            expect(mockGameStoreAPI.createUser).toHaveBeenCalledWith('newuser');
            expect(mockSettingsAPI.set).not.toHaveBeenCalled();
        });

        it('returns false for empty username in createUser', async () => {
            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const success = await result.current.createUser('');

            expect(success).toBe(false);
            expect(mockGameStoreAPI.createUser).not.toHaveBeenCalled();
        });

        it('deletes user successfully', async () => {
            mockGameStoreAPI.deleteUser.mockReturnValue(true);

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            const success = await result.current.deleteUser('userToDelete');

            expect(success).toBe(true);
            expect(mockGameStoreAPI.deleteUser).toHaveBeenCalledWith('userToDelete');
        });
    });

    describe('Game data management', () => {
        it('adds game achievements', () => {
            const mockAchievements = [
                {
                    gameId: 'test-game',
                    gameProps: '4x4',
                    requirements: [100, 75, 50],
                },
            ];

            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            // This should not throw
            expect(() => {
                result.current.addGameAchievements('test-game', mockAchievements);
            }).not.toThrow();
        });

        it('adds game record', () => {
            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            // This should not throw
            expect(() => {
                result.current.addGameRecord('test-game', '4x4', 100, true, ['mod1']);
            }).not.toThrow();
        });

        it('checks achievement unlock', () => {
            const { result } = renderHook(() => useGameStoreActions(), {
                wrapper: TestWrapper,
            });

            // This should not throw
            expect(() => {
                result.current.unlockAchievementCheck('test-game', '4x4', 100, true);
            }).not.toThrow();
        });
    });
});
