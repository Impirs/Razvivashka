import React from "react";
import GameBadge from "./game_badge";

function GamesList({games}) {
    // console.log(games);
    return (
        <div className="games-container">
            {games.map((game, index) => (
                <GameBadge key={`badge_${index}`} game={game}/>
            ))}
        </div>
    )
}

export default GamesList;