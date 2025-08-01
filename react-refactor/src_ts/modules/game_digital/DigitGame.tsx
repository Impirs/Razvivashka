import React, { useEffect, useState } from 'react';
import { generateBoard, isNextToEmpty, isBoardCleared } from './digitGameLogic';
import type { DigitGameSettings } from './types/game_digital';

import { useGameStore } from '../../contexts/gamestore';

interface DigitGameProps {
    settings: DigitGameSettings;
    onGameEnd: (result: 'win' | 'lose', stats?: any) => void;
    disabled?: boolean;
}

function DigitGame({ settings, onGameEnd, disabled }: DigitGameProps) {
    const { addGameRecord, unlockAchievementCheck } = useGameStore();
    const winSound = React.useRef<HTMLAudioElement | null>(null);
    const loseSound = React.useRef<HTMLAudioElement | null>(null);

    const [board, setBoard] = useState<(number|null)[][]>([]);
    const [selected, setSelected] = useState<{ row: number; col: number; value: number }[]>([]);
    const [mistakes, setMistakes] = useState(0);
    const [phase, setPhase] = useState<'idle' | 'playing' | 'win' | 'lose'>('idle');
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    // Start game when phase changes to 'playing'
    useEffect(() => {
        if (phase === 'playing') {
            setBoard(generateBoard(settings.target, settings.size));
            setSelected([]);
            setMistakes(0);
            setTimer(0);
            if (intervalId) clearInterval(intervalId);
            const id = setInterval(() => setTimer(t => t + 1), 1000);
            setIntervalId(id);
            return () => { if (id) clearInterval(id); };
        }
        // Clean up timer if not playing
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    }, [phase, settings]);

    // After win/lose, stop timer
    useEffect(() => {
        if (phase === 'win' || phase === 'lose') {
            if (intervalId) clearInterval(intervalId);
        }
    }, [phase, intervalId]);

    useEffect(() => {
        if (phase === 'win') {
            addGameRecord('digit', `${settings.size}x${settings.target}`, timer);
            unlockAchievementCheck('digit', `${settings.size}x${settings.target}`, timer);
            if (winSound.current) {
                winSound.current.currentTime = 0;
                winSound.current.play();
            }
            onGameEnd('win', { timer, mistakes });
            // After short delay, go to idle
            setTimeout(() => setPhase('idle'), 2000);
        } else if (phase === 'lose') {
            if (loseSound.current) {
                loseSound.current.currentTime = 0;
                loseSound.current.play();
            }
            onGameEnd('lose', { timer, mistakes });
            setTimeout(() => setPhase('idle'), 2000);
        }
    }, [phase]);

    const handleCellClick = (row: number, col: number) => {
        if (phase !== 'playing') return;
        if (disabled || board[row][col] === null || selected.length >= 2) return;
        if (!isNextToEmpty(board, row, col)) return;
        if (selected.some(sel => sel.row === row && sel.col === col)) {
            setSelected(selected.filter(sel => !(sel.row === row && sel.col === col)));
        } else {
            const newSelected = [...selected, { row, col, value: board[row][col] as number }];
            setSelected(newSelected);
            if (newSelected.length === 2) {
                const sum = newSelected[0].value + newSelected[1].value;
                if (sum === settings.target) {
                    setTimeout(() => {
                        setBoard(prev => {
                            const newBoard = prev.map(rowArr => [...rowArr]);
                            newBoard[newSelected[0].row][newSelected[0].col] = null;
                            newBoard[newSelected[1].row][newSelected[1].col] = null;
                            return newBoard;
                        });
                        setSelected([]);
                    }, 300);
                } else {
                    setMistakes(m => m + 1);
                    setTimeout(() => setSelected([]), 300);
                }
            }
        }
    };

    useEffect(() => {
        if (phase === 'playing' && board.length && isBoardCleared(board)) {
            setPhase('win');
        }
    }, [board, phase]);

    // Show win/lose screens with images and play sounds
    if (phase === 'win') {
        return (
            <div className="digit-game-win">
                <img src={require('../../../shared/assets/fireworks.gif')} alt="Победа!" style={{ width: '60%', margin: '0 auto', display: 'block' }} />
                <audio ref={winSound} src={require('../../../shared/assets/sounds/win.mp3')} autoPlay style={{ display: 'none' }} />
            </div>
        );
    }
    if (phase === 'lose') {
        return (
            <div className="digit-game-lose">
                <img src={require('../../../shared/assets/unlucky.gif')} alt="Поражение!" style={{ width: '60%', margin: '0 auto', display: 'block' }} />
                <audio ref={loseSound} src={require('../../../shared/assets/sounds/defeat.mp3')} autoPlay style={{ display: 'none' }} />
            </div>
        );
    }


    // TODO:
    // Add the translation for the game instructions and add i18n context to support all languages
    if (phase === 'idle') {
        return (
            <div className="digit-game-idle">
                <h3>Составьте {settings.target} из чисел на поле</h3>
                <ul style={{ maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>
                    <li>Выберите две соседние клетки, сумма которых равна целевому числу.</li>
                    <li>Пустая клетка в центре — для перемещений.</li>
                    <li>Игра закончится, когда все числа будут убраны.</li>
                    <li>Ошибки считаются, постарайтесь не ошибаться!</li>
                    <li>Нажмите <b>Старт</b> для начала игры.</li>
                </ul>
                <button onClick={() => setPhase('playing')}>Старт</button>
            </div>
        );
    }

    return (
        <div className="digit-game">
            <div
                className="digit-board"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${settings.size}, 64px)`,
                    gridTemplateRows: `repeat(${settings.size}, 64px)`,
                    gap: '1px',
                }}
            >
                {board.map((rowArr, row) =>
                    rowArr.map((num, col) => {
                        const isEmpty = num === null;
                        const isSelected = selected.some(sel => sel.row === row && sel.col === col);
                        return (
                            <div
                                key={`${row}-${col}`}
                                className={
                                    'cell' +
                                    (isEmpty ? ' empty' : '') +
                                    (isSelected ? ' selected' : '')
                                }
                                onClick={() => handleCellClick(row, col)}
                                style={{
                                    cursor: !isEmpty && !disabled ? 'pointer' : 'default',
                                    userSelect: 'none',
                                }}
                            >
                                {!isEmpty ? num : ''}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DigitGame;
