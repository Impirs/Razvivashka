import React from "react";
import { ShulteSettings, ShulteBoard, ShulteBoardCell } from "./types/game_shulte";
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from "@/utils/ft";

import { useGameController } from "../../contexts/gameController";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useSettings } from "../../contexts/pref";
import { useTranslationFunction } from "@/hooks/useSelectiveContext";

import Icon from "@/components/icon/icon";
import { useCursor } from '@/hooks/useCursor';

import fireworksGif from "@/assets/animations/fireworks.gif";
import unluckyGif from "@/assets/animations/unlucky.gif";

const generateShulteBoard = (size: number): ShulteBoard => {
    const arr = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return Array.from({ length: size }, (_, row) =>
        arr.slice(row * size, (row + 1) * size).map(value => ({ value, isFound: false }))
    );
};

const MistakesCounter = React.memo<{ mistakes: number }>(({ mistakes }) => {
    const mistakeIcons = React.useMemo(() => 
        Array.from({ length: 3 }).map((_, i) => (
            <Icon 
                key={i} 
                name={i < mistakes ? 'heart-broken' : 'heart'} 
                color={i < mistakes ? '#eb92be' : '#232323'}
            />
        )), [mistakes]
    );

    return (
        <div className="mistakes-counter" aria-label="mistakes">
            {mistakeIcons}
        </div>
    );
});

MistakesCounter.displayName = 'MistakesCounter';

const GameTimer = React.memo<{ seconds: number }>(({ seconds }) => (
    <div className="game-timer">
        <div aria-label="timer">{formatTime(seconds)}</div>
    </div>
));

GameTimer.displayName = 'GameTimer';

// Simple board cell without memoization for immediate updates
const ShulteCell: React.FC<{
    cell: ShulteBoardCell;
    row: number;
    col: number;
    hideFound: boolean;
    onClick: (row: number, col: number) => void;
}> = ({ cell, row, col, hideFound, onClick }) => {
    const handleClick = () => {
        onClick(row, col);
    };

    let className = 'shulte-cell';
    if (cell.isFound) className += ' found';
    if (hideFound && cell.isFound) className += ' hidden';

    return (
        <div
            onClick={handleClick}
            className={className}
        >
            <span className="cell-number">
                {cell.value}
            </span>
        </div>
    );
};

ShulteCell.displayName = 'ShulteCell';

