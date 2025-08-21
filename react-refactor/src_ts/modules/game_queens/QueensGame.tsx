import React from 'react';
import type { QueensSettings, QueensBoard } from './types/game_queens';
import { createBoard, computeConflicts, isSolved, placeQueen, removeQueen, moveQueen, countQueens } from './queensGameLogic';
import { useGameController } from '@/contexts/gameController';
import { useSettings } from '@/contexts/pref';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';
import { useGameTimer } from '@/hooks/useGameTimer';
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from '@/utils/ft';

import Icon from '@/components/icon/icon';
import fireworksGif from '@/assets/animations/fireworks.gif';

interface QueensGameProps { 
    settings: QueensSettings; 
}

const QueensRemaining = React.memo<{ remaining: number }>(({ remaining }) => {
    const remainingStyle = React.useMemo(() => ({ 
        marginLeft: 8, 
        fontFamily: "PlayBall" 
    }), []);

    return (
        <div className="queens-remaining" aria-label="remaining">
            <Icon name="queen" color='#1c274c'/>
            <span style={remainingStyle}>{remaining}</span>
        </div>
    );
});

QueensRemaining.displayName = 'QueensRemaining';

const GameTimer = React.memo<{ seconds: number }>(({ seconds }) => (
    <div className="game-timer">
        <div aria-label="timer">{formatTime(seconds)}</div>
    </div>
));

GameTimer.displayName = 'GameTimer';

const QueensCell = React.memo<{
    cell: { hasQueen: boolean; region: number };
    row: number;
    col: number;
    conflicts: { rows: Set<number>; cols: Set<number>; regions: Set<number>; adjacent: Set<string> };
    isBlocked: boolean;
    assistHighlight: boolean;
    onDoubleClick: (row: number, col: number) => void;
    onMouseDown: (row: number, col: number) => void;
    onMouseUp: (row: number, col: number) => void;
}>(({ cell, row, col, conflicts, isBlocked, assistHighlight, onDoubleClick, onMouseDown, onMouseUp }) => {
    
    const rowBad = conflicts.rows.has(row);
    const colBad = conflicts.cols.has(col);
    const regionBad = conflicts.regions.has(cell.region);
    const adjacentBad = cell.hasQueen && conflicts.adjacent.has(`${row},${col}`);
    const isBlockedCell = assistHighlight && !cell.hasQueen && isBlocked;

    const cellClassName = React.useMemo(() => {
        let className = `q-cell region-${cell.region}`;
        if (cell.hasQueen) className += ' has-queen';
        if (rowBad) className += ' row-bad';
        if (colBad) className += ' col-bad';
        if (regionBad) className += ' region-bad';
        if (adjacentBad) className += ' adj-bad';
        return className.trim();
    }, [cell.hasQueen, cell.region, rowBad, colBad, regionBad, adjacentBad]);

    const handleDoubleClick = React.useCallback(() => {
        onDoubleClick(row, col);
    }, [row, col, onDoubleClick]);

    const handleMouseDown = React.useCallback(() => {
        onMouseDown(row, col);
    }, [row, col, onMouseDown]);

    const handleMouseUp = React.useCallback(() => {
        onMouseUp(row, col);
    }, [row, col, onMouseUp]);

    const cellTitle = React.useMemo(() => 
        `r${row+1},c${col+1} · region ${cell.region+1}`, [row, col, cell.region]
    );

    return (
        <div
            className={cellClassName}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            title={cellTitle}
        >
            {cell.hasQueen && (
                <Icon 
                    name="queen" 
                    className="q-piece" 
                    color='#1c274c'
                />
            )}
            {isBlockedCell && (
                <span className="q-blocked">×</span>
            )}
        </div>
    );
});

QueensCell.displayName = 'QueensCell';

