import React, { useState } from 'react';
import { useLanguage } from '@/contexts/i18n';
import { GameControllerProvider, useGameController } from '@/contexts/gameController';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/button/button';

import DigitMenu from '../modules/game_digital/DigitMenu';
import DigitGame from '../modules/game_digital/DigitGame';
import ShulteGame from '@/modules/game_shulte/ShulteGame';
import ShulteMenu from '@/modules/game_shulte/ShulteMenu';

import ruTranslations from '@/languages/ru.json';
import type { TranslationKey } from '@/types/language';

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

    return (
        <div className="game-central-layout">
            <div className="game-header">
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button aria-label="nav-home" size="small" leftIcon="home" onClick={() => navigate('/')} />
                    <Button aria-label="nav-back-catalog" size="small" leftIcon="circle-left" onClick={() => navigate('/catalog')} />
                </div>
                <h1>{t(`games.${gameId}` as TranslationKey<typeof ruTranslations>)}</h1>
                <div />
            </div>
            <div className="game-content">
                <aside className="game-side left">
                    {renderMenu()}
                </aside>
                <main className="game-main">
                    {renderGame()}
                </main>
                <aside className="game-side right">
                    {/* Right panel reserved for stats, hints, etc. */}
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
