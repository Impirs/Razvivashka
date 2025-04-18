import React, { useEffect, useState } from "react";
import usei18n from "../../../hooks/usei18n";

import TypesLine from "./game_type";

function GameBadge({game}) {
    console.log(game);
    const [title, setTitle] = useState("");
    const [preview, setPath] = useState("");
    const { t } = usei18n();
    
    useEffect(() => {
        t(`game_${game.id}`).then(setTitle);
        setPath(`@shared/assets/game_${game.id}/${game.id}_preview.png`);
        "@shared/assets/game_digit/digit_preview.png"
    }, [game.id]);

    return (
        <div className="game-badge">
            <img src={preview} alt="game-badge-img" />
            <TypesLine game={game}/>
            <h3> {title} </h3>
        </div>
    );
}

export default GameBadge;