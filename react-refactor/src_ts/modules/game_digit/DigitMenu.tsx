import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DigitGameSettings } from './types/game_digit';
import { useGameController } from '../../contexts/gameController';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';

import GameSetting from '@/components/gamesetting/gamesetting';
import Button from '@/components/button/button';

interface DigitMenuProps {
    onStart: (settings: DigitGameSettings) => void;
    initialSettings?: DigitGameSettings;
    onChangeSettings?: (settings: DigitGameSettings) => void;
}

const DigitMenu = React.memo<DigitMenuProps>(({ onStart, initialSettings, onChangeSettings }) => {
    const [target, setTarget] = useState<number>(initialSettings?.target || 6);
    const [size, setSize] = useState<number>(initialSettings?.size || 7);

    const t = useTranslationFunction(); // Only translation function, not full language context

    // useMemo prevents recalculating available sizes on every render
    const availableSizes = useMemo(() => {
        if (target === 6 || target === 7) return [7];
        else if (target === 9 || target === 10) return [9];
        else if (target === 8) return [7, 9];
        return [];
    }, [target]);

    // Automatic size adjustment based on target
    useEffect(() => {
        if (target === 6 || target === 7) setSize(7);
        else if (target === 9 || target === 10) setSize(9);
        else if (target === 8 && size !== 7 && size !== 9) setSize(7);
    }, [target, size]);

    // Notify parent about settings change
    useEffect(() => {
        if (onChangeSettings) onChangeSettings({ target, size });
        // intentionally omit onChangeSettings to avoid effect re-run on identity changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, size]);

    // useMemo for static options array prevents recreation on every render
    const targetOptions = useMemo(() => 
        [6, 7, 8, 9, 10].map(v => ({ key: v, label: v })), []
    );

    // useMemo ensures size options only update when dependencies change
    const sizeOptions = useMemo(() => 
        availableSizes.map(v => ({ 
            key: v, 
            label: v === 7 ? 
                t('game-menu.bsize.standard') : 
                t('game-menu.bsize.large') 
        })), [availableSizes, t]
    );

    // useCallback provides stable references for child components
    const handleTargetChange = useCallback((k: string | number) => {
        setTarget(Number(k));
    }, []);

    const handleSizeChange = useCallback((k: string | number) => {
        setSize(Number(k));
    }, []);

    const handleStart = useCallback(() => {
        onStart({ target, size });
    }, [onStart, target, size]);

    return (
        <div className="game-menu">
            <h2>{t('game-menu.setup')}</h2>
            <GameSetting
                title={t('game-menu.digit.target')}
                options={targetOptions}
                selected={target}
                onChange={handleTargetChange}
            />
            <GameSetting
                title={t('game-menu.digit.size')}
                options={sizeOptions}
                selected={size}
                onChange={handleSizeChange}
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

DigitMenu.displayName = 'DigitMenu';

export default DigitMenu;
