// Pure logic for the Digital (Digit) Game

import type { DigitBoard, DigitCell, DigitGameSettings } from './types/game_digital';

export const numberDistribution = {
    6: { board: 7, numbers: { 1:8, 2:8, 3:16, 4:8, 5:8 } },
    7: { board: 7, numbers: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8 } },
    8: {
        board: { small: 7, big: 9 },
        numbers: {
            7: { 1:6, 2:6, 3:6, 4:12, 5:6, 6:6, 7:6 },
            9: { 1:10, 2:10, 3:10, 4:20, 5:10, 6:10, 7:10 }
        }
    },
    9: { board: 9, numbers: { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10, 7:10, 8:10 } },
    10: { board: 9, numbers: { 1:8, 2:8, 3:8, 4:8, 5:16, 6:8, 7:8, 8:8, 9:8 } }
};

export function getDistribution(target: number, size: number): Record<number, number> {
    if (target === 8) {
        // allow both 7 and 9 board size
        return (numberDistribution[8].numbers as Record<number, Record<number, number>>)[size] || {};
    }
    return (numberDistribution as Record<number, any>)[target].numbers;
}

export function generateBoard(target: number, size: number): DigitBoard {
    const numbers = getDistribution(target, size);
    let cells: number[] = [];
    for (const numStr in numbers) {
        const num = Number(numStr);
        for (let i = 0; i < numbers[num]; i++) {
            cells.push(num);
        }
    }
    // Shuffle
    cells = cells.sort(() => Math.random() - 0.5);
    // Insert empty cell in center
    const board: DigitBoard = [];
    let idx = 0;
    const center = Math.floor(size / 2);
    for (let i = 0; i < size; i++) {
        const row: (number|null)[] = [];
        for (let j = 0; j < size; j++) {
            if (i === center && j === center) {
                row.push(null);
            } else {
                row.push(cells[idx++]);
            }
        }
        board.push(row);
    }
    return board;
}

export const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
];

export function isNextToEmpty(board: DigitBoard, row: number, col: number): boolean {
    return directions.some(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        return board[newRow]?.[newCol] === null;
    });
}

export function isBoardCleared(board: DigitBoard): boolean {
    return board.flat().every((cell: DigitCell) => cell === null);
}
