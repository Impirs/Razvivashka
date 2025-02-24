document.addEventListener("DOMContentLoaded", () => {
    const boardSize = 9;
    const numbers = { 1: 10, 2: 10, 3: 10, 4: 20, 5: 10, 6: 10, 7: 10 };
    let board = [];
    let selectedCells = [];
    let mistakes = 0;
    let time = 0;
    let timer;

    const gameBoard = document.getElementById("game_board");
    const mistakesCounter = document.getElementById("mistakes");
    const timerDisplay = document.getElementById("timer");
    const reloadButton = document.getElementById("reload_btn");
    const startButton = document.getElementById("start_btn")

    function startGame() {
        board = generateBoard();
        renderBoard();
        timer = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
        }, 1000);
    }

    function generateBoard() {
        let cells = [];

        // Заполняем массив числами
        for (let num in numbers) {
            for (let i = 0; i < numbers[num]; i++) {
                cells.push(Number(num));
            }
        }

        // Перемешиваем только числа
        cells.sort(() => Math.random() - 0.5);

        // Вставляем пустую клетку в центр (позиция [4,4])
        let newBoard = [];
        let index = 0;
        for (let i = 0; i < boardSize; i++) {
            let row = [];
            for (let j = 0; j < boardSize; j++) {
                if (i === 4 && j === 4) {
                    row.push(null); // Центр пустой
                } else {
                    row.push(cells[index++]);
                }
            }
            newBoard.push(row);
        }
        return newBoard;
    }

    function renderBoard() {
        gameBoard.innerHTML = "";
        board.forEach((row, rowIndex) => {
            row.forEach((num, colIndex) => {
                let cell = document.createElement("div");
                cell.classList.add("cell");
                if (num === null) {
                    cell.classList.add("empty");
                } else {
                    cell.textContent = num;
                    cell.dataset.value = num;
                    cell.dataset.row = rowIndex;
                    cell.dataset.col = colIndex;
                    cell.addEventListener("click", handleCellClick);
                }
                gameBoard.appendChild(cell);
            });
        });
    }

    function handleCellClick(event) {
        let cell = event.target;
        if (cell.classList.contains("empty") || selectedCells.length >= 2) return;

        let row = Number(cell.dataset.row);
        let col = Number(cell.dataset.col);

        if (!isNextToEmpty(row, col)) return;

        if (cell.classList.contains("selected")) {
            cell.classList.remove("selected")
            selectedCells = [];
        } else {
            cell.classList.add("selected");
            selectedCells.push({ row, col, value: Number(cell.dataset.value), element: cell });
            if (selectedCells.length === 2) checkPair();
        }
    }

    function isNextToEmpty(row, col) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],  // Вверх, вниз, влево, вправо
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Диагонали
        ];

        return directions.some(([dx, dy]) => {
            let newRow = row + dx;
            let newCol = col + dy;
            return board[newRow]?.[newCol] === null;
        });
    }

    function checkPair() {
        let [first, second] = selectedCells;

        if (first.value + second.value === 8) {
            first.element.classList.add("correct");
            second.element.classList.add("correct");

            setTimeout(() => {
                board[first.row][first.col] = null;
                board[second.row][second.col] = null;
                renderBoard();
                checkWin();
            }, 500);
        } else {
            mistakes++;
            mistakesCounter.textContent = mistakes;
            first.element.classList.add("wrong");
            second.element.classList.add("wrong");

            if (mistakes >= 3) {
                endGame(false);
            }

            setTimeout(() => {
                first.element.classList.remove("wrong", "selected");
                second.element.classList.remove("wrong", "selected");
            }, 500);
        }

        selectedCells = [];
    }

    function checkWin() {
        if (board.flat().every(cell => cell === null)) {
            endGame(true);
        }
    }

    function endGame(win) {
        clearInterval(timer);
        setTimeout(() => {
            alert(win ? "Победа!\n Затраченное время: " + time + " сек." : 
                "Игра окончена.\n Вы допустили 3 ошибки.");
            //location.reload();
        }, 500);
    }

    startGame();
});
