import React, { useEffect, useState } from 'react';
import { generateBoard, isNextToEmpty, isBoardCleared } from './digitGameLogic';
import type { DigitGameSettings } from './types/game_digital';

import { useGameController } from '../../contexts/gameController';

interface DigitGameProps {
    settings: DigitGameSettings;
    onGameEnd: (result: 'win' | 'lose', stats?: any) => void;
    disabled?: boolean;
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

    if (status === 'idle') {
        return (
            <div className="digit-game-idle">
                <h3>Составьте {settings.target} из чисел на поле</h3>
                <button onClick={startGame}>Старт</button>
            </div>
        );
    }

    if (status === 'win') {
        return <div className="digit-game-win">Победа! Ваш счет: {score}</div>;
    }

    if (status === 'lose') {
        return <div className="digit-game-lose">Поражение! Ошибки: {mistakes}</div>;
    }

    return (
        <div className="digit-game">
            <h3>Составьте {settings.target} из чисел на поле</h3>
            <div className="digit-board">
                {board.map((rowArr, row) =>
                    rowArr.map((num, col) => (
                        <div
                            key={`${row}-${col}`}
                            className="cell"
                            onClick={() => handleCellClick(row, col)}
                        >
                            {num}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DigitGame;