const QueensGame = React.memo<QueensGameProps>(({ settings }) => {
    const { status, endGame, setGameContext, setModifications, startedAt } = useGameController();
    const t = useTranslationFunction();
    const { useSetting } = useSettings();
    
    const [gamesSettings] = useSetting('games');
    const assistHighlight = gamesSettings?.queens?.view_modification ?? true;

    const [board, setBoard] = React.useState<QueensBoard>([]);
    const [boardReady, setBoardReady] = React.useState(false);
    const [boardReadyRunId, setBoardReadyRunId] = React.useState<number | null>(null);
    const [dragFrom, setDragFrom] = React.useState<{row:number; col:number} | null>(null);
    const lastStartRef = React.useRef<number | null>(null);
    const isInitializingRef = React.useRef(false);

    // Optimized timer hook manages timer state automatically
    const { seconds, resetTimer } = useGameTimer({ 
        isPlaying: status === 'playing',
        startedAt: startedAt 
    });

    // Game initialization effect - prevent infinite re-renders with initialization flag
    React.useEffect(() => {
        if (status === 'playing' && startedAt && lastStartRef.current !== startedAt && !isInitializingRef.current) {
            isInitializingRef.current = true;
            lastStartRef.current = startedAt;
            
            // Reset game state in batch to prevent multiple renders
            const newBoard = createBoard(settings.size);
            setBoardReady(false);
            setBoardReadyRunId(null);
            // Don't call resetTimer() - useGameTimer handles it automatically
            
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
                setGameContext('queens', generateRecordProps('queens', settings), true);
            }, 0);
            
            const mods: string[] = [];
            if (!assistHighlight) mods.push('view_modification');
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
                setModifications(mods);
            }, 0);
            
            // Set board after other state updates to prevent conflicts
            setTimeout(() => {
                setBoard(newBoard);
                isInitializingRef.current = false;
            }, 0);
        }
    }, [status, startedAt, settings.size, setGameContext, setModifications, assistHighlight]);

    // Handle idle state separately to avoid conflicts
    React.useEffect(() => {
        if (status === 'idle' && !isInitializingRef.current) {
            lastStartRef.current = null;
            setTimeout(() => {
                setBoard([]);
                setBoardReady(false);
                setBoardReadyRunId(null);
            }, 0);
        }
    }, [status]);

    // Mark board as ready when it's populated and game is playing
    React.useEffect(() => {
        if (status === 'playing' && startedAt && board.length > 0 && !boardReady && !isInitializingRef.current) {
            setBoardReady(true);
            setBoardReadyRunId(startedAt);
        }
    }, [board.length, status, startedAt, boardReady]);

    // Мемоизированные вычисления
    const conflicts = React.useMemo(() => computeConflicts(board), [board]);
    const placed = React.useMemo(() => countQueens(board), [board]);
    const remaining = React.useMemo(() => Math.max(0, settings.size - placed), [settings.size, placed]);

    // Мемоизированные заблокированные ячейки (подсказки)
    const blocked = React.useMemo(() => {
        if (!assistHighlight || board.length === 0) return new Set<string>();
        const size = board.length;
        const s = new Set<string>();
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (!board[r][c].hasQueen) continue;
                for (let i = 0; i < size; i++) {
                    if (i !== c) s.add(`${r},${i}`); // row
                    if (i !== r) s.add(`${i},${c}`); // col
                }
            }
        }
        return s;
    }, [assistHighlight, board]);

    // Check for win condition and end game with timer value
    React.useEffect(() => {
        if (status === 'playing' && boardReady && startedAt && boardReadyRunId === startedAt && isSolved(board)) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
                endGame('win', seconds);
            }, 0);
        }
    }, [board, boardReady, boardReadyRunId, startedAt, status, seconds, endGame]);

    // Мемоизированные обработчики взаимодействий
    const onCellDoubleClick = React.useCallback((row: number, col: number) => {
        if (status !== 'playing') return;
        const has = board[row][col].hasQueen;
        if (!has) {
            // placing a new queen — forbid if limit reached
            if (placed >= settings.size) return;
            setBoard(prev => placeQueen(prev, row, col));
        } else {
            setBoard(prev => removeQueen(prev, row, col));
        }
    }, [status, board, placed, settings.size]);

    const onMouseDown = React.useCallback((row: number, col: number) => {
        if (status !== 'playing') return;
        if (board[row][col].hasQueen) setDragFrom({ row, col });
    }, [status, board]);

    const onMouseUp = React.useCallback((row: number, col: number) => {
        if (status !== 'playing') return;
        if (dragFrom) {
            const from = dragFrom; 
            setDragFrom(null);
            if (from.row !== row || from.col !== col) {
                // don't move onto an occupied cell
                if (board[row][col].hasQueen) return;
                setBoard(prev => moveQueen(prev, from, { row, col }));
            }
        }
    }, [status, dragFrom, board]);

    const handleMouseLeave = React.useCallback(() => {
        setDragFrom(null);
    }, []);

    // Мемоизированная игровая доска
    const gameBoard = React.useMemo(() => {
        if (status !== 'playing') return null;

        return (
            <div
                key={`${settings.size}-${startedAt ?? 'na'}`}
                className={`queens-board size-${settings.size}`}
                onMouseLeave={handleMouseLeave}
            >
                {board.map((rowArr, r) =>
                    rowArr.map((cell, c) => (
                        <QueensCell
                            key={`${r}-${c}`}
                            cell={cell}
                            row={r}
                            col={c}
                            conflicts={conflicts}
                            isBlocked={blocked.has(`${r},${c}`)}
                            assistHighlight={assistHighlight}
                            onDoubleClick={onCellDoubleClick}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                        />
                    ))
                )}
            </div>
        );
    }, [status, board, conflicts, blocked, assistHighlight, settings.size, startedAt, handleMouseLeave, onCellDoubleClick, onMouseDown, onMouseUp]);

    // Мемоизированные стили
    const centerStyle = React.useMemo(() => ({ 
        textAlign: 'center' as const, 
        width: '60%' 
    }), []);

    return (
        <section className="game-main-panel queens-panel">
            <header className="game-utils-panel">
                <QueensRemaining remaining={remaining} />
                <div/>
                <GameTimer seconds={seconds} />
            </header>
            <div className="game-space">
                {status === 'idle' && (
                    <div style={centerStyle}>
                        <h3>{t('game-info.time_rules')}</h3>
                        <h3>
                            <span className="q-accent">{t('game-info.double_click')}</span>
                            {t('game-info.queens.instruction_place')}
                        </h3>
                        <h3>
                            <span className="q-accent">{t('game-info.drag')}</span>
                            {t('game-info.queens.instruction_drag')}
                        </h3>
                        <h3>
                            {t('game-info.queens.instruction')}
                        </h3>
                        <hr className="q-sep" />
                        <p>{t('game-info.queens.tutorial')}</p>
                    </div>
                )}
                {status === 'win' && (
                    <div style={centerStyle}>
                        <img src={fireworksGif} alt="fireworks-animation" />
                        <h3>{t('game-info.win')}</h3>
                        <h3>{t('game-info.your_time')} {formatTime(seconds)}</h3>
                    </div>
                )}
                {gameBoard}
            </div>
        </section>
    );
});

QueensGame.displayName = 'QueensGame';

export default QueensGame;

