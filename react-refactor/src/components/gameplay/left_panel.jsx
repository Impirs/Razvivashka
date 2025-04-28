import React from "react";

import DigitMenu from "./digit/digit_menu";
import ShulteMenu from "./shulte/shulte_menu";

const GameLeftPanel = ({ gameId, onStart }) => {
    switch (gameId) {
        case "digit":
            return  (<div className="game-menu">
                        <div className="game-icon" id={`${gameId}_icon`}/>
                        <DigitMenu 
                            onStart={onStart} 
                        />
                    </div>);
        case "shulte":
            return  (<div className="game-menu">
                        <div className="game-icon" id={`${gameId}_icon`}/>
                        <ShulteMenu 
                            onStart={onStart} 
                        />
                    </div>)
        default:
            return <div>Выберите игру</div>;
    }
};

export default GameLeftPanel;