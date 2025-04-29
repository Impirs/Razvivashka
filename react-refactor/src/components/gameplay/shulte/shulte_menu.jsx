import React, { useState, useEffect } from "react";

const ShulteMenu = ({ onStart, setSettings, settings }) => {
    const [size, setSize] = useState(4);

    useEffect(() => {
        setSettings({ size });
    }, [size, setSettings]);

    return (
        <div className="shulte-setup">
            <h2>Настройки Шульте</h2>
            <div>
                {[4, 5].map(val => (
                    <div
                        key={val}
                        className={`shulte-size-option${size === val ? " active" : ""}`}
                        style={{
                            background: size === val ? "#e0e0ff" : "#fff",
                            cursor: "pointer",
                            userSelect: "none"
                        }}
                        onClick={() => setSize(val)}
                    >
                        {val} x {val}
                    </div>
                ))}
            </div>
            <button onClick={() => onStart({ size: Number(size) })}>Старт</button>
        </div>
    );
};

export default ShulteMenu;