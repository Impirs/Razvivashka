export interface TangoSettings {
    complexity: 1 | 2 | 3 | 4 | 5;
}

export type TangoCell = 0 | 1 | 2; // 0 = empty, 1 = moon, 2 = sun
export type TangoBoard = TangoCell[][];

export interface TangoCellPosition {
    row: number;
    col: number;
}

export interface TangoValidationResult {
    isValid: boolean;
    errors: TangoError[];
}

export interface TangoError {
    type: 'consecutive' | 'tooMany';
    positions: TangoCellPosition[];
    direction?: 'row' | 'col';
}
