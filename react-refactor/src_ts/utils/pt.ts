// Props translation utility
import "@/modules/game_digital/types/game_digit";
import "@/modules/game_shulte/types/game_shulte";

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
        default:
            return '';
    }
}