import React, { useEffect, useState } from "react";
import { ShulteSettings } from "./types/game_shulte";
import { useLanguage } from "@/contexts/i18n";
import { useGameController } from "@/contexts/gameController";

import GameSetting from "@/components/gamesetting/gamesetting";
import Button from "@/components/button/button";

function ShulteMenu({ onStart, onChangeSettings }: { onStart: (settings: ShulteSettings) => void, onChangeSettings?: (settings: ShulteSettings) => void }) {
    const [size, setSize] = useState(4);
    const availableSizes = [4, 5];
    useEffect(() => {
        if (onChangeSettings) onChangeSettings({ size });
        // intentionally omit onChangeSettings to avoid effect re-run on identity changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size]);

    const { t } = useLanguage();

    return (
        <div className="game-menu">
            <h2>{t('game-menu.setup')}</h2>
            <GameSetting
                title={t('game-menu.shulte.size')}
                options={availableSizes.map(v => 
                    ({ key: v, label: v === 4 ? 
                        t('game-menu.bsize.standard') : 
                        t('game-menu.bsize.large') 
                    })
                )}
                selected={size}
                onChange={(k) => setSize(Number(k))}
            />
            <Button 
                className="game-button" 
                onClick={() => onStart({ size })}
            >
                {t('buttons.start')}
            </Button>
        </div>
    );
}

export default ShulteMenu;
