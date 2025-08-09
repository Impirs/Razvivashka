import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useGameStore } from './gamestore';

// Define game states
export type GameStatus = 'idle' | 'playing' | 'win' | 'lose';

interface GameControllerState {
    status: GameStatus;
    score: number;
    gameId?: string;
    gameProps?: string; // serialized settings/props to identify the game variant (e.g., JSON.stringify)
    startedAt?: number; // timestamp to identify a run session
}

interface GameControllerContextType extends GameControllerState {
    // start game, resets score and sets status to 'playing'
    startGame: () => void;
    // end game with final status and score
    endGame: (status: GameStatus, score: number) => void;
    // update current score
    updateScore: (newScore: number) => void;
    // set the current game context so controller knows what to record on win
    setGameContext: (gameId: string, gameProps: string) => void;
}

const initialState: GameControllerState = {
    status: 'idle',
    score: 0,
};

const GameControllerContext = createContext<GameControllerContextType | undefined>(undefined);

function gameControllerReducer(state: GameControllerState, action: any): GameControllerState {
    switch (action.type) {
        case 'START_GAME':
            return { ...state, status: 'playing', score: 0, startedAt: Date.now() };
        case 'END_GAME':
            return { ...state, status: action.payload.status, score: action.payload.score };
        case 'UPDATE_SCORE':
            return { ...state, score: action.payload };
        case 'SET_GAME_CONTEXT':
            return { ...state, gameId: action.payload.gameId, gameProps: action.payload.gameProps };
        default:
            return state;
    }
}

export const GameControllerProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(gameControllerReducer, initialState);
    const { addGameRecord, unlockAchievementCheck } = useGameStore();
    const lastReportedRef = useRef<number | null>(null);

    const startGame = () => {
        dispatch({ type: 'START_GAME' });
        // reset last reported marker so win can be handled once per session
        lastReportedRef.current = null;
    };

    const endGame = (status: GameStatus, score: number) => {
        dispatch({ type: 'END_GAME', payload: { status, score } });
    };

    const updateScore = (newScore: number) => {
        dispatch({ type: 'UPDATE_SCORE', payload: newScore });
    };

    const setGameContext = (gameId: string, gameProps: string) => {
        dispatch({ type: 'SET_GAME_CONTEXT', payload: { gameId, gameProps } });
    };

    // When game ends with 'win', record the result and check achievements once per session
    useEffect(() => {
        if (
            state.status === 'win' &&
            state.gameId &&
            state.gameProps &&
            state.startedAt &&
            lastReportedRef.current !== state.startedAt
        ) {
            addGameRecord(state.gameId, state.gameProps, state.score);
            unlockAchievementCheck(state.gameId, state.gameProps, state.score);
            lastReportedRef.current = state.startedAt;
        }
    }, [state.status, state.score, state.gameId, state.gameProps, state.startedAt, addGameRecord, unlockAchievementCheck]);

    return (
        <GameControllerContext.Provider
            value={{
                ...state,
                startGame,
                endGame,
                updateScore,
                setGameContext,
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
