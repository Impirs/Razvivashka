import React, { useEffect, useState } from 'react';
import { generateBoard, isBoardCleared } from './digitGameLogic';
import type { DigitGameSettings } from './types/game_digital';

import { useGameController } from '../../contexts/gameController';

interface DigitGameProps {
    settings: DigitGameSettings;
}

function DigitGame({ settings }: DigitGameProps) {
    const { status, score, startGame, endGame, updateScore } = useGameController();

    const [board, setBoard] = useState<(number | null)[][]>([]);
    const [selected, setSelected] = useState<{ row: number; col: number; value: number }[]>([]);
    const [mistakes, setMistakes] = useState(0);

    useEffect(() => {
        if (status === 'playing') {
            setBoard(generateBoard(settings.target, settings.size));
            setSelected([]);
            setMistakes(0);
            updateScore(0);
        }
    }, [status, settings, updateScore]);

    const handleCellClick = (row: number, col: number) => {
        if (status !== 'playing' || board[row][col] === null || selected.length >= 2) return;

        const newSelected = [...selected, { row, col, value: board[row][col] as number }];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            const sum = newSelected[0].value + newSelected[1].value;
            if (sum === settings.target) {
                setBoard(prev => {
                    const newBoard = prev.map(rowArr => [...rowArr]);
                    newBoard[newSelected[0].row][newSelected[0].col] = null;
                    newBoard[newSelected[1].row][newSelected[1].col] = null;
                    return newBoard;
                });
                setSelected([]);
                updateScore(score + 1);
            } else {
                setMistakes(prev => prev + 1);
                setSelected([]);
            }
        }
    };

    useEffect(() => {
        if (status === 'playing' && isBoardCleared(board)) {
            endGame('win', score);
        }
    }, [board, status, score, endGame]);

    useEffect(() => {
        if (mistakes >= 3) {
            endGame('lose', score);
        }
    }, [mistakes, score, endGame]);

    return (
        <section className="game-main-panel">
            <header className="game-header-panel">
                <div className="mistakes_counter" aria-label="mistakes">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`mistake${i < mistakes ? ' cross' : ''}`} />
                    ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: 18 }}>Цель: {settings.target}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="game-restart-btn" onClick={startGame}>Старт</button>
                </div>
            </header>
            <div className="game-space">
                {status === 'idle' && (
                    <>
                        <h3>Составьте {settings.target} из чисел на поле</h3>
                        <button className="game-restart-btn" onClick={startGame}>Старт</button>
                    </>
                )}
                {status === 'win' && (
                    <div className="digit-game-win">Победа! Ваш счет: {score}</div>
                )}
                {status === 'lose' && (
                    <div className="digit-game-lose">Поражение! Ошибки: {mistakes}</div>
                )}
                {status === 'playing' && (
                    <div className="digit-board" style={{
                        display: 'grid',
                        gap: 8,
                        gridTemplateColumns: `repeat(${settings.size}, minmax(40px, 1fr))`,
                        width: '100%',
                        maxWidth: 620
                    }}>
                        {board.map((rowArr, row) =>
                            rowArr.map((num, col) => (
                                <div
                                    key={`${row}-${col}`}
                                    className="cell"
                                    style={{
                                        height: 60,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 8,
                                        border: '1px solid #9aa3ff',
                                        background: num === null ? '#f4f6ff' : 'white',
                                        cursor: num === null ? 'default' : 'pointer',
                                        userSelect: 'none'
                                    }}
                                    onClick={() => handleCellClick(row, col)}
                                >
                                    {num}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default DigitGame;
