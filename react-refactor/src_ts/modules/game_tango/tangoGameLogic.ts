// Pure logic for Tango game (LinkedIn-style):
// - 6x6 grid with moons (1) and suns (2)
// - Exactly 3 moons and 3 suns per row and column
// - No more than 2 consecutive symbols of the same type

import type { 
    TangoBoard, 
    TangoCell, 
    TangoSettings, 
    TangoCellPosition, 
    TangoValidationResult, 
    TangoError 
} from './types/game_tango';

const BOARD_SIZE = 6;

// Generate a valid complete board
export function generateCompleteBoard(): TangoBoard {
    const board: TangoBoard = Array(BOARD_SIZE).fill(null)
        .map(() => Array(BOARD_SIZE).fill(0));
    
    // Try to generate a valid board with backtracking
    if (solveBoard(board, 0, 0)) {
        return board;
    }
    
    // Fallback to a known valid pattern if generation fails
    return getFallbackBoard();
}

function solveBoard(board: TangoBoard, row: number, col: number): boolean {
    if (row === BOARD_SIZE) {
        return isValidCompleteBoard(board);
    }
    
    const nextRow = col === BOARD_SIZE - 1 ? row + 1 : row;
    const nextCol = col === BOARD_SIZE - 1 ? 0 : col + 1;
    
    // Try placing moon (1) and sun (2)
    const values: TangoCell[] = [1, 2].sort(() => Math.random() - 0.5) as TangoCell[];
    
    for (const value of values) {
        board[row][col] = value;
        
        if (isValidPlacement(board, row, col) && solveBoard(board, nextRow, nextCol)) {
            return true;
        }
    }
    
    board[row][col] = 0;
    return false;
}

function isValidPlacement(board: TangoBoard, row: number, col: number): boolean {
    const value = board[row][col];
    
    // Check row constraints
    const rowCount = board[row].filter(cell => cell === value).length;
    if (rowCount > 3) return false;
    
    // Check column constraints
    const colCount = board.map(r => r[col]).filter(cell => cell === value).length;
    if (colCount > 3) return false;
    
    // Check no more than 2 consecutive in row
    if (hasThreeConsecutiveInRow(board, row, value)) return false;
    
    // Check no more than 2 consecutive in column
    if (hasThreeConsecutiveInCol(board, col, value)) return false;
    
    return true;
}

function hasThreeConsecutiveInRow(board: TangoBoard, row: number, value: TangoCell): boolean {
    for (let col = 0; col <= BOARD_SIZE - 3; col++) {
        if (board[row][col] === value && 
            board[row][col + 1] === value && 
            board[row][col + 2] === value) {
            return true;
        }
    }
    return false;
}

function hasThreeConsecutiveInCol(board: TangoBoard, col: number, value: TangoCell): boolean {
    for (let row = 0; row <= BOARD_SIZE - 3; row++) {
        if (board[row][col] === value && 
            board[row + 1][col] === value && 
            board[row + 2][col] === value) {
            return true;
        }
    }
    return false;
}

function isValidCompleteBoard(board: TangoBoard): boolean {
    // Check each row has exactly 3 moons and 3 suns
    for (let row = 0; row < BOARD_SIZE; row++) {
        const moons = board[row].filter(cell => cell === 1).length;
        const suns = board[row].filter(cell => cell === 2).length;
        if (moons !== 3 || suns !== 3) return false;
    }
    
    // Check each column has exactly 3 moons and 3 suns
    for (let col = 0; col < BOARD_SIZE; col++) {
        const moons = board.map(row => row[col]).filter(cell => cell === 1).length;
        const suns = board.map(row => row[col]).filter(cell => cell === 2).length;
        if (moons !== 3 || suns !== 3) return false;
    }
    
    // Check no three consecutive
    for (let row = 0; row < BOARD_SIZE; row++) {
        if (hasThreeConsecutiveInRow(board, row, 1) || hasThreeConsecutiveInRow(board, row, 2)) {
            return false;
        }
    }
    
    for (let col = 0; col < BOARD_SIZE; col++) {
        if (hasThreeConsecutiveInCol(board, col, 1) || hasThreeConsecutiveInCol(board, col, 2)) {
            return false;
        }
    }
    
    return true;
}

function getFallbackBoard(): TangoBoard {
    // A known valid 6x6 pattern
    return [
        [1, 2, 1, 2, 1, 2],
        [2, 1, 2, 1, 2, 1],
        [1, 2, 2, 1, 1, 2],
        [2, 1, 1, 2, 2, 1],
        [2, 1, 2, 1, 2, 1],
        [1, 2, 1, 2, 1, 2]
    ];
}

