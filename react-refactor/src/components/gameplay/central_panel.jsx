import React, { useState, useRef, useEffect } from "react";

import DigitGame from "./digit/digit_game";
import ShulteGame from "./shulte/shulte_game";

import "../../styles/modules/game_shulte.scss";
import "../../styles/modules/game_digit.scss";

const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
};

const MAX_MISTAKES = 3;

const GAME_PHASES = {
    PREGAME: "pregame",
    PLAYING: "playing",
    WIN: "win",
    LOSE: "lose"
};

const WIN_TIMEOUT = 10000;
const LOSE_TIMEOUT = 5000;

const GameMainPanel = ({ gameId, settings, started, onGameEnd }) => {
    const [mistakes, setMistakes] = useState(0);
    const [timer, setTimer] = useState(0);
    const [phase, setPhase] = useState(GAME_PHASES.PREGAME);
    const timerRef = useRef(null);
    const phaseTimeoutRef = useRef(null);

    useEffect(() => {
        setMistakes(0);
        setTimer(0);
        setPhase(started ? GAME_PHASES.PLAYING : GAME_PHASES.PREGAME);
    }, [gameId, settings, started]);

    useEffect(() => {
        if (phase === GAME_PHASES.PLAYING) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [phase]);

    useEffect(() => {
        if (phase === GAME_PHASES.WIN) {
            phaseTimeoutRef.current = setTimeout(() => setPhase(GAME_PHASES.PREGAME), WIN_TIMEOUT);
            // onGameEnd && onGameEnd();
        } else if (phase === GAME_PHASES.LOSE) {
            phaseTimeoutRef.current = setTimeout(() => setPhase(GAME_PHASES.PREGAME), LOSE_TIMEOUT);
            // onGameEnd && onGameEnd();
        } else {
            clearTimeout(phaseTimeoutRef.current);
        }
        return () => clearTimeout(phaseTimeoutRef.current);
    }, [phase]);

    // Сброс started в родителе после завершения игры
    // useEffect(() => {
    //     if (phase === GAME_PHASES.PREGAME && started) {
    //         onGameEnd && onGameEnd();
    //     }
    // }, [phase, started, onGameEnd]);

    const handleMistake = () => {
        setMistakes(m => {
            const newMistakes = m + 1;
            if (newMistakes >= MAX_MISTAKES) {
                setPhase(GAME_PHASES.LOSE);
            }
            return newMistakes;
        });
    };

    const handleWin = () => {
        setPhase(GAME_PHASES.WIN);
    };

    const handleManualStart = () => {
        setMistakes(0);
        setTimer(0);
        setPhase(GAME_PHASES.PLAYING);
    };

    const gameProps = {
        settings,
        onMistake: handleMistake,
        onWin: handleWin,
        disabled: phase !== GAME_PHASES.PLAYING,
        timer
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
    if (phase === GAME_PHASES.PREGAME) {
        gameContent = <div style={{ textAlign: "center", marginTop: "40px" }}>
            <p>Выберите настройки и нажмите "Старт"</p>
        </div>;
    } else if (
        settings &&
        (
            (gameId === "digit" && typeof settings.target === "number" && typeof settings.size === "number") ||
            (gameId === "shulte" && typeof settings.size === "number")
        )
    ) {
        const gameKey = gameId === "digit"
            ? `${gameId}-${settings.target}-${settings.size}`
            : `${gameId}-${settings.size}`;
        switch (gameId) {
            case "digit":
                gameContent = <DigitGame key={gameKey} {...gameProps} phase={phase} />;
                break;
            case "shulte":
                gameContent = <ShulteGame key={gameKey} started={started} {...gameProps} phase={phase} />;
                break;
            default:
                gameContent = <div>Выберите игру</div>;
        }
    }

    return (
        <div className="game-main-panel">
            <div className="game-header-panel">
                <div>{renderMistakes()}</div>
                <div> {/* Центр */} </div>
                <div>
                    <div className="game-timer">{formatTime(timer)}</div>
                </div>
            </div>
            <div className="game-space">
                {gameContent}
                {(phase === GAME_PHASES.WIN || phase === GAME_PHASES.LOSE) && (
                    <button className="game-restart-btn"
                        onClick={handleManualStart}
                    >
                        Играть ещё
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameMainPanel;