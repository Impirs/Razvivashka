import React, { useState, useEffect } from "react";
import { useStorageContext } from "../../../provider_storage";
import { useAchNotif } from "../../../provider_notif";

function generateShulteBoard(size) {
    const arr = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return Array.from({ length: size }, (_, row) =>
        arr.slice(row * size, (row + 1) * size)
    );
}

const ShulteGame = ({ settings, onMistake, onWin, disabled, timer, phase }) => {
    const { game_settings, addScore, unlockAchive } = useStorageContext();
    const { notifyAchievements } = useAchNotif();
    const hideNumbers = game_settings?.shulte?.shide_scored?.state;
    const size = settings.size;

    const [board, setBoard] = useState([]);
    const [current, setCurrent] = useState(1);
    const [scoreAdded, setScoreAdded] = useState(false);

    useEffect(() => {
        setBoard(generateShulteBoard(size));
        setCurrent(1);
        setScoreAdded(false);
    }, [size, hideNumbers, phase]);

    useEffect(() => {
        if (phase === "playing") {
            if (hideNumbers) {
                if (board.length && board.flat().every(cell => cell === null)) {
                    onWin && onWin();
                }
            } else {
                if (current > size * size) {
                    onWin && onWin();
                }
            }
        }
    }, [board, current, hideNumbers, onWin, size, phase]);

    useEffect(() => {
        async function updateRecords() {
            setScoreAdded(true);
            const highId = `${size}x${size}`;
            const today = new Date();
            const date = today.getDate();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            const hours = today.getHours().toString().padStart(2, "0");
            const minutes = today.getMinutes().toString().padStart(2, "0");
            const scoreDate = `${hours}:${minutes} ${date}.${month}.${year}`;

            if (addScore) {
                await addScore("shulte", highId, timer, scoreDate);
            }

            if (unlockAchive) {
                const newAchievements = await unlockAchive("shulte", highId, timer);
                if (newAchievements && newAchievements.length > 0) {
                    notifyAchievements(newAchievements);
                }
            }
        }

        if (phase === "win" && !scoreAdded) {
            updateRecords();
        }
    }, [phase, scoreAdded, addScore, unlockAchive, size, timer, notifyAchievements]);

    const handleCellClick = (row, col) => {
        if (disabled || phase !== "playing") return;
        const value = board[row][col];
        if (value === current) {
            if (hideNumbers) {
                setBoard(prev => {
                    const newBoard = prev.map(r => [...r]);
                    newBoard[row][col] = null;
                    return newBoard;
                });
            }
            setCurrent(c => c + 1);
        } else {
            onMistake && onMistake();
        }
    };

    if (phase === "win") {
        return (
            <div className="win-screen">
                Победа!
            </div>
        );
    }
    if (phase === "lose") {
        return (
            <div className="lose-screen">
                Поражение!
            </div>
        );
    }

    return (
        <div className="shulte-game">
            <h3>Найдите числа по порядку</h3>
            <div
                className="shulte-board"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${size}, 80px)`,
                    gridTemplateRows: `repeat(${size}, 80px)`,
                    gap: "1px",
                }}
            >
                {board.map((rowArr, row) =>
                    rowArr.map((num, col) => {
                        const isEmpty = num === null;
                        const isFound = !isEmpty && num < current && !hideNumbers;
                        return (
                            <div
                                key={`${row}-${col}`}
                                className={
                                    (isEmpty ? "empty " : "") +
                                    (isFound ? "found " : "")
                                }
                                onClick={() => num !== null && handleCellClick(row, col)}
                                style={{
                                    cursor: num !== null && num >= current && !disabled ? "pointer" : "default",
                                    userSelect: "none"
                                }}
                            >
                                {num !== null ? num : ""}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ShulteGame;