import React, { useState, useEffect } from "react";
import { useGameController } from "../../contexts/gameController";
import { useNotification } from "../../contexts/notification";
import { useSettings } from "../../contexts/pref";
import { ShulteSettings, ShulteBoard } from "./types/game_shulte";

function generateShulteBoard(size: number): ShulteBoard {
    const arr = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return Array.from({ length: size }, (_, row) =>
        arr.slice(row * size, (row + 1) * size).map(value => ({ value, isFound: false }))
    );
}

function ShulteGame({ settings }: { settings: ShulteSettings }) {
    const { endGame } = useGameController();
    const { addNotification } = useNotification();
    const { get } = useSettings();

    const [board, setBoard] = useState<ShulteBoard>([]);
    const [current, setCurrent] = useState(1);
    const [phase, setPhase] = useState<"playing" | "win" | "lose">("playing");

    useEffect(() => {
        setBoard(generateShulteBoard(settings.size));
        setCurrent(1);
        setPhase("playing");
    }, [settings.size]);

    const handleCellClick = (row: number, col: number) => {
        if (phase !== "playing") return;

        const cell = board[row][col];
        if (cell.value === current) {
            setBoard(prev => {
                const newBoard = prev.map(r => r.map(c => ({ ...c })));
                newBoard[row][col].isFound = true;
                return newBoard;
            });
            setCurrent(c => c + 1);

            if (current === settings.size * settings.size) {
                setPhase("win");
                const score = 100; // TODO: Replace with actual timer logic
                endGame('win', score);
                addNotification({
                    title: "Victory!",
                    message: "You won the Shulte game!",
                    type: "achievement",
                    link: "/achievements"
                });
            }
        } else {
            addNotification({
                title: "Mistake!",
                message: "You clicked the wrong cell.",
                type: "warning",
                link: ""
            });
        }
    };

    return (
        <div className="shulte-game">
            {phase === "win" ? (
                <div>Congratulations! You won!</div>
            ) : (
                <div
                    className="shulte-board"
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${settings.size}, 1fr)`
                    }}
                >
                    {board.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                style={{
                                    background: cell.isFound ? "lightgreen" : "white",
                                    border: "1px solid black",
                                    cursor: "pointer",
                                    userSelect: "none"
                                }}
                            >
                                {cell.value}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ShulteGame;
