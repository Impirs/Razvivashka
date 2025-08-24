import React, { useEffect, useState, useMemo, useCallback } from 'react';
import GameSetting from '@/components/gamesetting/gamesetting';
import Button from '@/components/button/button';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';
import type { TangoSettings } from './types/game_tango';

interface TangoMenuProps {
    onStart: (settings: TangoSettings) => void;
    onChangeSettings?: (settings: TangoSettings) => void;
    initialSettings?: TangoSettings;
}

const TangoMenu = React.memo<TangoMenuProps>(({ onStart, onChangeSettings, initialSettings }) => {
    const [complexity, setComplexity] = useState<1|2|3|4|5>(initialSettings?.complexity ?? 1);
    const t = useTranslationFunction();

    // Notify parent about settings change
    useEffect(() => {
        onChangeSettings?.({ complexity });
    }, [complexity, onChangeSettings]);

    // Memoized available complexities
    const availableComplexities = useMemo(() => [1, 2, 3, 4, 5] as const, []);

    // Memoized options for complexity
    const complexityOptions = useMemo(() => 
        availableComplexities.map(v => ({ 
            key: v, 
            label: `${v}` as any
        })), [availableComplexities, t]
    );

    // Memoized handlers
    const handleComplexityChange = useCallback((k: string | number) => {
        setComplexity(Number(k) as 1|2|3|4|5);
    }, []);

    const handleStart = useCallback(() => {
        onStart({ complexity });
    }, [onStart, complexity]);

    return (
        <div className="game-menu">
            <h2>{t('game-menu.setup')}</h2>
            <GameSetting
                title={t('game-menu.tango.complexity')}
                options={complexityOptions}
                selected={complexity}
                onChange={handleComplexityChange}
            />
            <Button 
                className="game-button" 
                onClick={handleStart}
            >
                {t('buttons.start')}
            </Button>
        </div>
    );
});

TangoMenu.displayName = 'TangoMenu';

export default TangoMenu;
