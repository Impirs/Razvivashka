import React from 'react';
import type { TangoSettings, TangoBoard } from './types/game_tango';
import { 
    generateCompleteBoard, 
    applyComplexity, 
    validateBoard, 
    isSolved, 
    handleCellClick
} from './tangoGameLogic';
import { useGameController } from '@/contexts/gameController';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';
import { useGameTimer } from '@/hooks/useGameTimer';
import { useCursor } from '@/hooks/useCursor';
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from '@/utils/ft';

import Icon from '@/components/icon/icon';
import fireworksGif from '@/assets/animations/fireworks.gif';

interface TangoGameProps {
    settings: TangoSettings;
}

const GameTimer = React.memo<{ seconds: number }>(({ seconds }) => (
    <div className="game-timer">
        <div aria-label="timer">{formatTime(seconds)}</div>
    </div>
));

GameTimer.displayName = 'GameTimer';

const TangoCell = React.memo<{
    cell: number;
    row: number;
    col: number;
    isOriginal: boolean;
    hasError: boolean;
    onClick: (row: number, col: number) => void;
    onContextMenu: (e: React.MouseEvent, row: number, col: number) => void;
}>(({ cell, row, col, isOriginal, hasError, onClick, onContextMenu }) => {
    
    const cellClassName = React.useMemo(() => {
        let className = 'tango-cell';
        if (isOriginal && (cell === 1 || cell === 2)) className += ' unavailable';
        if (hasError) className += ' error';
        return className.trim();
    }, [isOriginal, hasError]);

    const handleClick = React.useCallback(() => {
        onClick(row, col);
    }, [row, col, onClick]);

    const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
        onContextMenu(e, row, col);
    }, [row, col, onContextMenu]);

    return (
        <div
            className={cellClassName}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
        >
            {cell === 1 && <Icon name="moon" className='tango-icon'/>}
            {cell === 2 && <Icon name="sun" className='tango-icon'/>}
        </div>
    );
});

TangoCell.displayName = 'TangoCell';

interface GameBoards {
    solution: TangoBoard;    // Полное решение (все клетки 1/2)
    initial: TangoBoard;     // Начальная головоломка (часть клеток 0)
    current: TangoBoard;     // Текущее состояние игрока
}

