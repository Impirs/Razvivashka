import { useEffect, useRef, useState } from 'react';
import { generateBoard, isBoardCleared, isNextToEmpty } from './digitGameLogic';
import type { DigitGameSettings } from './types/game_digit';
import { generateRecordProps } from '@/utils/pt';

import { useSettings } from '@/contexts/pref';
import { useGameController } from '../../contexts/gameController';
import Icon from '@/components/icon/icon';
import { formatTime } from '@/utils/ft';

interface DigitGameProps {
    settings: DigitGameSettings;
}

function DigitGame({ settings }: DigitGameProps) {
    const { status, score, startGame, endGame, updateScore, setGameContext, gameId, gameProps, startedAt } = useGameController();
    const { useSetting } = useSettings();
    const [gamesSettings] = useSetting('games');
    const assistHighlight = gamesSettings?.digit?.view_modification ?? true;

    const [board, setBoard] = useState<(number | null)[][]>([]);
    const [selected, setSelected] = useState<{ row: number; col: number; value: number }[]>([]);
    const [mistakes, setMistakes] = useState(0);

    // timer state
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<number | null>(null);
    // track the last run start to re-init properly on each Start
    const lastStartRef = useRef<number | null>(null);
    // board readiness guard to avoid checking cleared-state before board is generated
    const [boardReady, setBoardReady] = useState(false);

    // setup board and start timer when playing begins, and re-init on each Start press (startedAt changes)
    useEffect(() => {
        if (status === 'playing' && startedAt) {
            if (lastStartRef.current !== startedAt) {
                lastStartRef.current = startedAt;
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
            // leaving playing -> stop timer, but keep last time visible on win/lose; reset only when idle
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
            // on unmount
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
        // include startedAt so a new Start triggers re-init; include settings so size/target changes at Start apply
    }, [status, startedAt, settings.size, settings.target]);

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
                    <>
                        <h3>{/*TODO: add instruction text */}</h3>
                    </>
                )}
                {status === 'win' && (
                    <div className="digit-game-win">Победа! Время: {formatTime(seconds)}</div>
                )}
                {status === 'lose' && (
                    <div className="digit-game-lose">Поражение! Ошибки: {mistakes}. Время: {formatTime(seconds)}</div>
                )}
                {status === 'playing' && (
                    <div key={`${settings.size}-${startedAt ?? 'na'}`} className="digit-board" style={{
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
                                    : assistHighlight
                                        ? (isSelected
                                            ? '#e8f2ff'
                                            : selectable
                                                ? 'white'
                                                : '#eef1ff')
                                        : 'white';
                                const cursor = num === null ? 'default' : 'pointer';
                                const color = num === null ? '#9aa3ff' : (assistHighlight ? (selectable ? 'inherit' : '#8b91a8') : 'inherit');
                                const title = num === null
                                    ? 'Пустая ячейка'
                                    : (assistHighlight
                                        ? (selectable ? 'Доступно для выбора' : 'Недоступно для выбора — нет рядом пустой ячейки')
                                        : '');
                                return (
                                    <div
                                        key={`${row}-${col}`}
                                        className="cell"
                                        aria-disabled={assistHighlight ? (num !== null && !selectable) : false}
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
