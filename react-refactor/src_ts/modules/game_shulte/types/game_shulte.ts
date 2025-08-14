export interface ShulteSettings {
    size: number;
}

export interface ShulteRecord {
    score: number;
    date: string;
}

export interface ShulteBoardCell {
    value: number | null;
    isFound: boolean;
}

export type ShulteBoard = ShulteBoardCell[][];
