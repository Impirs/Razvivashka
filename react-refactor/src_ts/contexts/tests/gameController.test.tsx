import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { GameControllerProvider, useGameController, GameStatus } from '../gameController';

// Mock sound files
jest.mock('@/assets/sounds/win.mp3', () => 'win.mp3');
jest.mock('@/assets/sounds/defeat.mp3', () => 'defeat.mp3');

// Mock dependencies
jest.mock('@/hooks/useSelectiveContext', () => ({
    useGameActions: () => ({
        addGameRecord: jest.fn(),
        unlockAchievementCheck: jest.fn(),
    }),
}));

jest.mock('../pref', () => ({
    useSettings: () => ({
        get: jest.fn().mockReturnValue({ effects: 0.5 }),
    }),
}));

// Mock Audio constructor
const mockPlay = jest.fn();
const mockAudio = jest.fn().mockImplementation(() => ({
    play: mockPlay,
    volume: 0.5,
}));
(global as any).Audio = mockAudio;

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <GameControllerProvider>{children}</GameControllerProvider>
);

describe('GameController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GameControllerProvider', () => {
        it('renders children without crashing', () => {
            const { container } = render(
                <GameControllerProvider>
                    <div>Test Content</div>
                </GameControllerProvider>
            );
            expect(container.textContent).toBe('Test Content');
        });
    });

    describe('useGameController hook', () => {
        it('throws error when used outside provider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => {
                renderHook(() => useGameController());
            }).toThrow('useGameController must be used within a GameControllerProvider');
            
            consoleSpy.mockRestore();
        });

        it('provides initial state values', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            expect(result.current.status).toBe('idle');
            expect(result.current.score).toBe(0);
            expect(result.current.gameId).toBeUndefined();
            expect(result.current.gameProps).toBeUndefined();
            expect(result.current.isPerfect).toBeUndefined();
            expect(result.current.startedAt).toBeUndefined();
            expect(result.current.modifications).toBeUndefined();
        });

        it('provides all required methods', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            expect(typeof result.current.startGame).toBe('function');
            expect(typeof result.current.endGame).toBe('function');
            expect(typeof result.current.updateScore).toBe('function');
            expect(typeof result.current.setGameContext).toBe('function');
            expect(typeof result.current.setModifications).toBe('function');
        });
    });

    describe('Game state management', () => {
        it('starts game correctly', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.startGame();
            });

            expect(result.current.status).toBe('playing');
            expect(result.current.score).toBe(0);
            expect(result.current.startedAt).toBeDefined();
            expect(typeof result.current.startedAt).toBe('number');
        });

        it('ends game with correct status and score', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.endGame('win', 100);
            });

            expect(result.current.status).toBe('win');
            expect(result.current.score).toBe(100);
        });

        it('updates score correctly', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.updateScore(50);
            });

            expect(result.current.score).toBe(50);

            act(() => {
                result.current.updateScore(75);
            });

            expect(result.current.score).toBe(75);
        });

        it('sets game context correctly', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setGameContext('test-game', '4x4', true);
            });

            expect(result.current.gameId).toBe('test-game');
            expect(result.current.gameProps).toBe('4x4');
            expect(result.current.isPerfect).toBe(true);
        });

        it('sets modifications correctly', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setModifications(['view_modification', 'speed_boost']);
            });

            expect(result.current.modifications).toEqual(['view_modification', 'speed_boost']);
        });

        it('handles empty modifications array', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setModifications([]);
            });

            expect(result.current.modifications).toEqual([]);
        });
    });

    describe('Game completion effects', () => {
        it('does not trigger effects without game context', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.startGame();
                result.current.endGame('win', 100);
            });

            // Audio should not be created without gameId and gameProps
            expect(mockAudio).not.toHaveBeenCalled();
        });

        it('plays win sound on game win', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setGameContext('test-game', '4x4');
                result.current.startGame();
                result.current.endGame('win', 100);
            });

            // Should create audio and attempt to play
            expect(mockAudio).toHaveBeenCalled();
            expect(mockPlay).toHaveBeenCalled();
        });

        it('plays defeat sound on game loss', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setGameContext('test-game', '4x4');
                result.current.startGame();
                result.current.endGame('lose', 0);
            });

            // Should create audio and attempt to play
            expect(mockAudio).toHaveBeenCalled();
            expect(mockPlay).toHaveBeenCalled();
        });

        it('does not trigger effects for same session twice', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setGameContext('test-game', '4x4');
                result.current.startGame();
                result.current.endGame('win', 100);
            });

            // Clear mock calls
            mockAudio.mockClear();
            mockPlay.mockClear();

            act(() => {
                // End game again with same session
                result.current.endGame('win', 150);
            });

            // Should not trigger effects again for same session
            expect(mockAudio).not.toHaveBeenCalled();
            expect(mockPlay).not.toHaveBeenCalled();
        });

        it('allows effects for new session', () => {
            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            // First session
            act(() => {
                result.current.setGameContext('test-game', '4x4');
                result.current.startGame();
                result.current.endGame('win', 100);
            });

            // Clear mock calls
            mockAudio.mockClear();
            mockPlay.mockClear();

            // Start new session
            act(() => {
                result.current.startGame(); // This creates new startedAt timestamp
                result.current.endGame('win', 150);
            });

            // Should trigger effects for new session
            expect(mockAudio).toHaveBeenCalled();
            expect(mockPlay).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('handles audio play errors gracefully', () => {
            mockPlay.mockRejectedValue(new Error('Audio play failed'));

            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            expect(() => {
                act(() => {
                    result.current.setGameContext('test-game', '4x4');
                    result.current.startGame();
                    result.current.endGame('win', 100);
                });
            }).not.toThrow();
        });

        it('handles Audio constructor errors gracefully', () => {
            mockAudio.mockImplementation(() => {
                throw new Error('Audio constructor failed');
            });

            const { result } = renderHook(() => useGameController(), {
                wrapper: TestWrapper,
            });

            expect(() => {
                act(() => {
                    result.current.setGameContext('test-game', '4x4');
                    result.current.startGame();
                    result.current.endGame('win', 100);
                });
            }).not.toThrow();
        });
    });
});
