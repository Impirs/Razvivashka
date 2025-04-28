import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import usei18n from "../../../hooks/usei18n";

import TypesLine from "./game_type";

function GameBadge({game}) {
    const [title, setTitle] = useState("");
    const { t } = usei18n();
    const navigate = useNavigate();

    useEffect(() => {
        t(`game_${game?.id}`).then(setTitle);
    }, [game?.id]);

    const handleClick = () => {
        if (game?.id) {
            navigate(`/catalog/${game.id}`);
        }
    };

    return (
        <div className="game-badge" onClick={handleClick} style={{cursor: "pointer"}}>
            <div className="game-badge-img" id={`${game?.id}_preview`} />
            <TypesLine game={game}/>
            <h3> {title} </h3>
        </div>
    );
}

export default GameBadge;