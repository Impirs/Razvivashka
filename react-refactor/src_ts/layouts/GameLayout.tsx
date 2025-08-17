import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/i18n';
import { GameControllerProvider, useGameController } from '@/contexts/gameController';

import Button from '@/components/button/button';
import ScoreList from '@/components/scorelist/scorelist';

import DigitMenu from '@/modules/game_digital/DigitMenu';
import DigitGame from '@/modules/game_digital/DigitGame';
import ShulteGame from '@/modules/game_shulte/ShulteGame';
import ShulteMenu from '@/modules/game_shulte/ShulteMenu';
import QueensGame from '@/modules/game_queens/QueensGame';
import QueensMenu from '@/modules/game_queens/QueensMenu';

import type { ShulteSettings } from '@/modules/game_shulte/types/game_shulte';
import type { QueensSettings } from '@/modules/game_queens/types/game_queens';
import type { DigitGameSettings } from '@/modules/game_digital/types/game_digit';
import { generateRecordProps } from '@/utils/pt';

interface GameLayoutProps {
    gameId: string;
}

function InnerGameLayout({ gameId }: GameLayoutProps) {
    const { t } = useLanguage();
    const { startGame, setGameContext } = useGameController();
    const navigate = useNavigate();
    // Pending settings (from menu) and Active settings (used by running game)
    // Always have defaults so game-main renders immediately
    const [pendingDigit, setPendingDigit] = useState<DigitGameSettings>({ target: 6, size: 7 });
    const [activeDigit, setActiveDigit] = useState<DigitGameSettings>({ target: 6, size: 7 });
    const [pendingShulte, setPendingShulte] = useState<ShulteSettings>({ size: 4 });
    const [activeShulte, setActiveShulte] = useState<ShulteSettings>({ size: 4 });
    const [pendingQueens, setPendingQueens] = useState<QueensSettings>({ size: 4 });
    const [activeQueens, setActiveQueens] = useState<QueensSettings>({ size: 4 });

    // Stable callbacks so child effects don't loop on function identity changes
    const handleDigitSettingsChange = useCallback((s: DigitGameSettings) => {
        setPendingDigit(prev => (prev.target === s.target && prev.size === s.size ? prev : s));
    }, []);
    const handleShulteSettingsChange = useCallback((s: ShulteSettings) => {
        setPendingShulte(prev => (prev.size === s.size ? prev : s));
    }, []);
    const handleQueensSettingsChange = useCallback((s: QueensSettings) => {
        setPendingQueens(prev => (prev.size === s.size ? prev : s));
    }, []);

    const handleStartDigit = (settings: DigitGameSettings) => {
        // Promote pending settings to active and start the game
        setActiveDigit(settings);
        // console.log('Digit settings:', JSON.stringify(settings));
        // At start, we don't know isPerfect yet; default false. Game may update via controller later.
        setGameContext('digit', generateRecordProps('digit', settings), false);
        startGame();
    };

    const handleStartShulte = (settings: ShulteSettings) => {
        // Promote pending settings to active and start the game
        setActiveShulte(settings);
        // console.log('Shulte settings:', JSON.stringify(settings));
        setGameContext('shulte', generateRecordProps('shulte', settings), false);
        startGame();
    };
    const handleStartQueens = (settings: QueensSettings) => {
        setActiveQueens(settings);
        setGameContext('queens', generateRecordProps('queens', settings), false);
        startGame();
    };

    const renderMenu = () => {
        switch (gameId) {
            case 'digit':
                return (
                    <DigitMenu
                        onStart={handleStartDigit}
                        initialSettings={pendingDigit ?? undefined}
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
                        initialSettings={pendingQueens ?? undefined}
                        onChangeSettings={handleQueensSettingsChange}
                    />
                );
            default:
                return null;
        }
    };

    const renderGame = () => {
        switch (gameId) {
            case 'digit':
                return <DigitGame settings={activeDigit} />;
            case 'shulte':
                return <ShulteGame settings={activeShulte} />;
            case 'queens':
                return <QueensGame settings={activeQueens} />;
            default:
                return null;
        }
    };

    const renderScoreSection = () => {
        // Render the score list via switch statement is relevant because each game has different props
        // so it easier to manage it with cases rather than passing props directly through if statements
        switch (gameId) {
            case 'digit':
                return <ScoreList 
                            gameId={gameId} 
                            gameProps={generateRecordProps('digit', pendingDigit)} 
                        />;
            case 'shulte':
                return <ScoreList 
                            gameId={gameId} 
                            gameProps={generateRecordProps('shulte', pendingShulte)} 
                        />;
            case 'queens':
                return <ScoreList 
                            gameId={gameId} 
                            gameProps={generateRecordProps('queens', pendingQueens)} 
                        />;
            default:
                return null;
        }
    };

    return (
        <div className="game-layout">
            <aside className="game-side left">
                {renderMenu()}
            </aside>
            <div className="game-main">
                <div className="game-header">
                    <div/>
                    <h1 style={{justifySelf:'center'}}>
                        { t(`games.${gameId}` as any) }
                    </h1>
                    <div style={{ display: "flex", 
                                flexDirection: "row", 
                                justifySelf: 'end', 
                                gap: '8px', 
                                padding: '0 12px' 
                                }}
                    >
                        <Button
                            aria-label="nav-back"
                            size="small"
                            leftIcon="left"
                            className='nav-button'
                            onClick={() => navigate(-1)}
                        />
                        <Button
                            aria-label="nav-settings"
                            size="small"
                            leftIcon="settings"
                            className='nav-button'
                            onClick={() => navigate('/settings')}
                        />
                        <Button
                            aria-label="nav-home"
                            size="small"
                            leftIcon="home"
                            className='nav-button'
                            onClick={() => navigate('/')}
                        />
                    </div>
                </div>
                <main className="game-main-panel">
                    {renderGame()}
                </main>
            </div>
            <aside className="game-side score_section">
                <h2>{t("game-menu.records" as any)}</h2>
                <div className='scorelist-container'>
                    {renderScoreSection()}
                </div>
            </aside>
        </div>
    );
}

function GameDigitalLayout({ gameId }: GameLayoutProps) {
    return (
        <GameControllerProvider>
            <InnerGameLayout gameId={gameId} />
        </GameControllerProvider>
    );
}

export default GameDigitalLayout;
