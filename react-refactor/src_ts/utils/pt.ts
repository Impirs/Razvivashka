// Props translation utility
import "@/modules/game_digit/types/game_digit";
import "@/modules/game_shulte/types/game_shulte";
import "@/modules/game_queens/types/game_queens";
import "@/modules/game_tango/types/game_tango";

// Returns only the props part used for achievements, without the gameId prefix
export function generateAchievementProps(gameId: string, gameProps: any, isPerfect: boolean): string {
    switch (gameId) {
        case 'digit': {
            let size: number | undefined;
            let target: number | undefined;
            if (typeof gameProps === 'string') {
                const [a, b] = gameProps.split('x').map((n) => Number(n));
                size = a; target = b;
            } else if (gameProps && typeof gameProps === 'object') {
                size = typeof gameProps.size === 'number' ? gameProps.size : Number(gameProps.size);
                target = typeof gameProps.target === 'number' ? gameProps.target : Number(gameProps.target);
            }
            if (typeof size !== 'number' || Number.isNaN(size)) return '';
            return isPerfect ? `${size}x100` : `${size}x${target ?? ''}`;
        }
        case 'shulte': {
            let size: number | undefined;
            if (typeof gameProps === 'string') {
                const [a] = gameProps.split('x').map((n) => Number(n));
                size = a;
            } else if (gameProps && typeof gameProps === 'object') {
                size = typeof gameProps.size === 'number' ? gameProps.size : Number(gameProps.size);
            }
            if (typeof size !== 'number' || Number.isNaN(size)) return '';
            return isPerfect ? `${size}x100` : `${size}x${size}`;
        }
        case 'queens': {
            let size: number | undefined;
            if (typeof gameProps === 'string') {
                const [a] = gameProps.split('x').map((n) => Number(n));
                size = a;
            } else if (gameProps && typeof gameProps === 'object') {
                size = typeof (gameProps as any).size === 'number' ? (gameProps as any).size : Number((gameProps as any).size);
            }
            if (typeof size !== 'number' || Number.isNaN(size)) return '';
            // perfect marker follows same pattern
            return isPerfect ? `${size}x100` : `${size}x${size}`;
        }
        case 'tango': {
            // gameProps for tango records come as '6x<complexity>' where 6 is fixed board size
            // Previously we incorrectly treated the first token (6) as complexity which broke achievement lookup
            let complexity: number | undefined;
            if (typeof gameProps === 'string') {
                const parts = gameProps.split('x').map(n => Number(n));
                if (parts.length === 2) {
                    // Expect pattern size x complexity; size is parts[0] (always 6), complexity is parts[1]
                    complexity = parts[1];
                } else if (parts.length === 1) {
                    // Fallback: single number provided, treat as complexity directly
                    complexity = parts[0];
                }
            } else if (gameProps && typeof gameProps === 'object') {
                // If we ever pass an object, read its complexity field
                complexity = typeof (gameProps as any).complexity === 'number'
                    ? (gameProps as any).complexity
                    : Number((gameProps as any).complexity);
            }
            if (typeof complexity !== 'number' || Number.isNaN(complexity)) return '';
            return isPerfect ? '6x100' : `6x${complexity}`;
        }
        default:
            return '';
    }
}

// Generate props string for records UI and storage
export function generateRecordProps(gameId: string, gameProps: any): string {
    switch (gameId) {
        case 'digit': {
            // records: size x target
            let size: number | undefined;
            let target: number | undefined;
            if (typeof gameProps === 'string') {
                const [a, b] = gameProps.split('x').map(Number);
                size = a; target = b;
            } else if (gameProps && typeof gameProps === 'object') {
                size = typeof gameProps.size === 'number' ? gameProps.size : Number(gameProps.size);
                target = typeof gameProps.target === 'number' ? gameProps.target : Number(gameProps.target);
            }
            if (typeof size !== 'number' || Number.isNaN(size) || typeof target !== 'number' || Number.isNaN(target)) return '';
            return `${size}x${target}`;
        }
        case 'shulte': {
            // records: size x size
            let size: number | undefined;
            if (typeof gameProps === 'string') {
                const [a] = gameProps.split('x').map(Number);
                size = a;
            } else if (gameProps && typeof gameProps === 'object') {
                size = typeof gameProps.size === 'number' ? gameProps.size : Number(gameProps.size);
            }
            if (typeof size !== 'number' || Number.isNaN(size)) return '';
            return `${size}x${size}`;
        }
        case 'queens': {
            let size: number | undefined;
            if (typeof gameProps === 'string') {
                const [a] = gameProps.split('x').map(Number);
                size = a;
            } else if (gameProps && typeof gameProps === 'object') {
                size = typeof (gameProps as any).size === 'number' ? (gameProps as any).size : Number((gameProps as any).size);
            }
            if (typeof size !== 'number' || Number.isNaN(size)) return '';
            return `${size}x${size}`;
        }
        case 'tango': {
            // records: 6 x complexity
            let complexity: number | undefined;
            if (typeof gameProps === 'string') {
                const [a] = gameProps.split('x').map(Number);
                complexity = a;
            } else if (gameProps && typeof gameProps === 'object') {
                complexity = typeof (gameProps as any).complexity === 'number' ? (gameProps as any).complexity : Number((gameProps as any).complexity);
            }
            if (typeof complexity !== 'number' || Number.isNaN(complexity)) return '';
            return `6x${complexity}`;
        }
        default:
            return '';
    }
}