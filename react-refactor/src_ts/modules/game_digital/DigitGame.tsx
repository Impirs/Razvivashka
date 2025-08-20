import { useEffect, useRef, useState } from 'react';
import { generateBoard, isBoardCleared, isNextToEmpty } from './digitGameLogic';
import type { DigitGameSettings } from './types/game_digit';
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from '@/utils/ft';

import { useGameController } from '../../contexts/gameController';
import { useSettings } from '@/contexts/pref';
import { useLanguage } from '@/contexts/i18n';

import Icon from '@/components/icon/icon';

import fireworksGif from "@/assets/animations/fireworks.gif";
import unluckyGif from "@/assets/animations/unlucky.gif";


interface DigitGameProps {
    settings: DigitGameSettings;
}

function DigitGame({ settings }: DigitGameProps) {
    const { status, score, startGame, 
            endGame, updateScore, setGameContext, setModifications, 
            gameId, gameProps, startedAt } = useGameController();
    const { useSetting } = useSettings();
    const { t } = useLanguage();
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
    // which run (startedAt) the board is ready for; prevents cross-run stale wins
    const [boardReadyRunId, setBoardReadyRunId] = useState<number | null>(null);

    // setup board and start timer when playing begins, and re-init on each Start press (startedAt changes)
    useEffect(() => {
        if (status === 'playing' && startedAt) {
            if (lastStartRef.current !== startedAt) {
                lastStartRef.current = startedAt;
                setBoard([]); // reset immediately to prevent stale checks
                setBoardReady(false);
                setBoardReadyRunId(null);
                setBoard(generateBoard(settings.target, settings.size));
                setSelected([]);
                setMistakes(0);
                updateScore(0);
                setSeconds(0);
                // Assume perfect at the start of a run
                setGameContext('digit', generateRecordProps('digit', settings), true);
                // Set modifications based on gameplay settings
                const mods: string[] = [];
                if (!assistHighlight) mods.push('view_modification');
                setModifications(mods);
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
                setBoardReadyRunId(null);
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
        if (status === 'playing' && board.length > 0 && startedAt) {
            setBoardReady(true);
            setBoardReadyRunId(startedAt);
        }
    }, [board, status, startedAt]);

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
        if (status === 'playing' && 
            boardReady && 
            startedAt && 
            boardReadyRunId === startedAt && 
            isBoardCleared(board)) 
        {
            // stop timer and submit time as score (in seconds)
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            endGame('win', seconds);
        }
    }, [board, status]);

    useEffect(() => {
        if (status === 'playing' && 
            boardReady && 
            startedAt && 
            boardReadyRunId === startedAt && 
            mistakes >= 3) 
        {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            endGame('lose', seconds);
        }
    }, [mistakes, status]);

    return (
        <section className="game-main-panel digit-panel">
            <header className="game-utils-panel">
                <div className="mistakes-counter" aria-label="mistakes">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Icon key={i} 
                            name={i < mistakes ? 'heart-broken' : 'heart'} 
                            color={ i < mistakes ? '#eb92be' : '#232323' }
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
                        <h3>{t('game-info.digit.instruction')}</h3>
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
                    <div key={`${settings.size}-${startedAt ?? 'na'}`} className={`digit-board size-${settings.size}`}>
                        {board.map((rowArr, row) =>
                            rowArr.map((num, col) => {
                                const selectable = num !== null && isNextToEmpty(board, row, col);
                                const isSelected = selected.some(s => s.row === row && s.col === col);
                                
                                let cellClass = 'digit-cell';
                                if (num === null) cellClass += ' empty';
                                else if (isSelected) cellClass += ' selected';
                                else if (assistHighlight) {
                                    if (selectable) cellClass += ' selectable';
                                    else cellClass += ' unavailable';
                                }
                                
                                const color = num === null ? '#9aa3ff' : (assistHighlight ? (selectable ? 'inherit' : '#8b91a8') : 'inherit');
                                const title = num === null
                                    ? t('game-info.digit.empty')
                                    : (assistHighlight
                                        ? (selectable ? t('game-info.digit.available') : t('game-info.digit.unavailable'))
                                        : '');
                                return (
                                    <div
                                        key={`${row}-${col}`}
                                        className={cellClass}
                                        aria-disabled={assistHighlight ? (num !== null && !selectable) : false}
                                        aria-label={title}
                                        data-tooltip={title}
                                        title={title}
                                        onClick={() => handleCellClick(row, col)}
                                    >
                                        <span className="cell-number" style={{ color }}>{num}</span>
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
