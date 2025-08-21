import React from "react";
import { DigitGameSettings } from "./types/game_digit";
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from "@/utils/ft";
import { generateBoard, isNextToEmpty } from './digitGameLogic';

import { useGameController } from "../../contexts/gameController";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useSettings } from "../../contexts/pref";
import { useTranslationFunction } from "@/hooks/useSelectiveContext";

import Icon from "@/components/icon/icon";

import fireworksGif from "@/assets/animations/fireworks.gif";
import unluckyGif from "@/assets/animations/unlucky.gif";

// React.memo prevents re-rendering when mistakes count hasn't changed
// useMemo for icons array prevents recreation on each render
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

// Simple timer component wrapped in memo since it only depends on seconds
const GameTimer = React.memo<{ seconds: number }>(({ seconds }) => (
    <div className="game-timer">
        <div aria-label="timer">{formatTime(seconds)}</div>
    </div>
));

GameTimer.displayName = 'GameTimer';

// React.memo for digit buttons prevents re-rendering when other digits change
// useCallback ensures onClick reference stability for optimal performance
const DigitButton = React.memo<{
    digit: number;
    cellIndex: number;
    isSelected: boolean;
    isFound: boolean;
    isAvailable: boolean;
    onClick: (digit: number, cellIndex: number) => void;
}>(({ digit, cellIndex, isSelected, isFound, isAvailable, onClick }) => {
    const handleClick = React.useCallback(() => {
        onClick(digit, cellIndex);
    }, [digit, cellIndex, onClick]);

    return (
        <button
            className={`digit-cell ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''} ${!isAvailable ? 'unavailable' : ''}`}
            onClick={handleClick}
            disabled={isFound || !isAvailable}
        >
            {digit}
        </button>
    );
});

DigitButton.displayName = 'DigitButton';

