import { useEffect, useRef, useState } from 'react';
import { generateBoard, isBoardCleared, isNextToEmpty } from './digitGameLogic';
import type { DigitGameSettings } from './types/game_digit';
import { generateRecordProps } from '@/utils/pt';

import { useSettings } from '@/contexts/pref';
import { useGameController } from '../../contexts/gameController';
import Icon from '@/components/icon/icon';

interface DigitGameProps {
    settings: DigitGameSettings;
}

function DigitGame({ settings }: DigitGameProps) {
    const { status, score, startGame, endGame, updateScore, setGameContext, gameId, gameProps } = useGameController();

    const [board, setBoard] = useState<(number | null)[][]>([]);
    const [selected, setSelected] = useState<{ row: number; col: number; value: number }[]>([]);
    const [mistakes, setMistakes] = useState(0);

    // timer state
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<number | null>(null);
    // track if current run has been initialized to avoid re-initializing on re-renders
    const runInitRef = useRef(false);
    // board readiness guard to avoid checking cleared-state before board is generated
    const [boardReady, setBoardReady] = useState(false);

    // setup board and start timer when playing begins
    useEffect(() => {
        if (status === 'playing') {
            if (!runInitRef.current) {
                runInitRef.current = true;
                setBoard([]); // reset immediately to prevent stale checks
                setBoardReady(false);
                setBoard(generateBoard(settings.target, settings.size));
                setSelected([]);
                setMistakes(0);
                updateScore(0);
                setSeconds(0);
                // Assume perfect at the start of a run
                setGameContext('digit', generateRecordProps('digit', settings), true);
                if (timerRef.current) window.clearInterval(timerRef.current);
                timerRef.current = window.setInterval(() => setSeconds(prev => prev + 1), 1000);
            }
        } else {
            // leaving playing or returning to idle -> cleanup
            runInitRef.current = false;
            setBoardReady(false);
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setSeconds(0);
        }
        return () => {
            // on unmount
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [status, settings.size, settings.target]);

    // mark board as ready once generated for a playing run
    useEffect(() => {
        if (status === 'playing' && board.length > 0) {
            setBoardReady(true);
        }
    }, [board, status]);

    const handleCellClick = (row: number, col: number) => {
        if (status !== 'playing') return;
        const cellVal = board[row]?.[col] ?? null;
        if (cellVal === null) return;
        // Only allow selecting cells adjacent to an empty cell
        if (!isNextToEmpty(board, row, col)) return;
        // If this cell is already selected, deselect it
        const isAlreadySelected = selected.some(s => s.row === row && s.col === col);
        if (isAlreadySelected) {
            setSelected(prev => prev.filter(s => !(s.row === row && s.col === col)));
            return;
        }
        if (selected.length >= 2) return;

        const newSelected = [...selected, { row, col, value: cellVal as number }];
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
            } else {
                // On first mistake, mark run as not perfect
                if (mistakes === 0 && gameId === 'digit' && gameProps) {
                    setGameContext('digit', generateRecordProps('digit', settings), false);
                }
                setMistakes(prev => prev + 1);
                setSelected([]);
            }
        }
    };

    useEffect(() => {
        if (status === 'playing' && boardReady && isBoardCleared(board)) {
            // stop timer and submit time as score (in seconds)
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            endGame('win', seconds);
        }
    }, [board, status, seconds, boardReady]);

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
                <div style={{ textAlign: 'center', fontSize: 18 }}>Цель: {settings.target}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <div aria-label="timer" style={{ minWidth: 60, textAlign: 'right' }}>{seconds}s</div>
                </div>
            </header>
            <div className="game-space">
                {status === 'idle' && (
                    <>
                        <h3>Составьте {settings.target} из чисел на поле</h3>
                    </>
                )}
                {status === 'win' && (
                    <div className="digit-game-win">Победа! Время: {seconds}s</div>
                )}
                {status === 'lose' && (
                    <div className="digit-game-lose">Поражение! Ошибки: {mistakes}. Время: {seconds}s</div>
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
                            rowArr.map((num, col) => {
                                const selectable = num !== null && isNextToEmpty(board, row, col);
                                const isSelected = selected.some(s => s.row === row && s.col === col);
                                const background = num === null
                                    ? '#f4f6ff'
                                    : isSelected
                                        ? '#e8f2ff'
                                        : selectable
                                            ? 'white'
                                            : '#eef1ff';
                                const cursor = num === null ? 'default' : (selectable ? 'pointer' : 'not-allowed');
                                const color = num === null ? '#9aa3ff' : (selectable ? 'inherit' : '#8b91a8');
                                const title = num === null
                                    ? 'Пустая ячейка'
                                    : (selectable ? 'Доступно для выбора' : 'Недоступно для выбора — нет рядом пустой ячейки');
                                return (
                                    <div
                                        key={`${row}-${col}`}
                                        className="cell"
                                        aria-disabled={num !== null && !selectable}
                                        title={title}
                                        style={{
                                            height: 60,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 8,
                                            border: '1px solid #9aa3ff',
                                            background,
                                            cursor,
                                            userSelect: 'none',
                                            fontWeight: isSelected ? 700 : 500,
                                            boxShadow: isSelected ? '0 0 0 2px rgba(154,163,255,0.5) inset' : 'none',
                                            transition: 'background 0.15s ease, box-shadow 0.15s ease'
                                        }}
                                        onClick={() => handleCellClick(row, col)}
                                    >
                                        <span style={{ color }}>{num}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default DigitGame;
