import React, { useState, useEffect } from "react";

const ShulteMenu = ({ onStart, setSettings, settings }) => {
    const [size, setSize] = useState(4);
    const availableSizes = [4, 5];

    useEffect(() => {
        setSettings({ size });
    }, [size, setSettings]);

    return (
        <div className="shulte-setup">
            <h2>Настройки Шульте</h2>
            <div className="shulte-setup-setting">
                Размер поля:
                <div className={`shulte-size-options shulte-size-options--${availableSizes.length}`}>
                    {availableSizes.map(val => (
                        <div
                            key={val}
                            className={`shulte-size-option${size === val ? " active" : ""}`}
                            style={{
                                width: availableSizes.length === 1 ? "100%" : "50%",
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
            </div>
            <button onClick={() => onStart({ size: Number(size) })}>Старт</button>
        </div>
    );
};

export default ShulteMenu;