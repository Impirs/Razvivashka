import React, { useCallback, useReducer, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameControllerProvider, useGameController } from '@/contexts/gameController';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';

import Button from '@/components/button/button';
import ScoreList from '@/components/scorelist/scorelist';

import DigitMenu from '@/modules/game_digit/DigitMenu';
import DigitGame from '@/modules/game_digit/DigitGame';
import ShulteGame from '@/modules/game_shulte/ShulteGame';
import ShulteMenu from '@/modules/game_shulte/ShulteMenu';
import QueensGame from '@/modules/game_queens/QueensGame';
import QueensMenu from '@/modules/game_queens/QueensMenu';
import TangoGame from '@/modules/game_tango/TangoGame';
import TangoMenu from '@/modules/game_tango/TangoMenu';

import type { ShulteSettings } from '@/modules/game_shulte/types/game_shulte';
import type { QueensSettings } from '@/modules/game_queens/types/game_queens';
import type { DigitGameSettings } from '@/modules/game_digit/types/game_digit';
import type { TangoSettings } from '@/modules/game_tango/types/game_tango';
import { generateRecordProps } from '@/utils/pt';

interface GameLayoutProps {
    gameId: string;
}

type GameSettings = {
    digit: { pending: DigitGameSettings; active: DigitGameSettings };
    shulte: { pending: ShulteSettings; active: ShulteSettings };
    queens: { pending: QueensSettings; active: QueensSettings };
    tango: { pending: TangoSettings; active: TangoSettings };
};

type GameSettingsAction = 
    | { type: 'SET_PENDING_DIGIT'; payload: DigitGameSettings }
    | { type: 'SET_ACTIVE_DIGIT'; payload: DigitGameSettings }
    | { type: 'SET_PENDING_SHULTE'; payload: ShulteSettings }
    | { type: 'SET_ACTIVE_SHULTE'; payload: ShulteSettings }
    | { type: 'SET_PENDING_QUEENS'; payload: QueensSettings }
    | { type: 'SET_ACTIVE_QUEENS'; payload: QueensSettings }
    | { type: 'SET_PENDING_TANGO'; payload: TangoSettings }
    | { type: 'SET_ACTIVE_TANGO'; payload: TangoSettings };

// useReducer is used here instead of multiple useState because:
// - Complex state with interdependent values (pending vs active settings)
// - Multiple actions that need to update state atomically
// - Better performance than multiple setState calls

// Начальное состояние
const initialGameSettings: GameSettings = {
    digit: { 
        pending: { target: 6, size: 7 }, 
        active: { target: 6, size: 7 } 
    },
    shulte: { 
        pending: { size: 4 }, 
        active: { size: 4 } 
    },
    queens: { 
        pending: { size: 4 }, 
        active: { size: 4 } 
    },
    tango: {
        pending: { complexity: 1 },
        active: { complexity: 1 }
    }
};

// Reducer for game settings states
// Reducer pattern provides predictable state updates and better debugging
// All game settings changes go through this single reducer function
const gameSettingsReducer = (state: GameSettings, action: GameSettingsAction): GameSettings => {
    switch (action.type) {
        case 'SET_PENDING_DIGIT':
            return {
                ...state,
                digit: { ...state.digit, pending: action.payload }
            };
        case 'SET_ACTIVE_DIGIT':
            return {
                ...state,
                digit: { ...state.digit, active: action.payload }
            };
        case 'SET_PENDING_SHULTE':
            return {
                ...state,
                shulte: { ...state.shulte, pending: action.payload }
            };
        case 'SET_ACTIVE_SHULTE':
            return {
                ...state,
                shulte: { ...state.shulte, active: action.payload }
            };
        case 'SET_PENDING_QUEENS':
            return {
                ...state,
                queens: { ...state.queens, pending: action.payload }
            };
        case 'SET_ACTIVE_QUEENS':
            return {
                ...state,
                queens: { ...state.queens, active: action.payload }
            };
        case 'SET_PENDING_TANGO':
            return {
                ...state,
                tango: { ...state.tango, pending: action.payload }
            };
        case 'SET_ACTIVE_TANGO':
            return {
                ...state,
                tango: { ...state.tango, active: action.payload }
            };
        default:
            return state;
    }
};

