import React from "react";

function Slider({ value, onChange }) {
    const percentValue = Math.round(value * 100);

    const handleInputChange = (e) => {
        const newPercent = parseInt(e.target.value, 10);
        const newValue = newPercent / 100;
        onChange(newValue);
    };

    return (
        <div className="slider-container">
            <input
                type="range"
                min="0"
                max="100"
                value={percentValue}
                onChange={handleInputChange}
                className="slider"
            />
            <span>{percentValue}%</span>    
        </div>
    );
}

export default Slider;