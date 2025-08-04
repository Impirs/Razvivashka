import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define game states
export type GameStatus = 'idle' | 'playing' | 'win' | 'lose';

interface GameControllerState {
    status: GameStatus;
    score: number;
}

interface GameControllerContextType extends GameControllerState {
    startGame: () => void;
    endGame: (status: GameStatus, score: number) => void;
    updateScore: (newScore: number) => void;
}

const initialState: GameControllerState = {
    status: 'idle',
    score: 0,
};

const GameControllerContext = createContext<GameControllerContextType | undefined>(undefined);

function gameControllerReducer(state: GameControllerState, action: any): GameControllerState {
    switch (action.type) {
        case 'START_GAME':
            return { ...state, status: 'playing', score: 0 };
        case 'END_GAME':
            return { ...state, status: action.payload.status, score: action.payload.score };
        case 'UPDATE_SCORE':
            return { ...state, score: action.payload };
        default:
            return state;
    }
}

export const GameControllerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameControllerReducer, initialState);

    const startGame = () => {
        dispatch({ type: 'START_GAME' });
    };

    const endGame = (status: GameStatus, score: number) => {
        dispatch({ type: 'END_GAME', payload: { status, score } });
    };

    const updateScore = (newScore: number) => {
        dispatch({ type: 'UPDATE_SCORE', payload: newScore });
    };

    return (
        <GameControllerContext.Provider
            value={{
                ...state,
                startGame,
                endGame,
                updateScore,
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
