import { useState, useEffect, useRef } from "react";
import { ShulteSettings, ShulteBoard } from "./types/game_shulte";
import { generateRecordProps } from '@/utils/pt';

import { useGameController } from "../../contexts/gameController";
import { useSettings } from "../../contexts/pref";

import Icon from "@/components/icon/icon";

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
    const { status, startGame, endGame, setGameContext, gameId, gameProps } = useGameController();
    const { get } = useSettings();

    const [board, setBoard] = useState<ShulteBoard>([]);
    const [current, setCurrent] = useState(1);
    const [mistakes, setMistakes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<number | null>(null);
    const runInitRef = useRef(false);
    const [boardReady, setBoardReady] = useState(false);

    // Start/reset when controller enters playing
    useEffect(() => {
        if (status === 'playing') {
            if (!runInitRef.current) {
                runInitRef.current = true;
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
            runInitRef.current = false;
            setBoardReady(false);
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setSeconds(0);
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
            <header className="game-header-panel">
                <div className="mistakes_counter" aria-label="mistakes">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Icon key={i} name={i < mistakes ? 'heart-broken' : 'heart'} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <div aria-label="timer" style={{ minWidth: 60, textAlign: 'right' }}>{seconds}s</div>
                </div>
            </header>
            <div className="game-space">
                {status === 'idle' && (
                    <>
                        <h3>Найдите числа по порядку от 1 до {settings.size * settings.size}</h3>
                    </>
                )}
                {status === 'win' && (
                    <div>Congratulations! Time: {seconds}s</div>
                )}
                {status === 'lose' && (
                    <div>Defeat! Mistakes: {mistakes}. Time: {seconds}s</div>
                )}
                {status === 'playing' && (
                    <div
                        className="shulte-board"
                        style={{
                            display: "grid",
                            gap: 8,
                            gridTemplateColumns: `repeat(${settings.size}, minmax(40px, 1fr))`,
                            width: '100%',
                            maxWidth: 620
                        }}
                    >
                        {board.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                    style={{
                                        height: 60,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 8,
                                        border: '1px solid #9aa3ff',
                                        background: cell.isFound ? "#d6f8d6" : "white",
                                        cursor: "pointer",
                                        userSelect: "none"
                                    }}
                                >
                                    {cell.value}
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
