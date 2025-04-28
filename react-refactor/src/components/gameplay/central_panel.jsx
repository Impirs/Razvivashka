import React, { useState, useRef, useEffect } from "react";

import DigitGame from "./digit/digit_game";
import ShulteGame from "./shulte/shulte_game";

const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
};

const MAX_MISTAKES = 3;

const GameMainPanel = ({ gameId, settings, started }) => {
    const [mistakes, setMistakes] = useState(0);
    const [timer, setTimer] = useState(0);
    const [gameState, setGameState] = useState("playing");
    const timerRef = useRef(null);

    useEffect(() => {
        if (gameState === "playing" && started) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, started]);

    useEffect(() => {
        setMistakes(0);
        setTimer(0);
        setGameState("playing");
    }, [gameId, settings, started]);

    const handleMistake = () => {
        setMistakes(m => {
            const newMistakes = m + 1;
            console.log(newMistakes);
            if (newMistakes >= MAX_MISTAKES) {
                setGameState("lose");
            }
            return newMistakes;
        });
    };

    const handleWin = () => {
        setGameState("win");
    };

    const gameProps = {
        settings,
        onMistake: handleMistake,
        onWin: handleWin,
        disabled: gameState !== "playing"
    };

    const renderMistakes = () => (
        <div className="mistakes_counter">
            {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                <div
                    key={i}
                    className={`mistake${i < mistakes ? " cross" : ""}`}
                />
            ))}
        </div>
    );

    let gameContent = null;
    if (
        started &&
        settings &&
        (
            (gameId === "digit" && typeof settings.target === "number" && typeof settings.size === "number") ||
            (gameId === "shulte" && typeof settings.size === "number")
        )
    ) {
        const gameKey = gameId === "digit"
            ? `${gameId}-${settings.target}-${settings.size}-${started}`
            : `${gameId}-${settings.size}-${started}`;
        // console.log(gameKey);
        switch (gameId) {
            case "digit":
                gameContent = <DigitGame key={gameKey} {...gameProps} gameState={gameState} />;
                break;
            case "shulte":
                gameContent = <ShulteGame key={gameKey} started={started} {...gameProps} gameState={gameState} />;
                break;
            default:
                gameContent = <div>Выберите игру</div>;
        }
    } else {
        gameContent = <div style={{ textAlign: "center", marginTop: "40px" }}>
            <p>Выберите настройки и нажмите "Старт"</p>
        </div>;
    }

    return (
        <div className="game-main-panel">
            <div className="game-header-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                {renderMistakes()}
                <div className="game-timer" style={{ fontSize: 22, fontWeight: 600 }}>
                    {formatTime(timer)}
                </div>
            </div>
            <div className="game-space">
                {gameContent}
            </div>
        </div>
    );
};

export default GameMainPanel;