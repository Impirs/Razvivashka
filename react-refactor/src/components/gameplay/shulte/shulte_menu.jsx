import React, { useState } from "react";

const ShulteMenu = ({ onStart }) => {
    const [size, setSize] = useState(4);

    return (
        <div className="shulte-setup">
            <h2>Настройки Шульте</h2>
            <div style={{ display: "flex", gap: "12px", margin: "12px 0" }}>
                {[4, 5].map(val => (
                    <div
                        key={val}
                        className={`shulte-size-option${size === val ? " active" : ""}`}
                        style={{
                            padding: "8px 18px",
                            borderRadius: "8px",
                            border: "1.5px solid #888",
                            background: size === val ? "#e0e0ff" : "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
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