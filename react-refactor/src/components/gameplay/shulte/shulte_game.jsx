import React, { useState, useEffect } from "react";
import useStorage from "../../../hooks/useStorage";

function generateShulteBoard(size) {
    const arr = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Для режима с исчезающими цифрами — двумерный массив
    return Array.from({ length: size }, (_, row) =>
        arr.slice(row * size, (row + 1) * size)
    );
}

const MAX_MISTAKES = 3;

const ShulteGame = ({ settings, onMistake, onWin, gameState, disabled, started }) => {
    const { game_settings } = useStorage();
    const hideNumbers = game_settings?.shulte?.shide_scored?.state === true;
    const size = settings.size;

    // Для исчезающих цифр — двумерный массив, иначе — одномерный
    const [board, setBoard] = useState([]);
    const [current, setCurrent] = useState(1);
    const [status, setStatus] = useState(""); // "win" | "lose" | ""

    useEffect(() => {
        setBoard(generateShulteBoard(size));
        setCurrent(1);
        setStatus("");
    }, [size, hideNumbers, started]);

    useEffect(() => {
        if (gameState === "lose") setStatus("lose");
    }, [gameState]);

    // Проверка победы
    useEffect(() => {
        if (hideNumbers) {
            if (board.length && board.flat().every(cell => cell === null)) {
                setStatus("win");
                if (onWin) onWin();
            }
        } else {
            if (current > size * size) {
                setStatus("win");
                if (onWin) onWin();
            }
        }
    }, [board, current, hideNumbers, onWin, size]);

    const handleCellClick = (row, col) => {
        if (disabled || status) return;
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
            if (onMistake) onMistake();
        }
    };

    if (status === "win") {
        return <div className="win-screen">Победа!</div>;
    }
    if (status === "lose") {
        return <div className="lose-screen">Поражение!</div>;
    }

    return (
        <div className="shulte-game">
            <h3>Найдите числа по порядку</h3>
            <div
                className="shulte-board"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${size}, 50px)`,
                    gap: "6px",
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
                                    width: 50,
                                    height: 50,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 600,
                                    fontSize: 20,
                                    cursor: num !== null && num >= current && !disabled ? "pointer" : "default",
                                    background: "#fff",
                                    border: "1.5px solid #888",
                                    borderRadius: 8,
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