import React, { useState } from 'react';
import { useLanguage } from '@/contexts/i18n';
import { GameControllerProvider, useGameController } from '@/contexts/gameController';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/button/button';
import ScoreList from '@/components/scorelist/scorelist';

import DigitMenu from '../modules/game_digital/DigitMenu';
import DigitGame from '../modules/game_digital/DigitGame';
import ShulteGame from '@/modules/game_shulte/ShulteGame';
import ShulteMenu from '@/modules/game_shulte/ShulteMenu';

import type { ShulteSettings } from '@/modules/game_shulte/types/game_shulte';
import type { DigitGameSettings } from '../modules/game_digital/types/game_digital';

interface GameLayoutProps {
    gameId: string;
}

function InnerGameLayout({ gameId }: GameLayoutProps) {
    const { t } = useLanguage();
    const { startGame, setGameContext } = useGameController();
    const navigate = useNavigate();
    // store chosen settings per game
    const [digitSettings, setDigitSettings] = useState<DigitGameSettings | null>(null);
    const [shulteSettings, setShulteSettings] = useState<ShulteSettings | null>(null);

    const handleStartDigit = (settings: DigitGameSettings) => {
        setDigitSettings(settings);
        setGameContext('digit', JSON.stringify(settings));
        startGame();
    };

    const handleStartShulte = (settings: ShulteSettings) => {
        setShulteSettings(settings);
        setGameContext('shulte', JSON.stringify(settings));
        startGame();
    };

    const renderMenu = () => {
        switch (gameId) {
            case 'digit':
                return <DigitMenu onStart={handleStartDigit} initialSettings={digitSettings ?? undefined} />;
            case 'shulte':
                return <ShulteMenu onStart={handleStartShulte} />;
            default:
                return null;
        }
    };

    const renderGame = () => {
        switch (gameId) {
            case 'digit':
                return digitSettings ? <DigitGame settings={digitSettings} /> : null;
            case 'shulte':
                return shulteSettings ? <ShulteGame settings={shulteSettings} /> : null;
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
                            gameProps={`${digitSettings?.size}x${digitSettings?.target}`} 
                        />;
            case 'shulte':
                return <ScoreList 
                            gameId={gameId} 
                            gameProps={`${shulteSettings?.size}x${shulteSettings?.size}`} 
                        />;
            default:
                return null;
        }
    };

    return (
        <div className="game-layout">
            <div className="game-header">
                <Button aria-label="nav-back" 
                        size="small" 
                        leftIcon="left" 
                        className='nav-button' 
                        onClick={() => navigate(-1)} 
                />
                <h1>{t(`games.${gameId}` as any)}</h1>
                <Button aria-label="nav-settings" 
                        size="small" 
                        leftIcon="settings" 
                        className='nav-button' 
                        onClick={() => navigate('/settings')} 
                />
            </div>
            <div className="game-content">
                <aside className="game-side left">
                    {renderMenu()}
                </aside>
                <main className="game-main">
                    {renderGame()}
                </main>
                <aside className="game-side score_section">
                    <h2>{t("game-menu.records" as any)}</h2>
                    {renderScoreSection()}
                </aside>
            </div>
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
