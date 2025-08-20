// Pure logic for Queens game (LinkedIn-style):
// - No two queens attack each other (rows, cols, diagonals)
// - Board is partitioned into size regions; exactly one queen per region
// - Win when exactly size queens are placed legally (one per region, no attacks)

import type { QueensBoard, QueensCell, QueensConflicts } from './types/game_queens';

// 8-color palette for up to 8 regions; UI will style by region index
export const REGION_COLORS = [
	'#f7d6e0', // pink
	'#d6f8d6', // green
	'#d6e4ff', // blue
	'#fff1b3', // yellow
	'#ffd6a5', // orange
	'#e0d6ff', // violet
	'#cdeef7', // cyan
	'#f7d6f0', // magenta
];

// Generate an N-Queens permutation (columns per row) to seed regions and guarantee a known solvable placement.
function solveNQueensPermutation(n: number): number[] {
	const cols = new Array<number>(n).fill(-1);
	const usedCols = new Array<boolean>(n).fill(false);
	const usedDiagA = new Set<number>(); // r - c
	const usedDiagB = new Set<number>(); // r + c

	function backtrack(r: number): boolean {
		if (r === n) return true;
		// randomize columns to vary puzzles
		const order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
		for (const c of order) {
			if (usedCols[c]) continue;
			const a = r - c;
			const b = r + c;
			if (usedDiagA.has(a) || usedDiagB.has(b)) continue;
			cols[r] = c;
			usedCols[c] = true;
			usedDiagA.add(a);
			usedDiagB.add(b);
			if (backtrack(r + 1)) return true;
			usedDiagB.delete(b);
			usedDiagA.delete(a);
			usedCols[c] = false;
			cols[r] = -1;
		}
		return false;
	}

	// For small n (4..8) backtracking is trivial; if somehow fails, fall back to a known pattern for even n
	if (!backtrack(0)) {
		if (n % 2 === 0) {
			// simple pattern for even n: (2k) then (2k+1) rearrangement (works for n not 2 or 3)
			const evens = Array.from({ length: Math.floor(n / 2) }, (_, i) => 2 * i);
			const odds = Array.from({ length: Math.ceil(n / 2) }, (_, i) => 2 * i + 1);
			const perm = evens.concat(odds);
			return perm.slice(0, n);
		}
		// last resort: identity
		return Array.from({ length: n }, (_, i) => i);
	}
	return cols;
}

// Create size x size regions using the requested multi-step algorithm:
// 1) place seeds: for each row r, place region r at column perm[r] (no shared columns, no diagonal attacks)
// 2) grow regions via randomized BFS so each cell is 4-adjacent to same-number cell.
export function generateRegions(size: number): number[][] {
	const perm = solveNQueensPermutation(size);
	const regions: number[][] = Array.from({ length: size }, () => Array(size).fill(-1));

	const inBounds = (r: number, c: number) => r >= 0 && c >= 0 && r < size && c < size;
	const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ] as const;

	// seeds: region id == row index
	const frontier: Array<Array<[number, number]>> = Array.from({ length: size }, () => []);
	const regionSizes = new Array<number>(size).fill(0);
	for (let r = 0; r < size; r++) {
		const c = perm[r];
		regions[r][c] = r;
		regionSizes[r] = 1;
		// init frontier with orth neighbors
		for (const [dr, dc] of dirs) {
			const nr = r + dr, nc = c + dc;
			if (inBounds(nr, nc) && regions[nr][nc] === -1) frontier[r].push([nr, nc]);
		}
	}

	// helper to add new frontier cells (without duplicates)
	function pushFrontier(region: number, r: number, c: number) {
		for (const [dr, dc] of dirs) {
			const nr = r + dr, nc = c + dc;
			if (!inBounds(nr, nc)) continue;
			if (regions[nr][nc] !== -1) continue;
			// avoid duplicate entries
			if (!frontier[region].some(([fr, fc]) => fr === nr && fc === nc)) frontier[region].push([nr, nc]);
		}
	}

	// Ensure each region gets at least one extra cell so every cell has a same-number neighbor
	const order1 = Array.from({ length: size }, (_, i) => i).sort(() => Math.random() - 0.5);
	for (const rid of order1) {
		const f = frontier[rid];
		if (f.length === 0) continue;
		const idx = Math.floor(Math.random() * f.length);
		const [r, c] = f.splice(idx, 1)[0];
		if (regions[r][c] === -1) {
			regions[r][c] = rid; regionSizes[rid]++;
			pushFrontier(rid, r, c);
		}
	}

	// Fill remaining cells by growing from regions, preferring smaller regions for balance
	let remaining = size * size - regionSizes.reduce((a, b) => a + b, 0);
	while (remaining > 0) {
		// choose region with available frontier and minimal size (tie-break random)
		const candidates = Array.from({ length: size }, (_, rid) => rid)
			.filter(rid => frontier[rid].length > 0)
			.sort((a, b) => regionSizes[a] - regionSizes[b] || (Math.random() - 0.5));
		if (candidates.length === 0) {
			// Safety: pick any unassigned cell and attach it to a random neighbor's region
			outer: for (let r = 0; r < size; r++) {
				for (let c = 0; c < size; c++) {
					if (regions[r][c] === -1) {
						for (const [dr, dc] of dirs) {
							const nr = r + dr, nc = c + dc;
							if (inBounds(nr, nc) && regions[nr][nc] !== -1) {
								const rid = regions[nr][nc];
								regions[r][c] = rid; regionSizes[rid]++;
								pushFrontier(rid, r, c);
								remaining--;
								break outer;
							}
						}
					}
				}
			}
			continue;
		}
		const rid = candidates[0];
		const f = frontier[rid];
		if (f.length === 0) continue;
		const idx = Math.floor(Math.random() * f.length);
		const [r, c] = f.splice(idx, 1)[0];
		if (regions[r][c] !== -1) continue;
		regions[r][c] = rid; regionSizes[rid]++;
		pushFrontier(rid, r, c);
		remaining--;
	}

	return regions;
}

