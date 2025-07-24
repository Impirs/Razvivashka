import React, { useRef, useEffect, useState } from "react";

const DeletePopup = ({ onFinish, onCancel, style }) => {
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const [holding, setHolding] = useState(false);

    const handleHoldStart = () => {
        setHolding(true);
        let prog = 0;
        intervalRef.current = setInterval(() => {
            prog += 10;
            setProgress(prog / 750);
        }, 10);
        timeoutRef.current = setTimeout(() => {
            setHolding(false);
            setProgress(1);
            onFinish();
        }, 750);
    };

    const handleHoldEnd = () => {
        setHolding(false);
        setProgress(0);
        clearInterval(intervalRef.current);
        clearTimeout(timeoutRef.current);
        onCancel();
    };

    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <button
            className="delete-btn"
            style={style}
            onMouseDown={handleHoldStart}
            onTouchStart={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchEnd={handleHoldEnd}
            type="button"
        >
            <span>Удалить</span>
            <span
                className="progress-bar"
                style={{
                    width: `${progress * 100}%`,
                    transition: holding ? "width 0.05s linear" : "none"
                }}
            />
        </button>
    );
};

export default DeletePopup;