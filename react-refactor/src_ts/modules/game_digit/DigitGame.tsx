import React from "react";
import { DigitGameSettings } from "./types/game_digit";
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from "@/utils/ft";

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
    onClick: (digit: number, cellIndex: number) => void;
}>(({ digit, cellIndex, isSelected, isFound, onClick }) => {
    const handleClick = React.useCallback(() => {
        onClick(digit, cellIndex);
    }, [digit, cellIndex, onClick]);

    return (
        <button
            className={`digit-cell ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''}`}
            onClick={handleClick}
            disabled={isFound}
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
    
    const [gamesSettings] = useSetting('games');
    const hideCorrectNumbers = gamesSettings?.digit?.view_modification ?? false;

    const [board, setBoard] = React.useState<(number | null)[]>([]);
    const [selectedCells, setSelectedCells] = React.useState<number[]>([]);
    const [mistakes, setMistakes] = React.useState(0);
    const [foundCells, setFoundCells] = React.useState<Set<number>>(new Set());
    const lastStartRef = React.useRef<number | null>(null);
    const lastMistakeRef = React.useRef<string | null>(null);

    // Используем наш кастомный хук таймера
    const { seconds, resetTimer } = useGameTimer({ 
        isPlaying: status === 'playing',
        startedAt: startedAt 
    });

    // Optimized board generation function based on original game logic
    const generateBoard = React.useCallback(() => {
        // Number distribution based on target and board size (from original logic)
        const numberDistribution: Record<number, any> = {
            6: { 1:8, 2:8, 3:16, 4:8, 5:8 },
            7: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8 },
            8: {
                7: { 1:6, 2:6, 3:6, 4:12, 5:6, 6:6, 7:6 },
                9: { 1:10, 2:10, 3:10, 4:20, 5:10, 6:10, 7:10 }
            },
            9: { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10, 7:10, 8:10 },
            10: { 1:8, 2:8, 3:8, 4:8, 5:16, 6:8, 7:8, 8:8, 9:8 }
        };

        // Get the correct distribution
        let numbers = numberDistribution[settings.target];
        if (settings.target === 8) {
            numbers = numbers[settings.size] || numbers[7]; // fallback to size 7 if not found
        }
        if (!numbers) {
            numbers = numberDistribution[6]; // fallback
        }

        let cells: number[] = [];

        // Fill cells array based on distribution
        for (let num in numbers) {
            for (let i = 0; i < numbers[num]; i++) {
                cells.push(Number(num));
            }
        }

        // Shuffle the array
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }

        // Create board with center cell as null, but return it in the structure
        const newBoard: (number | null)[][] = [];
        const center = Math.floor(settings.size / 2);
        let index = 0;

        for (let i = 0; i < settings.size; i++) {
            const row: (number | null)[] = [];
            for (let j = 0; j < settings.size; j++) {
                if (i === center && j === center) {
                    row.push(null); // Center cell is empty
                } else {
                    row.push(cells[index++] || 0); // Fallback to 0 if not enough cells
                }
            }
            newBoard.push(row);
        }

        // Return flattened board keeping null for center cell
        return newBoard.flat();
    }, [settings.target, settings.size]);

    // Optimized game reset function - timer resets automatically via useGameTimer
    const resetGame = React.useCallback(() => {
        const newBoard = generateBoard();
        setBoard(newBoard);
        setSelectedCells([]);
        setMistakes(0);
        setFoundCells(new Set());
        lastMistakeRef.current = null; // Reset mistake tracking
        // Don't call resetTimer() - useGameTimer handles it automatically
        
        // Start with perfect assumption
        setGameContext('digital', generateRecordProps('digital', settings), true);
        
        // Set game modifications
        const mods: string[] = [];
        if (hideCorrectNumbers === false) {
            mods.push('view_modification');
        }
        setModifications(mods);
    }, [generateBoard, setGameContext, setModifications, settings, hideCorrectNumbers]);

    // Инициализация игры при старте
    React.useEffect(() => {
        if (status === 'playing' && startedAt && lastStartRef.current !== startedAt) {
            lastStartRef.current = startedAt;
            resetGame();
        } else if (status === 'idle') {
            lastStartRef.current = null;
        }
    }, [status, startedAt, resetGame]);

    // Handle cell selection logic for sum-based gameplay
    const handleDigitClick = React.useCallback((digit: number, cellIndex: number) => {
        if (status !== 'playing') return;
        if (foundCells.has(cellIndex)) return; // Can't select already found cells

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
                        // Correct sum - mark cells as found
                        setFoundCells(prevFound => {
                            const newFound = new Set([...prevFound, firstIdx, secondIdx]);
                            
                            // Check for win condition (all non-null cells found)
                            const totalCells = board.filter(cell => cell !== null).length;
                            if (newFound.size >= totalCells) {
                                endGame('win', seconds);
                            }
                            
                            return newFound;
                        });
                        
                        return []; // Clear selection
                    } else {
                        // Wrong sum - count as mistake (prevent duplicate mistakes)
                        const mistakeKey = `${firstIdx}-${secondIdx}-${sum}`;
                        if (lastMistakeRef.current !== mistakeKey) {
                            lastMistakeRef.current = mistakeKey;
                            
                            if (mistakes === 0 && gameId === 'digital' && gameProps) {
                                setGameContext('digital', generateRecordProps('digital', settings), false);
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
    }, [status, board, foundCells, settings.target, mistakes, gameId, gameProps, endGame, seconds, setGameContext]);

    // Проигрыш при 3 ошибках
    React.useEffect(() => {
        if (status === 'playing' && mistakes >= 3) {
            endGame('lose', seconds);
        }
    }, [mistakes, status, seconds, endGame]);

    // Мемоизированная игровая доска
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
                    const shouldHide = hideCorrectNumbers && isFound;
                    
                    if (shouldHide) {
                        return (
                            <div 
                                key={`hidden-${index}`} 
                                className="digit-cell hidden-cell"
                            >
                                {/* Hidden found number */}
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
                            onClick={handleDigitClick}
                        />
                    );
                })}
            </div>
        );
    }, [status, board, foundCells, selectedCells, hideCorrectNumbers, settings.size, settings.target, startedAt, handleDigitClick]);

    return (
        <section className="game-main-panel digit-panel">
            <header className="game-utils-panel">
                <MistakesCounter mistakes={mistakes} />
                <div className="current-number">
                    {status === 'playing' && (
                        <span>Найдите сумму: {settings.target}</span>
                    )}
                </div>
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