const TangoGame = React.memo<TangoGameProps>(({ settings }) => {
    const { status, endGame, setGameContext, startedAt } = useGameController();
    const t = useTranslationFunction();
    
    const [gameBoards, setGameBoards] = React.useState<GameBoards | null>(null);
    const [errorPositions, setErrorPositions] = React.useState<Set<string>>(new Set());
    const [boardReady, setBoardReady] = React.useState(false);
    const [boardReadyRunId, setBoardReadyRunId] = React.useState<number | null>(null);
    
    const isInitializingRef = React.useRef(false);
    const lastStartRef = React.useRef<number | null>(null);
    
    const { seconds } = useGameTimer({ isPlaying: status === 'playing', startedAt });
    const { cursorClass } = useCursor({ enableLongPress: false });

    // Initialize game when status changes to playing
    React.useEffect(() => {
        if (status === 'playing' && startedAt && startedAt !== lastStartRef.current) {
            lastStartRef.current = startedAt;
            isInitializingRef.current = true;
            
            // Синхронное обновление контекста
            setGameContext('tango', generateRecordProps('tango', settings), true);
            
            // Генерация решения и начальной головоломки
            const solutionBoard = generateCompleteBoard();
            const initialBoard = applyComplexity(solutionBoard, settings); // содержит 0 там где можно редактировать
            // Текущее состояние стартует как копия initial
            const currentBoard = initialBoard.map(row => [...row]);
            setGameBoards({ solution: solutionBoard, initial: initialBoard, current: currentBoard });
            
            // Сброс других состояний
            setErrorPositions(new Set());
            setBoardReady(false);
            setBoardReadyRunId(null);
            
            isInitializingRef.current = false;
        }
    }, [status, startedAt, settings, setGameContext]);

    // Handle idle state separately
    React.useEffect(() => {
        if (status === 'idle' && !isInitializingRef.current) {
            lastStartRef.current = null;
            setGameBoards(null);
            setErrorPositions(new Set());
            setBoardReady(false);
            setBoardReadyRunId(null);
        }
    }, [status]);

    // Mark board as ready when it's populated and game is playing
    React.useEffect(() => {
    if (status === 'playing' && startedAt && gameBoards && gameBoards.current.length > 0 && !boardReady && !isInitializingRef.current) {
            setBoardReady(true);
            setBoardReadyRunId(startedAt);
        }
    }, [gameBoards?.current.length, boardReady, status, startedAt]);

    // Check for errors and win condition
    React.useEffect(() => {
    if (!gameBoards || gameBoards.current.length === 0) return;

    const validation = validateBoard(gameBoards.current);
        const newErrorPositions = new Set<string>();
        
        validation.errors.forEach(error => {
            error.positions.forEach(pos => {
                newErrorPositions.add(`${pos.row},${pos.col}`);
            });
        });
        
        setErrorPositions(newErrorPositions);

        // Check win condition
    if (status === 'playing' && boardReady && startedAt && boardReadyRunId === startedAt && isSolved(gameBoards.current)) {
            setTimeout(() => {
                endGame('win', seconds);
            }, 0);
        }
    }, [gameBoards?.current, boardReady, boardReadyRunId, status, startedAt, seconds, endGame]);

    // Handle cell click
    const onCellClick = React.useCallback((row: number, col: number) => {
        if (status !== 'playing' || !gameBoards) return;
        // Нельзя менять клетки которые заданы в initial ( != 0 )
        if (gameBoards.initial[row][col] !== 0) return;
        // Передаём initial как «originalBoard» чтобы handleCellClick корректно разрешал изменение только пустых
        const newBoard = handleCellClick(gameBoards.current, gameBoards.initial, row, col, false);
        setGameBoards({ solution: gameBoards.solution, initial: gameBoards.initial, current: newBoard });
    }, [gameBoards, status]);

    // Handle context menu (right click)
    const onContextMenu = React.useCallback((e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        if (status !== 'playing' || !gameBoards) return;
        if (gameBoards.initial[row][col] !== 0) return;
        const newBoard = handleCellClick(gameBoards.current, gameBoards.initial, row, col, true);
        setGameBoards({ solution: gameBoards.solution, initial: gameBoards.initial, current: newBoard });
    }, [gameBoards, status]);

    // Memoized game board
    const gameBoard = React.useMemo(() => {
    if (status !== 'playing' || !gameBoards) return null;

        const boardClassName = `tango-board ${cursorClass}`;

        return (
            <div
                key={`tango-${startedAt ?? 'na'}`}
                className={boardClassName}
            >
                {gameBoards.current.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const fixed = gameBoards.initial[rowIndex][colIndex] !== 0; // фиксируется по initial
                        const hasError = errorPositions.has(`${rowIndex},${colIndex}`);
                        return (
                            <TangoCell
                                key={`${startedAt}-${rowIndex}-${colIndex}`}
                                cell={cell}
                                row={rowIndex}
                                col={colIndex}
                                isOriginal={fixed}
                                hasError={hasError}
                                onClick={onCellClick}
                                onContextMenu={onContextMenu}
                            />
                        );
                    })
                )}
            </div>
        );
    }, [status, gameBoards, errorPositions, startedAt, cursorClass, onCellClick, onContextMenu]);

    return (
        <section className="game-main-panel tango-panel">
            <header className="game-utils-panel">
                <div/>
                <GameTimer seconds={seconds} />
                <div/>
            </header>
            <div className="game-space">
                {status === 'idle' && (
                    <div className="game-instructions">
                        <h3>{t('game-info.time_rules')}</h3>
                        <h3>{t('game-info.tango.rules.1')}</h3>
                        <h3>{t('game-info.tango.rules.2')}</h3>
                        <h3>
                            <span className="rool-accent">
                                {t('game-info.left_click')}
                            </span>
                            {t('game-info.tango.controls.1')}
                        </h3>
                        <h3>
                            <span className="rool-accent">
                                {t('game-info.right_click')}
                            </span>
                            {t('game-info.tango.controls.2')}
                        </h3>
                    </div>
                )}
                {status === 'win' && (
                    <div className="game-win">
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

TangoGame.displayName = 'TangoGame';

export default TangoGame;
