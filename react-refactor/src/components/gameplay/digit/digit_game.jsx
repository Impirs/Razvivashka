import React, { useState, useEffect } from "react";
import usei18n from "../../../hooks/usei18n";
import useStorage from "../../../hooks/useStorage";

// Наборы чисел для каждой цели и размера поля
const numberDistribution = {
    6: { board: 7, numbers: { 1:8, 2:8, 3:16, 4:8, 5:8 } },
    7: { board: 7, numbers: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8 } },
    8: {
        board: { small: 7, big: 9 },
        numbers: {
            7: { 1:6, 2:6, 3:6, 4:12, 5:6, 6:6, 7:6 },
            9: { 1:10, 2:10, 3:10, 4:20, 5:10, 6:10, 7:10 }
        }
    },
    9: { board: 9, numbers: { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10, 7:10, 8:10 } },
    10: { board: 9, numbers: { 1:8, 2:8, 3:8, 4:8, 5:16, 6:8, 7:8, 8:8, 9:8 } }
};

const getDistribution = (target, size) => {
    if (target === 8) {
        return numberDistribution[8].numbers[size];
    }
    return numberDistribution[target].numbers;
};

const generateBoard = (target, size) => {
    const numbers = getDistribution(target, size);
    let cells = [];
    for (let num in numbers) {
        for (let i = 0; i < numbers[num]; i++) {
            cells.push(Number(num));
        }
    }
    // Перемешиваем
    cells = cells.sort(() => Math.random() - 0.5);

    // Вставляем пустую клетку в центр
    const board = [];
    let idx = 0;
    const center = Math.floor(size / 2);
    for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
            if (i === center && j === center) {
                row.push(null);
            } else {
                row.push(cells[idx++]);
            }
        }
        board.push(row);
    }
    return board;
};

const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
];

const isNextToEmpty = (board, row, col) => {
    return directions.some(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        return board[newRow]?.[newCol] === null;
    });
};

const DigitGame = ({ settings, onMistake, onWin, gameState, disabled }) => {
    const { game_settings, unlockAchive, addScore } = useStorage();
    // removing and showing score will be in score section
    const { t } = usei18n();

    const target = settings.target;
    const size = settings.size;
    const enableCells = game_settings?.digit?.show_available?.state === true;
    const [board, setBoard] = useState([]);
    const [selected, setSelected] = useState([]);
    const [status, setStatus] = useState(""); // "win" | "lose" | ""

    useEffect(() => {
        setBoard(generateBoard(target, size));
        setSelected([]);
        setStatus("");
    }, [target, size]);

    // Проверка победы
    useEffect(() => {
        if (board.length && board.flat().every(cell => cell === null)) {
            setStatus("win");
            if (onWin) onWin();
        }
    }, [board, onWin]);

    // Обработка поражения
    useEffect(() => {
        if (gameState === "lose") setStatus("lose");
    }, [gameState]);

    // Обработка данных из Storage
    useEffect(() => {
        if (!t) return;


    }, [ t ] )

    const handleCellClick = (row, col) => {
        if (disabled || board[row][col] === null || selected.length >= 2) return;
        if (!isNextToEmpty(board, row, col)) return;

        if (selected.some(sel => sel.row === row && sel.col === col)) {
            setSelected(selected.filter(sel => !(sel.row === row && sel.col === col)));
        } else {
            const newSelected = [...selected, { row, col, value: board[row][col] }];
            setSelected(newSelected);

            if (newSelected.length === 2) {
                // Проверяем сумму
                const sum = newSelected[0].value + newSelected[1].value;
                if (sum === target) {
                    // Убираем выбранные клетки
                    setTimeout(() => {
                        setBoard(prev => {
                            const newBoard = prev.map(rowArr => [...rowArr]);
                            newBoard[newSelected[0].row][newSelected[0].col] = null;
                            newBoard[newSelected[1].row][newSelected[1].col] = null;
                            return newBoard;
                        });
                        setSelected([]);
                    }, 300);
                } else {
                    if (onMistake) onMistake();
                    setTimeout(() => setSelected([]), 300);
                }
            }
        }
    };

    // Победа/поражение экраны
    if (status === "win") {
        return <div className="win-screen">Победа!</div>;
    }
    if (status === "lose") {
        return <div className="lose-screen">Поражение!</div>;
    }

    return (
        <div className="digit-game">
            <h3>Составьте {target} из чисел на поле</h3>
            <div
                className="digit-board"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${size}, 50px)`,
                    gridTemplateRows: `repeat(${size}, 50px)`,
                    gap: "6px",
                }}
            >
                {board.map((rowArr, row) =>
                    rowArr.map((num, col) => {
                        const isEmpty = num === null;
                        const isEnabled = enableCells && !isEmpty && isNextToEmpty(board, row, col);
                        const isSelected = selected.some(sel => sel.row === row && sel.col === col);
                        return (
                            <div
                                key={`${row}-${col}`}
                                className={
                                    "cell" +
                                    (isEmpty ? " empty" : "") +
                                    (isEnabled ? " enable" : "") +
                                    (isSelected ? " selected" : "")
                                }
                                onClick={() => handleCellClick(row, col)}
                                style={{
                                    width: 50,
                                    height: 50,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 600,
                                    fontSize: 20,
                                    cursor: isEnabled && !disabled ? "pointer" : "default",
                                    background: isSelected ? "#e0e0ff" : isEmpty ? "#f5f5f5" : "#fff",
                                    border: "1.5px solid #888",
                                    borderRadius: 8,
                                    userSelect: "none"
                                }}
                            >
                                {!isEmpty ? num : ""}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DigitGame;