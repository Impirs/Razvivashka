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

import type { ShulteSettings } from '@/modules/game_shulte/types/game_shulte';
import type { DigitGameSettings } from '@/modules/game_digital/types/game_digit';
import { generateRecordProps } from '@/utils/pt';

interface GameLayoutProps {
    gameId: string;
}

function InnerGameLayout({ gameId }: GameLayoutProps) {
    const { t } = useLanguage();
    const { startGame, setGameContext } = useGameController();
    const navigate = useNavigate();
    // store chosen settings per game
    // Always have defaults so game-main renders immediately
    const [digitSettings, setDigitSettings] = useState<DigitGameSettings>({ target: 6, size: 7 });
    const [shulteSettings, setShulteSettings] = useState<ShulteSettings>({ size: 4 });

    // Stable callbacks so child effects don't loop on function identity changes
    const handleDigitSettingsChange = useCallback((s: DigitGameSettings) => {
        setDigitSettings(prev => (prev.target === s.target && prev.size === s.size ? prev : s));
    }, []);
    const handleShulteSettingsChange = useCallback((s: ShulteSettings) => {
        setShulteSettings(prev => (prev.size === s.size ? prev : s));
    }, []);

    const handleStartDigit = (settings: DigitGameSettings) => {
        setDigitSettings(settings);
        // console.log('Digit settings:', JSON.stringify(settings));
    // At start, we don't know isPerfect yet; default false. Game may update via controller later.
    setGameContext('digit', generateRecordProps('digit', settings), false);
        startGame();
    };

    const handleStartShulte = (settings: ShulteSettings) => {
        setShulteSettings(settings);
        // console.log('Shulte settings:', JSON.stringify(settings));
    setGameContext('shulte', generateRecordProps('shulte', settings), false);
        startGame();
    };

    const renderMenu = () => {
        switch (gameId) {
            case 'digit':
                return (
                    <DigitMenu
                        onStart={handleStartDigit}
                        initialSettings={digitSettings ?? undefined}
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
            default:
                return null;
        }
    };

    const renderGame = () => {
        switch (gameId) {
            case 'digit':
                return <DigitGame settings={digitSettings} />;
            case 'shulte':
                return <ShulteGame settings={shulteSettings} />;
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
                            gameProps={generateRecordProps('digit', digitSettings)} 
                        />;
            case 'shulte':
                return <ScoreList 
                            gameId={gameId} 
                            gameProps={generateRecordProps('shulte', shulteSettings)} 
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
