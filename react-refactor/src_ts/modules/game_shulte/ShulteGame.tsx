import { useState, useEffect, useRef } from "react";
import { ShulteSettings, ShulteBoard } from "./types/game_shulte";
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from "@/utils/ft";

import { useGameController } from "../../contexts/gameController";
import { useSettings } from "../../contexts/pref";
import { useLanguage } from "@/contexts/i18n";

import Icon from "@/components/icon/icon";

import fireworksGif from "@/assets/animations/fireworks.gif";
import unluckyGif from "@/assets/animations/unlucky.gif";

function generateShulteBoard(size: number): ShulteBoard {
    const arr = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return Array.from({ length: size }, (_, row) =>
        arr.slice(row * size, (row + 1) * size).map(value => ({ value, isFound: false }))
    );
}

function ShulteGame({ settings }: { settings: ShulteSettings }) {
    const { status, startGame, endGame, setGameContext, gameId, gameProps, startedAt } = useGameController();
    const { useSetting } = useSettings();
    const { t } = useLanguage();
    const [gamesSettings] = useSetting('games');
    const hideFoundNumber = gamesSettings?.shulte?.view_modification ?? false;

    const [board, setBoard] = useState<ShulteBoard>([]);
    const [current, setCurrent] = useState(1);
    const [mistakes, setMistakes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<number | null>(null);
    const lastStartRef = useRef<number | null>(null);
    const [boardReady, setBoardReady] = useState(false);

    // Start/reset when controller enters playing; re-init on every Start via startedAt
    useEffect(() => {
        if (status === 'playing' && startedAt) {
            if (lastStartRef.current !== startedAt) {
                lastStartRef.current = startedAt;
                setBoard([]);
                setBoardReady(false);
                setBoard(generateShulteBoard(settings.size));
                setCurrent(1);
                setMistakes(0);
                setSeconds(0);
                // Assume perfect at the start of a run
                setGameContext('shulte', generateRecordProps('shulte', settings), true);
                if (timerRef.current) window.clearInterval(timerRef.current);
                timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
            }
        } else {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (status === 'idle') {
                lastStartRef.current = null;
                setBoardReady(false);
                setSeconds(0);
            }
        }
        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [status, settings.size]);

    useEffect(() => {
        if (status === 'playing' && board.length > 0) setBoardReady(true);
    }, [board, status]);

    const handleCellClick = (row: number, col: number) => {
    if (status !== 'playing') return;

        const cell = board[row][col];
        if (cell.value === current) {
            setBoard(prev => {
                const newBoard = prev.map(r => r.map(c => ({ ...c })));
                newBoard[row][col].isFound = true;
                return newBoard;
            });
            setCurrent(c => c + 1);

            if (current === settings.size * settings.size) {
                if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                endGame('win', seconds);
            }
        } else {
            // On first mistake, mark run as not perfect
            if (mistakes === 0 && gameId === 'shulte' && gameProps) {
                setGameContext('shulte', generateRecordProps('shulte', settings), false);
            }
            setMistakes(m => m + 1);
        }
    };

    // lose on 3 mistakes
    useEffect(() => {
        if (status === 'playing' && mistakes >= 3) {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            endGame('lose', seconds);
        }
    }, [mistakes, status, seconds]);

    return (
        <section className="game-main-panel">
            <header className="game-utils-panel">
                <div className="mistakes-counter" aria-label="mistakes">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Icon key={i} 
                            name={i < mistakes ? 'heart-broken' : 'heart'} 
                            color={ i < mistakes ? '#eb92be' : '#232323' }
                            size={32}
                        />
                    ))}
                </div>
                <div/>
                <div className="game-timer">
                    <div aria-label="timer">{formatTime(seconds)}</div>
                </div>
            </header>
            <div className="game-space">
                {status === 'idle' && (
                    <div style={{ textAlign: 'center', width: '60%' }}>
                        <h3>{t('game-info.shulte.instruction')}</h3>
                        <h3>{t('game-info.time_rules')}</h3>
                        <h3>{t('game-info.mistakes_rules')}</h3>
                    </div>
                )}
                {status === 'win' && (
                    <div style={{ textAlign: 'center', width: '60%' }}>
                        <img src={fireworksGif} 
                            alt="fireworks-animation" />
                        <h3>{t('game-info.win')}</h3>
                        <h3>{t('game-info.your_time')} {formatTime(seconds)}</h3>
                    </div>
                )}
                {status === 'lose' && (
                    <div style={{ textAlign: 'center', width: '60%' }}>
                        <img src={unluckyGif} 
                            alt="unlucky-animation" />
                        <h3>{t('game-info.lose')}</h3>
                        <h3>{t('game-info.your_mistakes')} {mistakes}</h3>
                        <h3>{t('game-info.your_time')} {formatTime(seconds)}</h3>
                    </div>
                )}
        {status === 'playing' && (
                    <div
            key={`${settings.size}-${startedAt ?? 'na'}`}
            className="shulte-board"
                        style={{
                            display: "grid",
                            gap: 10,
                            gridTemplateColumns: `repeat(${settings.size}, minmax(40px, 1fr))`,
                            // width: '100%',
                            maxWidth: 620
                        }}
                    >
                        {board.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                    style={{
                                        fontSize: '22px',
                                        height: `calc(480px / ${settings.size})`,
                                        width: `calc(480px / ${settings.size})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 8,
                                        border: '1px solid #9aa3ff',
                                        background: hideFoundNumber ? 'white' : (cell.isFound ? "#d6f8d6" : "white"),
                                        cursor: "pointer",
                                        userSelect: "none"
                                    }}
                                >
                                    <span style={{ visibility: (hideFoundNumber && cell.isFound) ? 'hidden' : 'visible' }}>
                                        {cell.value}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ShulteGame;
