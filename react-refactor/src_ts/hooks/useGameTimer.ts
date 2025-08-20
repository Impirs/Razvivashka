import { useEffect, useRef, useState } from 'react';

// Custom hook to avoid duplicating timer logic across all game components
// Provides consistent timer behavior with automatic cleanup and reset capabilities
// Centralizes timer state management instead of repeating useEffect patterns

interface UseGameTimerOptions {
    isPlaying: boolean;
    startedAt?: number;
    onTimeUpdate?: (seconds: number) => void;
    dependencies?: any[];
}

interface UseGameTimerReturn {
    seconds: number;
    resetTimer: () => void;
}

export const useGameTimer = ({ 
    isPlaying, 
    startedAt, 
    onTimeUpdate,
    dependencies = [] 
}: UseGameTimerOptions): UseGameTimerReturn => {
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<number | null>(null);
    const lastStartRef = useRef<number | null>(null);

    const resetTimer = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        // Let useEffect handle state reset automatically
    };

    // Timer controller
    useEffect(() => {
        if (isPlaying && startedAt) {
            // Reset timer state when game starts
            if (lastStartRef.current !== startedAt) {
                lastStartRef.current = startedAt;
                setSeconds(0);

                // clear previous interval
                if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                }

                // Start new interval
                timerRef.current = window.setInterval(() => {
                    setSeconds(prevSeconds => {
                        const newSeconds = prevSeconds + 1;
                        onTimeUpdate?.(newSeconds);
                        return newSeconds;
                    });
                }, 1000);
            }
        } else {
            // Stop timer only if it's active
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // Reset seconds only when transitioning to idle, NOT when game ends
            if (!isPlaying && !startedAt && lastStartRef.current !== null) {
                lastStartRef.current = null;
                setSeconds(0);
            }
        }

        // Cleanup on unmount
        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isPlaying, startedAt, onTimeUpdate, ...dependencies]);

    return { seconds, resetTimer };
};