// Apply complexity settings by removing cells
export function applyComplexity(board: TangoBoard, settings: TangoSettings): TangoBoard {
    const cellsToRemove = getComplexityRemovalCount(settings.complexity);
    const gameBoard = board.map(row => [...row]);
    
    const allPositions: TangoCellPosition[] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            allPositions.push({ row, col });
        }
    }
    
    // Shuffle positions and remove required number of cells
    const shuffled = allPositions.sort(() => Math.random() - 0.5);
    for (let i = 0; i < cellsToRemove && i < shuffled.length; i++) {
        const { row, col } = shuffled[i];
        gameBoard[row][col] = 0;
    }
    
    return gameBoard;
}

function getComplexityRemovalCount(complexity: number): number {
    switch (complexity) {
        case 1: return 4;
        case 2: return 8;
        case 3: return 12;
        case 4: return 16;
        case 5: return 20;
        default: return 8;
    }
}

// Validate current board state and find errors
export function validateBoard(board: TangoBoard): TangoValidationResult {
    const errors: TangoError[] = [];
    
    // Check for three consecutive in rows
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col <= BOARD_SIZE - 3; col++) {
            const cell1 = board[row][col];
            const cell2 = board[row][col + 1];
            const cell3 = board[row][col + 2];
            
            if (cell1 !== 0 && cell1 === cell2 && cell2 === cell3) {
                errors.push({
                    type: 'consecutive',
                    positions: [
                        { row, col },
                        { row, col: col + 1 },
                        { row, col: col + 2 }
                    ],
                    direction: 'row'
                });
            }
        }
    }
    
    // Check for three consecutive in columns
    for (let col = 0; col < BOARD_SIZE; col++) {
        for (let row = 0; row <= BOARD_SIZE - 3; row++) {
            const cell1 = board[row][col];
            const cell2 = board[row + 1][col];
            const cell3 = board[row + 2][col];
            
            if (cell1 !== 0 && cell1 === cell2 && cell2 === cell3) {
                errors.push({
                    type: 'consecutive',
                    positions: [
                        { row, col },
                        { row: row + 1, col },
                        { row: row + 2, col }
                    ],
                    direction: 'col'
                });
            }
        }
    }
    
    // Check for too many of one type in rows
    for (let row = 0; row < BOARD_SIZE; row++) {
        const moons = board[row].map((cell, col) => ({ cell, col }))
            .filter(({ cell }) => cell === 1);
        const suns = board[row].map((cell, col) => ({ cell, col }))
            .filter(({ cell }) => cell === 2);
        
        if (moons.length > 3) {
            errors.push({
                type: 'tooMany',
                positions: moons.map(({ col }) => ({ row, col })),
                direction: 'row'
            });
        }
        
        if (suns.length > 3) {
            errors.push({
                type: 'tooMany',
                positions: suns.map(({ col }) => ({ row, col })),
                direction: 'row'
            });
        }
    }
    
    // Check for too many of one type in columns
    for (let col = 0; col < BOARD_SIZE; col++) {
        const moons: { row: number }[] = [];
        const suns: { row: number }[] = [];
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            if (board[row][col] === 1) moons.push({ row });
            if (board[row][col] === 2) suns.push({ row });
        }
        
        if (moons.length > 3) {
            errors.push({
                type: 'tooMany',
                positions: moons.map(({ row }) => ({ row, col })),
                direction: 'col'
            });
        }
        
        if (suns.length > 3) {
            errors.push({
                type: 'tooMany',
                positions: suns.map(({ row }) => ({ row, col })),
                direction: 'col'
            });
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Check if board is completely solved
export function isSolved(board: TangoBoard): boolean {
    // Board must be completely filled
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === 0) return false;
        }
    }
    
    // Board must be valid
    const validation = validateBoard(board);
    return validation.isValid;
}

// Handle cell click/interaction
export function handleCellClick(
    board: TangoBoard, 
    originalBoard: TangoBoard, 
    row: number, 
    col: number, 
    isRightClick: boolean
): TangoBoard {
    // Can't modify cells that were originally filled
    if (originalBoard[row][col] !== 0) {
        return board;
    }
    
    const newBoard = board.map(r => [...r]);
    const currentValue = board[row][col];
    
    if (isRightClick) {
        // Right click: add/remove/toggle moon
        if (currentValue === 1) {
            newBoard[row][col] = 0; // Remove moon
        } else {
            newBoard[row][col] = 1; // Add moon
        }
    } else {
        // Left click: add/remove/toggle sun
        if (currentValue === 2) {
            newBoard[row][col] = 0; // Remove sun
        } else {
            newBoard[row][col] = 2; // Add sun
        }
    }
    
    return newBoard;
}

// Check if position has error
export function hasError(board: TangoBoard, row: number, col: number): boolean {
    const validation = validateBoard(board);
    return validation.errors.some(error => 
        error.positions.some(pos => pos.row === row && pos.col === col)
    );
}