const DigitGame = React.memo<{ settings: DigitGameSettings }>(({ settings }) => {
    const { status, endGame, setGameContext, setModifications, gameId, gameProps, startedAt } = useGameController();
    const { useSetting } = useSettings();
    const t = useTranslationFunction();

    // console.log('DigitGame render:', { 
    //     status, 
    //     gameId, 
    //     gameProps, 
    //     startedAt,
    //     settingsSize: settings.size,
    //     settingsTarget: settings.target 
    // });
    
    const [gamesSettings] = useSetting('games');
    const hideCorrectNumbers = gamesSettings?.digit?.view_modification ?? false;

    const [board, setBoard] = React.useState<(number | null)[]>([]);
    const [selectedCells, setSelectedCells] = React.useState<number[]>([]);
    const [mistakes, setMistakes] = React.useState(0);
    const [foundCells, setFoundCells] = React.useState<Set<number>>(new Set());
    const [availableCells, setAvailableCells] = React.useState<Set<number>>(new Set());
    const lastStartRef = React.useRef<number | null>(null);
    const lastMistakeRef = React.useRef<string | null>(null);

    // Используем наш кастомный хук таймера
    const { seconds, resetTimer } = useGameTimer({ 
        isPlaying: status === 'playing',
        startedAt: startedAt 
    });

    // Function to check if a cell is available for selection (adjacent to empty cells)
    const getAvailableCells = React.useCallback((currentBoard: (number | null)[], foundSet: Set<number>) => {
        const size = settings.size;
        const availableCells = new Set<number>();
        
        // Convert flat board back to 2D for isNextToEmpty function
        const board2D: (number | null)[][] = [];
        for (let i = 0; i < size; i++) {
            const row: (number | null)[] = [];
            for (let j = 0; j < size; j++) {
                const flatIndex = i * size + j;
                // If cell is found (cleared), treat it as null
                row.push(foundSet.has(flatIndex) ? null : currentBoard[flatIndex]);
            }
            board2D.push(row);
        }
        
        // Check each cell if it's available for selection
        for (let i = 0; i < currentBoard.length; i++) {
            // Skip if cell is already found/cleared or is center cell
            if (foundSet.has(i) || currentBoard[i] === null) continue;
            
            const row = Math.floor(i / size);
            const col = i % size;
            
            // Use existing isNextToEmpty function
            if (isNextToEmpty(board2D, row, col)) {
                availableCells.add(i);
            }
        }
        
        return availableCells;
    }, [settings.size]);

    // Optimized game reset function - timer resets automatically via useGameTimer
    const resetGame = React.useCallback(() => {
        // Use existing digitGameLogic function and flatten the result
        const board2D = generateBoard(settings.target, settings.size);
        const newBoard = board2D.flat();
        setBoard(newBoard);
        setSelectedCells([]);
        setMistakes(0);
        setFoundCells(new Set());
        setAvailableCells(new Set());
        lastMistakeRef.current = null; // Reset mistake tracking
        // Don't call resetTimer() - useGameTimer handles it automatically
        
        // Start with perfect assumption
        const recordProps = generateRecordProps('digit', settings);
        // console.log('DigitGame setGameContext:', { gameId: 'digit', recordProps, isPerfect: true });
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
            setGameContext('digit', recordProps, true);
        }, 0);
        
        // Set game modifications
        const mods: string[] = [];
        if (hideCorrectNumbers === true) {
            mods.push('view_modification');
        }
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
            setModifications(mods);
        }, 0);
    }, [setGameContext, setModifications, settings, hideCorrectNumbers]);

    // Game initialization
    React.useEffect(() => {
        if (status === 'playing' && startedAt && lastStartRef.current !== startedAt) {
            lastStartRef.current = startedAt;
            resetGame();
        } else if (status === 'idle') {
            lastStartRef.current = null;
        }
    }, [status, startedAt, resetGame]);

    // Update available cells when board or found cells change
    React.useEffect(() => {
        if (hideCorrectNumbers && board.length > 0) {
            const available = getAvailableCells(board, foundCells);
            setAvailableCells(available);
        }
    }, [board, foundCells, hideCorrectNumbers, getAvailableCells]);

    // Handle cell selection logic for sum-based gameplay
    const handleDigitClick = React.useCallback((digit: number, cellIndex: number) => {
        if (status !== 'playing') return;
        if (foundCells.has(cellIndex)) return; // Can't select already found cells
        
        // If modification is enabled, only allow selecting available cells
        if (hideCorrectNumbers && !availableCells.has(cellIndex)) return;

        setSelectedCells(prev => {
            const isSelected = prev.includes(cellIndex);
            
            if (isSelected) {
                // Deselect cell if already selected
                return prev.filter(idx => idx !== cellIndex);
            } else {
                const newSelection = [...prev, cellIndex];
                
                if (newSelection.length === 1) {
                    // First cell selected
                    return newSelection;
                } else if (newSelection.length === 2) {
                    // Two cells selected - check sum
                    const [firstIdx, secondIdx] = newSelection;
                    const firstValue = board[firstIdx] as number;
                    const secondValue = board[secondIdx] as number;
                    const sum = firstValue + secondValue;
                    
                    if (sum === settings.target) {
                        // console.log('Correct sum found!', { firstIdx, secondIdx, sum, target: settings.target });
                        // Correct sum - mark cells as found
                        setFoundCells(prevFound => {
                            const newFound = new Set([...prevFound, firstIdx, secondIdx]);
                            
                            // Check win condition immediately
                            const totalCells = board.filter(cell => cell !== null).length;
                            if (newFound.size >= totalCells && totalCells > 0) {
                                // console.log('DigitGame WIN! All cells found:', { 
                                //     foundCells: newFound.size, 
                                //     totalCells, 
                                //     seconds 
                                // });
                                setTimeout(() => endGame('win', seconds), 0);
                            }
                            
                            return newFound;
                        });
                        
                        return []; // Clear selection
                    } else {
                        // Wrong sum - count as mistake (prevent duplicate mistakes)
                        const mistakeKey = `${firstIdx}-${secondIdx}-${sum}`;
                        if (lastMistakeRef.current !== mistakeKey) {
                            lastMistakeRef.current = mistakeKey;
                            
                            if (mistakes === 0 && gameId === 'digit' && gameProps) {
                                // Use setTimeout to avoid setState during render
                                setTimeout(() => {
                                    setGameContext('digit', generateRecordProps('digit', settings), false);
                                }, 0);
                            }
                            setMistakes(m => m + 1);
                        }
                        return []; // Clear selection
                    }
                } else {
                    // More than 2 cells - shouldn't happen, but reset to this one
                    return [cellIndex];
                }
            }
        });
    }, [status, board, foundCells, availableCells, hideCorrectNumbers, settings.target, mistakes, gameId, gameProps, endGame, seconds, setGameContext]);

    // Проигрыш при 3 ошибках
    React.useEffect(() => {
        if (status === 'playing' && mistakes >= 3) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
                endGame('lose', seconds);
            }, 0);
        }
    }, [mistakes, status, seconds, endGame]);

    const gameBoard = React.useMemo(() => {
        if (status !== 'playing') return null;

        return (
            <div 
                key={`${settings.size}-${settings.target}-${startedAt ?? 'na'}`}
                className={`digit-board size-${settings.size}`}
            >
                {board.map((digit, index) => {
                    // Handle center cell (null)
                    if (digit === null) {
                        return (
                            <div 
                                key={`center-${index}`} 
                                className="digit-cell center-cell"
                            >
                                {/* Empty center cell */}
                            </div>
                        );
                    }

                    const isFound = foundCells.has(index);
                    const isSelected = selectedCells.includes(index);
                    const isAvailable = !hideCorrectNumbers || availableCells.has(index);
                    
                    // If cell is found, show empty cell
                    if (isFound) {
                        return (
                            <div 
                                key={`found-${index}`} 
                                className="digit-cell found"
                            >
                                {/* Empty cell - number was found and cleared */}
                            </div>
                        );
                    }
                    
                    return (
                        <DigitButton
                            key={`${digit}-${index}`}
                            digit={digit}
                            cellIndex={index}
                            isSelected={isSelected}
                            isFound={isFound}
                            isAvailable={isAvailable}
                            onClick={handleDigitClick}
                        />
                    );
                })}
            </div>
        );
    }, [status, board, foundCells, selectedCells, availableCells, hideCorrectNumbers, settings.size, settings.target, startedAt, handleDigitClick]);

    return (
        <section className="game-main-panel digit-panel">
            <header className="game-utils-panel">
                <MistakesCounter mistakes={mistakes} />
                <div></div>
                <GameTimer seconds={seconds} />
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
                {gameBoard}
            </div>
        </section>
    );
});

DigitGame.displayName = 'DigitGame';

export default DigitGame;
