import React, { useState } from "react";
import { ShulteSettings } from "./types/game_shulte";
import { useLanguage } from "@/contexts/i18n";
import { useGameController } from "@/contexts/gameController";

import GameSetting from "@/components/gamesetting/gamesetting";
import Button from "@/components/button/button";

function ShulteMenu({ onStart }: { onStart: (settings: ShulteSettings) => void }) {
    const [size, setSize] = useState(4);
    const availableSizes = [4, 5];

    return (
        <div className="game-menu">
            <h2>Shulte Game</h2>
            <GameSetting
                title="Размер доски:"
                options={availableSizes.map(v => ({ key: v, label: v === 4 ? 'Стандарт' : 'Большой' }))}
                selected={size}
                onChange={(k) => setSize(Number(k))}
            />
            <Button 
                className="game-button" 
                onClick={() => onStart({ size })}
            >
                Start Game
            </Button>
        </div>
    );
}

export default ShulteMenu;
