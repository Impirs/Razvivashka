export interface DigitGameSettings {
    size: number;
    target: number;
}

export type DigitCell = number | null;
export type DigitBoard = DigitCell[][];
