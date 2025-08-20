export interface QueensSettings {
	size: 4 | 5 | 6 | 7 | 8;
}

export interface QueensCell {
	row: number;
	col: number;
	region: number; // 0..size-1
	hasQueen: boolean;
}

export type QueensBoard = QueensCell[][]; // [row][col]

export interface QueensConflicts {
	rows: Set<number>;
	cols: Set<number>;
	regions: Set<number>;
	// Cells that have adjacent queen neighbors in any of 8 directions
	adjacent: Set<string>; // keys as `${row},${col}`
}

