import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import winSfx from '@/assets/sounds/win.mp3';
import defeatSfx from '@/assets/sounds/defeat.mp3';
import { useGameActions } from '@/hooks/useSelectiveContext';
import { useSettings } from './pref';

// Define game states
export type GameStatus = 'idle' | 'playing' | 'win' | 'lose';

interface GameControllerState {
    status: GameStatus;
    score: number;
    gameId?: string;
    gameProps?: string; // record props string to identify the game variant (e.g., '7x6', '4x4')
    isPerfect?: boolean; // whether the run qualifies as "perfect" for achievements
    startedAt?: number; // timestamp to identify a run session
    modifications?: string[]; // list of modifiers applied for this run (e.g., ['view_modification'])
}

interface GameControllerContextType extends GameControllerState {
    // start game, resets score and sets status to 'playing'
    startGame: () => void;
    // end game with final status and score
    endGame: (status: GameStatus, score: number) => void;
    // update current score
    updateScore: (newScore: number) => void;
    // set the current game context so controller knows what to record on win
    setGameContext: (gameId: string, gameProps: string, isPerfect?: boolean) => void;
    // set/replace modifications for the current run
    setModifications: (mods: string[]) => void;
}

const initialState: GameControllerState = {
    status: 'idle',
    score: 0,
};

const GameControllerContext = createContext<GameControllerContextType | undefined>(undefined);

function gameControllerReducer(state: GameControllerState, action: any): GameControllerState {
    switch (action.type) {
        case 'START_GAME':
            return { 
                ...state, 
                status: 'playing', 
                score: 0, 
                startedAt: Date.now(),
                // Clear previous game context to prevent repeated records
                gameId: undefined,
                gameProps: undefined,
                isPerfect: undefined,
                modifications: undefined
            };
        case 'END_GAME':
            return { ...state, status: action.payload.status, score: action.payload.score };
        case 'UPDATE_SCORE':
            return { ...state, score: action.payload };
        case 'SET_GAME_CONTEXT':
            return { ...state, gameId: action.payload.gameId, gameProps: action.payload.gameProps, isPerfect: action.payload.isPerfect };
        case 'SET_MODIFICATIONS':
            return { ...state, modifications: Array.isArray(action.payload) ? action.payload : [] };
        default:
            return state;
    }
}

export const GameControllerProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(gameControllerReducer, initialState);
    const { addGameRecord, unlockAchievementCheck } = useGameActions();
    const lastReportedRef = useRef<string | null>(null);
    const { get } = useSettings();

    const volume = get('volume');

    const startGame = () => {
        dispatch({ type: 'START_GAME' });
        // Do NOT reset lastReportedRef here to prevent duplicate records
    };

    const endGame = (status: GameStatus, score: number) => {
        // console.log('endGame called:', { status, score });
        dispatch({ type: 'END_GAME', payload: { status, score } });
    };

    const updateScore = (newScore: number) => {
        dispatch({ type: 'UPDATE_SCORE', payload: newScore });
    };

    const setGameContext = (gameId: string, gameProps: string, isPerfect?: boolean) => {
        dispatch({ type: 'SET_GAME_CONTEXT', payload: { gameId, gameProps, isPerfect: !!isPerfect } });
    };

    const setModifications = (mods: string[]) => {
        dispatch({ type: 'SET_MODIFICATIONS', payload: mods });
    };

    // When game ends (win or lose), record the result once per session; achievements only on win
    useEffect(() => {
        // console.log('useEffect triggered:', {
        //     startedAt: state.startedAt,
        //     gameId: state.gameId,
        //     gameProps: state.gameProps,
        //     status: state.status,
        //     score: state.score,
        //     lastReported: lastReportedRef.current
        // });

        if (!state.startedAt || !state.gameId || !state.gameProps) return;
        if (state.status !== 'win' && state.status !== 'lose') return;
        
        // Create unique key for this game completion
        const gameCompletionKey = `${state.startedAt}-${state.status}-${state.score}`;
        if (lastReportedRef.current === gameCompletionKey) return;

        // console.log('Processing game end:', { status: state.status, score: state.score });

        if (state.status === 'win') {
            // console.log('Adding game record and checking achievements');
            addGameRecord(state.gameId, state.gameProps, state.score, state.isPerfect, state.modifications);
            unlockAchievementCheck(state.gameId, state.gameProps, state.score, state.isPerfect);
            try {
                const audio = new Audio(winSfx);
                audio.volume = volume.effects;
                audio.play().catch(() => {});
            } catch {}
        } else if (state.status === 'lose') {
            // console.log('Game lost');
            try {
                const audio = new Audio(defeatSfx);
                audio.volume = volume.effects;
                audio.play().catch(() => {});
            } catch {}
        }
        lastReportedRef.current = gameCompletionKey;
    }, [state.status, state.score, state.gameId, state.gameProps, state.startedAt, addGameRecord, unlockAchievementCheck]);

    return (
        <GameControllerContext.Provider
            value={{
                ...state,
                startGame,
                endGame,
                updateScore,
                setGameContext,
                setModifications,
            }}
        >
            {children}
        </GameControllerContext.Provider>
    );
};

export const useGameController = () => {
    const context = useContext(GameControllerContext);
    if (!context) {
        throw new Error('useGameController must be used within a GameControllerProvider');
    }
    return context;
};
