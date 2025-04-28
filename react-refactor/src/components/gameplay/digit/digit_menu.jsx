import React, { useState } from "react";

const DigitMenu = ({ onStart }) => {
    const [target, setTarget] = useState(6);
    const [size, setSize] = useState(7);

    const handleTargetClick = (val) => {
        setTarget(val);
        if (val === 6 || val === 7) setSize(7);
        else if (val === 9 || val === 10) setSize(9);
        else if (val === 8 && size !== 7 && size !== 9) setSize(7); 
    };

    const handleSizeClick = (val) => {
        setSize(val);
    };

    let availableSizes = [];
    if (target === 6 || target === 7) availableSizes = [7];
    else if (target === 9 || target === 10) availableSizes = [9];
    else if (target === 8) availableSizes = [7, 9];

    return (
        <div className="digit-setup">
            <h3>Настройки игры</h3>
            <div className="digit-setup-setting">
                Найти состав числа:
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    {[6, 7, 8, 9, 10].map((val) => (
                        <div
                            key={val}
                            className={`digit-setup-value${target === val ? " active" : ""}`}
                            value={val}
                            style={{
                                padding: "8px 14px",
                                borderRadius: "8px",
                                border: "1.5px solid #888",
                                background: target === val ? "#e0e0ff" : "#fff",
                                cursor: "pointer",
                                fontWeight: 600,
                                userSelect: "none"
                            }}
                            onClick={() => handleTargetClick(val)}
                        >
                            {val}
                        </div>
                    ))}
                </div>
            </div>
            <div className="digit-setup-setting">
                Размер поля:
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    {availableSizes.map((val) => (
                        <div
                            key={val}
                            className={`digit-setup-value${size === val ? " active" : ""}`}
                            value={val}
                            style={{
                                padding: "8px 14px",
                                borderRadius: "8px",
                                border: "1.5px solid #888",
                                background: size === val ? "#e0e0ff" : "#fff",
                                cursor: "pointer",
                                fontWeight: 600,
                                userSelect: "none"
                            }}
                            onClick={() => handleSizeClick(val)}
                        >
                            {val}
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={() => onStart(Number(target), Number(size))}>Старт</button>
        </div>
    );
};

export default DigitMenu;