export function createBoard(size: number): QueensBoard {
	const regions = generateRegions(size);
	const board: QueensBoard = Array.from({ length: size }, (_, r) =>
		Array.from({ length: size }, (_, c): QueensCell => ({ row: r, col: c, region: regions[r][c], hasQueen: false }))
	);
	return board;
}

export function cloneBoard(board: QueensBoard): QueensBoard {
	return board.map(row => row.map(cell => ({ ...cell })));
}

export function placeQueen(board: QueensBoard, row: number, col: number): QueensBoard {
	const next = cloneBoard(board);
	next[row][col].hasQueen = true;
	return next;
}

export function removeQueen(board: QueensBoard, row: number, col: number): QueensBoard {
	const next = cloneBoard(board);
	next[row][col].hasQueen = false;
	return next;
}

export function moveQueen(board: QueensBoard, from: {row:number; col:number}, to: {row:number; col:number}): QueensBoard {
	const next = cloneBoard(board);
	if (!next[from.row]?.[from.col]?.hasQueen) return next;
	next[from.row][from.col].hasQueen = false;
	next[to.row][to.col].hasQueen = true;
	return next;
}

export function countQueens(board: QueensBoard): number {
	return board.reduce((acc, row) => acc + row.reduce((a, c) => a + (c.hasQueen ? 1 : 0), 0), 0);
}

export function getRowConflicts(board: QueensBoard): Set<number> {
	const bad = new Set<number>();
	for (let r = 0; r < board.length; r++) {
		let cnt = 0;
		for (let c = 0; c < board.length; c++) if (board[r][c].hasQueen) cnt++;
		if (cnt > 1) bad.add(r);
	}
	return bad;
}

export function getColConflicts(board: QueensBoard): Set<number> {
	const bad = new Set<number>();
	for (let c = 0; c < board.length; c++) {
		let cnt = 0;
		for (let r = 0; r < board.length; r++) if (board[r][c].hasQueen) cnt++;
		if (cnt > 1) bad.add(c);
	}
	return bad;
}

export function getAdjacencyConflicts(board: QueensBoard): Set<string> {
	const size = board.length;
	const bad = new Set<string>();
	const dirs = [
		[-1, 0], [1, 0], [0, -1], [0, 1],
		[-1, -1], [-1, 1], [1, -1], [1, 1]
	];
	const inBounds = (r: number, c: number) => r >= 0 && c >= 0 && r < size && c < size;
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			if (!board[r][c].hasQueen) continue;
			for (const [dr, dc] of dirs) {
				const nr = r + dr, nc = c + dc;
				if (!inBounds(nr, nc)) continue;
				if (board[nr][nc].hasQueen) {
					bad.add(`${r},${c}`);
					bad.add(`${nr},${nc}`);
				}
			}
		}
	}
	return bad;
}

export function getRegionConflicts(board: QueensBoard): Set<number> {
	const hits = new Map<number, number>();
	for (const row of board) {
		for (const cell of row) {
			if (!cell.hasQueen) continue;
			hits.set(cell.region, (hits.get(cell.region) ?? 0) + 1);
		}
	}
	const bad = new Set<number>();
	for (const [region, count] of hits) if (count > 1) bad.add(region);
	return bad;
}

export function computeConflicts(board: QueensBoard): QueensConflicts {
	const rows = getRowConflicts(board);
	const cols = getColConflicts(board);
	const adjacent = getAdjacencyConflicts(board);
	const regions = getRegionConflicts(board);
	return { rows, cols, regions, adjacent };
}

export function isCellInConflict(board: QueensBoard, row: number, col: number, conflicts?: QueensConflicts): boolean {
	const c = board[row][col];
	if (!c.hasQueen) return false;
	const conf = conflicts ?? computeConflicts(board);
	if (conf.rows.has(row) || conf.cols.has(col)) return true;
	if (conf.adjacent.has(`${row},${col}`)) return true;
	if (conf.regions.has(c.region)) return true;
	return false;
}

export function isRegionInConflict(board: QueensBoard, region: number, conflicts?: QueensConflicts): boolean {
	const conf = conflicts ?? computeConflicts(board);
	return conf.regions.has(region);
}

export function isSolved(board: QueensBoard): boolean {
	const size = board.length;
	const total = countQueens(board);
	if (total !== size) return false; // must place exactly size queens
	const conf = computeConflicts(board);
	// No row/col adjacency conflicts and no region with 2+ queens; also ensure each region has exactly 1 queen
	if (conf.rows.size > 0 || conf.cols.size > 0 || conf.adjacent.size > 0 || conf.regions.size > 0) return false;
	const regionCounts = new Array<number>(size).fill(0);
	for (const row of board) for (const cell of row) if (cell.hasQueen) regionCounts[cell.region]++;
	return regionCounts.every(v => v === 1);
}

// Safe check if drop target is occupied by another queen; allowed (we move) but caller may want to decide
export function hasQueen(board: QueensBoard, row: number, col: number): boolean {
	return !!board[row]?.[col]?.hasQueen;
}

