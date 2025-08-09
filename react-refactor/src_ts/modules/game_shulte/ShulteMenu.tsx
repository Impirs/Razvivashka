import React, { useState } from "react";
import { ShulteSettings } from "./types/game_shulte";

const ShulteMenu: React.FC<{ onStart: (settings: ShulteSettings) => void }> = ({ onStart }) => {
    const [size, setSize] = useState(4);
    const availableSizes = [4, 5];

    return (
        <div className="shulte-menu">
            <h2>Shulte Game Settings</h2>
            <div>
                <label>Board Size:</label>
                <div>
                    {availableSizes.map(val => (
                        <button
                            key={val}
                            onClick={() => setSize(val)}
                            style={{
                                background: size === val ? "blue" : "gray",
                                color: "white",
                                margin: "5px"
                            }}
                        >
                            {val} x {val}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={() => onStart({ size })}>Start Game</button>
        </div>
    );
};

export default ShulteMenu;
