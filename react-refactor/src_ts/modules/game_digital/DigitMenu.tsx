import React, { useState, useEffect } from 'react';
import type { DigitGameSettings } from './types/game_digital';
import { useGameController } from '../../contexts/gameController';
import { useLanguage } from '@/contexts/i18n';

import GameSetting from '@/components/gamesetting/gamesetting';
import Button from '@/components/button/button';

interface DigitMenuProps {
    onStart: (settings: DigitGameSettings) => void;
    initialSettings?: DigitGameSettings;
}

function DigitMenu({ onStart, initialSettings } : DigitMenuProps) {
    const [target, setTarget] = useState<number>(initialSettings?.target || 6);
    const [size, setSize] = useState<number>(initialSettings?.size || 7);

    const { t } = useLanguage();

    useEffect(() => {
        if (target === 6 || target === 7) setSize(7);
        else if (target === 9 || target === 10) setSize(9);
        else if (target === 8 && size !== 7 && size !== 9) setSize(7);
    }, [target]);

    let availableSizes: number[] = [];
    if (target === 6 || target === 7) availableSizes = [7];
    else if (target === 9 || target === 10) availableSizes = [9];
    else if (target === 8) availableSizes = [7, 9];

    return (
        <div className="game-menu">
            <h2>{t('game-menu.setup')}</h2>
            <GameSetting
                title={t('game-menu.digit.target')}
                options={[6, 7, 8, 9, 10].map(v => ({ key: v, label: v }))}
                selected={target}
                onChange={(k) => setTarget(Number(k))}
            />
            <GameSetting
                title={t('game-menu.digit.size')}
                options={availableSizes.map(v => 
                    ({ key: v, label: v === 7 ? 
                        t('game-menu.bsize.standard') : 
                        t('game-menu.bsize.large') 
                    })
                )}
                selected={size}
                onChange={(k) => setSize(Number(k))}
            />
            <Button
                className="game-button"
                onClick={() => onStart({ target, size })}
            >
                {t('buttons.start')}
            </Button>
        </div>
    );
};

export default DigitMenu;
