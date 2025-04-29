import React from "react";

import DigitMenu from "./digit/digit_menu";
import ShulteMenu from "./shulte/shulte_menu";

import "../../styles/modules/game_shulte.scss";
import "../../styles/modules/game_digit.scss";

const GameLeftPanel = ({ gameId, onStart, setSettings, settings}) => {
    switch (gameId) {
        case "digit":
            return  (<div className="game-menu">
                        <div className="game-icon" id={`${gameId}_icon`}/>
                        <DigitMenu 
                            onStart={onStart} 
                            setSettings={setSettings} 
                            settings={settings}
                        />
                    </div>);
        case "shulte":
            return  (<div className="game-menu">
                        <div className="game-icon" id={`${gameId}_icon`}/>
                        <ShulteMenu 
                            onStart={onStart}
                            setSettings={setSettings} 
                            settings={settings}
                        />
                    </div>)
        default:
            return <div>Выберите игру</div>;
    }
};

export default GameLeftPanel;