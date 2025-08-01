import React, { useState } from 'react';
import DigitMenu from '../modules/game_digital/DigitMenu';
import DigitGame from '../modules/game_digital/DigitGame';
import type { DigitGameSettings } from '../modules/game_digital/types/game_digital';

const GameDigitalLayout: React.FC = () => {
    const [settings, setSettings] = useState<DigitGameSettings | null>(null);
    const [started, setStarted] = useState(false);
    const [result, setResult] = useState<{ result: 'win' | 'lose'; stats?: any } | null>(null);

    const handleStart = (newSettings: DigitGameSettings) => {
        setSettings(newSettings);
        setStarted(true);
        setResult(null);
    };

    const handleGameEnd = (result: 'win' | 'lose', stats?: any) => {
        setStarted(false);
        setResult({ result, stats });
    };

    return (
        <div className="game-central-layout">
            <div className="game-header">
                <h1>Digital Game</h1>
            </div>
            <div className="game-content">
                <aside className="game-side left">
                    {!started && <DigitMenu onStart={handleStart} />}
                </aside>
                <main className="game-main">
                    {started && settings && (
                        <DigitGame settings={settings} onGameEnd={handleGameEnd} />
                    )}
                    {!started && result && (
                        <div className="game-result">
                            {result.result === 'win' ? 'Победа!' : 'Поражение!'}
                        </div>
                    )}
                </main>
                <aside className="game-side right">
                    {/* ScoreSection or other info will go here */}
                </aside>
            </div>
        </div>
    );
};

export default GameDigitalLayout;
