import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ShulteSettings } from "./types/game_shulte";
import { useTranslationFunction } from "@/hooks/useSelectiveContext";
import { useGameController } from "@/contexts/gameController";

import GameSetting from "@/components/gamesetting/gamesetting";
import Button from "@/components/button/button";

interface ShulteMenuProps {
    onStart: (settings: ShulteSettings) => void;
    onChangeSettings?: (settings: ShulteSettings) => void;
}

const ShulteMenu = React.memo<ShulteMenuProps>(({ onStart, onChangeSettings }) => {
    const [size, setSize] = useState(4);
    const t = useTranslationFunction();

    const availableSizes = useMemo(() => [4, 5], []);

    // Notify parent about settings change
    useEffect(() => {
        if (onChangeSettings) onChangeSettings({ size });
        // intentionally omit onChangeSettings to avoid effect re-run on identity changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size]);

    // Memoized options for sizes
    const sizeOptions = useMemo(() => 
        availableSizes.map(v => ({ 
            key: v, 
            label: v === 4 ? 
                t('game-menu.bsize.standard') : 
                t('game-menu.bsize.large') 
        })), [availableSizes, t]
    );

    // Memoized handlers
    const handleSizeChange = useCallback((k: string | number) => {
        setSize(Number(k));
    }, []);

    const handleStart = useCallback(() => {
        onStart({ size });
    }, [onStart, size]);

    return (
        <div className="game-menu">
            <h2>{t('game-menu.setup')}</h2>
            <GameSetting
                title={t('game-menu.shulte.size')}
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

ShulteMenu.displayName = 'ShulteMenu';

export default ShulteMenu;