// Memoized navigation component
// React.memo prevents re-renders when navigation props haven't changed
// Navigation is stable and doesn't depend on game state, so this optimization is safe
const GameNavigation = React.memo(() => {
    const navigate = useNavigate();
    
    const handleBack = React.useCallback(() => navigate(-1), [navigate]);
    const handleSettings = React.useCallback(() => navigate('/settings'), [navigate]);
    const handleHome = React.useCallback(() => navigate('/'), [navigate]);

    const navigationStyle = React.useMemo(() => ({
        display: "flex",
        flexDirection: "row" as const,
        justifySelf: 'end',
        gap: '8px',
        padding: '0 12px'
    }), []);

    return (
        <div style={navigationStyle}>
            <Button
                aria-label="nav-back"
                size="small"
                leftIcon="left"
                className='nav-button'
                onClick={handleBack}
            />
            <Button
                aria-label="nav-settings"
                size="small"
                leftIcon="settings"
                className='nav-button'
                onClick={handleSettings}
            />
            <Button
                aria-label="nav-home"
                size="small"
                leftIcon="home"
                className='nav-button'
                onClick={handleHome}
            />
        </div>
    );
});

GameNavigation.displayName = 'GameNavigation';

const InnerGameLayout = React.memo<GameLayoutProps>(({ gameId }) => {
    const t = useTranslationFunction();
    const { startGame, setGameContext } = useGameController();
    
    const [gameSettings, dispatch] = useReducer(gameSettingsReducer, initialGameSettings);

    // Memoized handlers for settings changes
    const handleDigitSettingsChange = useCallback((s: DigitGameSettings) => {
        const current = gameSettings.digit.pending;
        if (current.target !== s.target || current.size !== s.size) {
            dispatch({ type: 'SET_PENDING_DIGIT', payload: s });
        }
    }, [gameSettings.digit.pending]);

    const handleShulteSettingsChange = useCallback((s: ShulteSettings) => {
        if (gameSettings.shulte.pending.size !== s.size) {
            dispatch({ type: 'SET_PENDING_SHULTE', payload: s });
        }
    }, [gameSettings.shulte.pending.size]);

    const handleQueensSettingsChange = useCallback((s: QueensSettings) => {
        if (gameSettings.queens.pending.size !== s.size) {
            dispatch({ type: 'SET_PENDING_QUEENS', payload: s });
        }
    }, [gameSettings.queens.pending.size]);

    const handleTangoSettingsChange = useCallback((s: TangoSettings) => {
        if (gameSettings.tango.pending.complexity !== s.complexity) {
            dispatch({ type: 'SET_PENDING_TANGO', payload: s });
        }
    }, [gameSettings.tango.pending.complexity]);

    // Memoized handlers for game start
    const handleStartDigit = useCallback((settings: DigitGameSettings) => {
        dispatch({ type: 'SET_ACTIVE_DIGIT', payload: settings });
        setGameContext('digit', generateRecordProps('digit', settings), false);
        startGame();
    }, [setGameContext, startGame]);

    const handleStartShulte = useCallback((settings: ShulteSettings) => {
        dispatch({ type: 'SET_ACTIVE_SHULTE', payload: settings });
        setGameContext('shulte', generateRecordProps('shulte', settings), false);
        startGame();
    }, [setGameContext, startGame]);

    const handleStartQueens = useCallback((settings: QueensSettings) => {
        dispatch({ type: 'SET_ACTIVE_QUEENS', payload: settings });
        setGameContext('queens', generateRecordProps('queens', settings), false);
        startGame();
    }, [setGameContext, startGame]);

    const handleStartTango = useCallback((settings: TangoSettings) => {
        dispatch({ type: 'SET_ACTIVE_TANGO', payload: settings });
        setGameContext('tango', generateRecordProps('tango', settings), false);
        startGame();
    }, [setGameContext, startGame]);

    const gameMenu = useMemo(() => {
        switch (gameId) {
            case 'digit':
                return (
                    <DigitMenu
                        onStart={handleStartDigit}
                        initialSettings={gameSettings.digit.pending}
                        onChangeSettings={handleDigitSettingsChange}
                    />
                );
            case 'shulte':
                return (
                    <ShulteMenu
                        onStart={handleStartShulte}
                        onChangeSettings={handleShulteSettingsChange}
                    />
                );
            case 'queens':
                return (
                    <QueensMenu
                        onStart={handleStartQueens}
                        initialSettings={gameSettings.queens.pending}
                        onChangeSettings={handleQueensSettingsChange}
                    />
                );
            case 'tango':
                return (
                    <TangoMenu
                        onStart={handleStartTango}
                        initialSettings={gameSettings.tango.pending}
                        onChangeSettings={handleTangoSettingsChange}
                    />
                );
            default:
                return null;
        }
    }, [gameId, gameSettings.digit.pending, gameSettings.queens.pending, gameSettings.tango.pending, handleStartDigit, handleStartShulte, handleStartQueens, handleStartTango, handleDigitSettingsChange, handleShulteSettingsChange, handleQueensSettingsChange, handleTangoSettingsChange]);

    const gameComponent = useMemo(() => {
        switch (gameId) {
            case 'digit':
                return <DigitGame settings={gameSettings.digit.active} />;
            case 'shulte':
                return <ShulteGame settings={gameSettings.shulte.active} />;
            case 'queens':
                return <QueensGame settings={gameSettings.queens.active} />;
            case 'tango':
                return <TangoGame settings={gameSettings.tango.active} />;
            default:
                return null;
        }
    }, [gameId, gameSettings.digit.active, gameSettings.shulte.active, gameSettings.queens.active, gameSettings.tango.active]);

    const scoreSection = useMemo(() => {
        switch (gameId) {
            case 'digit':
                return (
                    <ScoreList 
                        gameId={gameId} 
                        gameProps={generateRecordProps('digit', gameSettings.digit.pending)} 
                    />
                );
            case 'shulte':
                return (
                    <ScoreList 
                        gameId={gameId} 
                        gameProps={generateRecordProps('shulte', gameSettings.shulte.pending)} 
                    />
                );
            case 'queens':
                return (
                    <ScoreList 
                        gameId={gameId} 
                        gameProps={generateRecordProps('queens', gameSettings.queens.pending)} 
                    />
                );
            case 'tango':
                return (
                    <ScoreList 
                        gameId={gameId} 
                        gameProps={generateRecordProps('tango', gameSettings.tango.pending)} 
                    />
                );
            default:
                return null;
        }
    }, [gameId, gameSettings.digit.pending, gameSettings.shulte.pending, gameSettings.queens.pending, gameSettings.tango.pending]);

    const gameTitle = useMemo(() => 
        t(`games.${gameId}` as any), [t, gameId]
    );

    const headerTitleStyle = useMemo(() => ({ 
        justifySelf: 'center' as const 
    }), []);

    const scoreContainerStyle = useMemo(() => ({ 
        margin: '0 0 0.5rem 0' 
    }), []);

    return (
        <div className="game-layout">
            <aside className="game-side left">
                {gameMenu}
            </aside>
            <div className="game-main">
                <div className="game-header">
                    <div/>
                    <h1 style={headerTitleStyle}>
                        {gameTitle}
                    </h1>
                    <GameNavigation />
                </div>
                <main className="game-main-panel">
                    {gameComponent}
                </main>
            </div>
            <aside className="game-side">
                <div className='score_section'>
                    <h2 style={scoreContainerStyle}>
                        {t("game-menu.records" as any)}
                    </h2>
                    <div className='scorelist-container'>
                        {scoreSection}
                    </div>
                </div>
            </aside>
        </div>
    );
});

InnerGameLayout.displayName = 'InnerGameLayout';

const GameDigitalLayout = React.memo<GameLayoutProps>(({ gameId }) => {
    return (
        <GameControllerProvider>
            <InnerGameLayout gameId={gameId} />
        </GameControllerProvider>
    );
});

GameDigitalLayout.displayName = 'GameDigitalLayout';

export default GameDigitalLayout;