const ShulteGame = React.memo<{ settings: ShulteSettings }>(({ settings }) => {
    const { status, startGame, endGame, setGameContext, setModifications, gameId, gameProps, startedAt } = useGameController();
    const { useSetting } = useSettings();
    const t = useTranslationFunction();
    
    const [gamesSettings] = useSetting('games');
    const hideFoundNumber = gamesSettings?.shulte?.view_modification ?? false;

    // Memoized board initialization
    const initialBoard = React.useMemo(() => generateShulteBoard(settings.size), [settings.size]);
    
    const [board, setBoard] = React.useState<ShulteBoard>(() => initialBoard);
    const [current, setCurrent] = React.useState(1);
    const [mistakes, setMistakes] = React.useState(0);
    const lastStartRef = React.useRef<number | null>(null);

    const { seconds, resetTimer } = useGameTimer({ 
        isPlaying: status === 'playing',
        startedAt: startedAt 
    });

    // Cursor hook for consistent pointer/long-press behavior (no long press needed here)
    const { cursorClass, onMouseDown, onMouseUp, onMouseLeave } = useCursor({ enableLongPress: false });

    // Optimized game reset function - timer resets automatically via useGameTimer
    const resetGame = React.useCallback(() => {
        const newBoard = generateShulteBoard(settings.size);
        setBoard(newBoard);
        setCurrent(1);
        setMistakes(0);
        // Don't call resetTimer() - useGameTimer handles it automatically
        
        // Start with perfect assumption
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
            setGameContext('shulte', generateRecordProps('shulte', settings), true);
        }, 0);
        
        // Set game modifications
        const mods: string[] = [];
        if (hideFoundNumber === false) {
            mods.push('view_modification');
        }
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
            setModifications(mods);
        }, 0);
    }, [settings.size, setGameContext, setModifications, hideFoundNumber]);

    React.useEffect(() => {
        if (status === 'playing' && startedAt && lastStartRef.current !== startedAt) {
            lastStartRef.current = startedAt;
            resetGame();
        } else if (status === 'idle') {
            lastStartRef.current = null;
        }
    }, [status, startedAt, resetGame]);

    const handleCellClick = React.useCallback((row: number, col: number) => {
        if (status !== 'playing') return;

        const cell = board[row][col];
        
        if (cell.value === current) {
            // Correct cell clicked - update board immediately with minimal operations
            setBoard(prevBoard => {
                const newBoard = [...prevBoard];
                newBoard[row] = [...newBoard[row]];
                newBoard[row][col] = { ...newBoard[row][col], isFound: true };
                return newBoard;
            });
            
            setCurrent(c => {
                const newCurrent = c + 1;
                const totalCells = settings.size * settings.size;
                // console.log('ShulteGame current updated:', { 
                //     previous: c, 
                //     new: newCurrent, 
                //     total: totalCells,
                //     isLastCell: c === totalCells
                // });
                
                // Check win condition: if we just found the last cell
                if (c === totalCells) {
                    // console.log('ShulteGame WIN! Last cell found:', { 
                    //     foundCell: c,
                    //     total: totalCells, 
                    //     seconds 
                    // });
                    setTimeout(() => endGame('win', seconds), 0);
                }
                
                return newCurrent;
            });

        } else {
            // Wrong cell clicked - handle mistake
            if (mistakes === 0 && gameId === 'shulte' && gameProps) {
                // Use setTimeout to avoid setState during render
                setTimeout(() => {
                    setGameContext('shulte', generateRecordProps('shulte', settings), false);
                }, 0);
            }
            setMistakes(m => m + 1);
        }
    }, [status, board, current, settings.size, mistakes, gameId, gameProps, endGame, seconds, setGameContext]);

    // 3 mistakes = lose
    React.useEffect(() => {
        if (status === 'playing' && mistakes >= 3) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
                endGame('lose', seconds);
            }, 0);
        }
    }, [mistakes, status, seconds, endGame]);

    // Render game board directly without memoization for immediate updates
    const renderGameBoard = () => {
        if (status !== 'playing') return null;

        return (
            <div
                key={`${settings.size}-${startedAt ?? 'na'}`}
                className={`shulte-board size-${settings.size} ${cursorClass}`}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
            >
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <ShulteCell
                            key={`${rowIndex}-${colIndex}`}
                            cell={cell}
                            row={rowIndex}
                            col={colIndex}
                            hideFound={hideFoundNumber}
                            onClick={handleCellClick}
                        />
                    ))
                )}
            </div>
        );
    };

    return (
        <section className="game-main-panel shulte-panel">
            <header className="game-utils-panel">
                <MistakesCounter mistakes={mistakes} />
                <div/>
                <GameTimer seconds={seconds} />
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
                        <img src={fireworksGif} alt="fireworks-animation" />
                        <h3>{t('game-info.win')}</h3>
                        <h3>{t('game-info.your_time')} {formatTime(seconds)}</h3>
                    </div>
                )}
                {status === 'lose' && (
                    <div style={{ textAlign: 'center', width: '60%' }}>
                        <img src={unluckyGif} alt="unlucky-animation" />
                        <h3>{t('game-info.lose')}</h3>
                        <h3>{t('game-info.your_mistakes')} {mistakes}</h3>
                        <h3>{t('game-info.your_time')} {formatTime(seconds)}</h3>
                    </div>
                )}
                {renderGameBoard()}
            </div>
        </section>
    );
});

ShulteGame.displayName = 'ShulteGame';

export default ShulteGame;
