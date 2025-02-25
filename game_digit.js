document.addEventListener("DOMContentLoaded", () => {
    let numberDistribution = {
        6: { 
            board: 7, 
            numbers: { 1:8, 2:8, 3:16, 4:8, 5:8 } 
        },
        7: { 
            board: 7, 
            numbers: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8 } 
        },
        8: {
            board: { small: 7, big: 9 },
            numbers: {
                7: { 1:6, 2:6, 3:6, 4:12, 5:6, 6:6, 7:6 },
                9: { 1:10, 2:10, 3:10, 4:20, 5:10, 6:10, 7:10 }
            }
        },
        9: { 
            board: 9, 
            numbers: { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10, 7:10, 8:10 } 
        },
        10: { 
            board: 9, 
            numbers: { 1:8, 2:8, 3:8, 4:8, 5:16, 6:8, 7:8, 8:8, 9:8 } 
        }
    };
    let gameState = false; 
    let board = [];
    let selectedCells = [];
    let mistakes = 0;
    let time = 0;
    let timer;

    const boardSetup = document.getElementById("board_setup");
    let boardSize = 9;
    const digitSetup = document.getElementById("digit_setup");
    let sumTarget = 8;
    const startButton = document.getElementById("start_btn");
    const gameBoard = document.getElementById("game_board");
    const mistakesCounter = document.getElementById("mistakes");
    const timerDisplay = document.getElementById("timer");
    const reloadButton = document.getElementById("reload_btn");
    const infoButton = document.getElementById("info_btn");
    
    function setupGameMenu() {
        const digitButtons = document.querySelectorAll("#digit_setup span");
        const boardButtons = document.querySelectorAll("#board_setup span");
    
        function clearSelected(elements) {
            elements.forEach(el => el.classList.remove("selected"));
        }
    
        function handleDigitSelection(event) {
            const target = event.target;
            if (gameState || !target.dataset.value) return;
    
            const selectedValue = parseInt(target.dataset.value, 10);
            if (isNaN(selectedValue)) return;
    
            console.log("Выбрана сумма:", selectedValue);
    
            clearSelected(digitButtons);
            target.classList.add("selected");
    
            sumTarget = selectedValue;
            updateBoardOptions();
        }
    
        function updateBoardOptions() {
            boardButtons.forEach(button => {
                button.classList.remove("selected", "available");
        
                const boardValue = parseInt(button.dataset.value, 10);
                if (isNaN(boardValue)) return;
        
                if (isBoardSizeAllowed(sumTarget, boardValue)) {
                    button.classList.add("available");
                }
            });
            
            if (sumTarget === 6 || sumTarget === 7 || sumTarget === 8) {
                boardSize = 7;
            } else {
                boardSize = 9;
            }

            let boardElement = document.querySelector(`#board_setup [data-value="${boardSize}"]`);
            if (boardElement) boardElement.classList.add("selected");
        
            console.log("Размер доски:", boardSize);
        }
    
        function isBoardSizeAllowed(sum, size) {
            if (sum === 6 || sum === 7) return size === 7;
            if (sum === 9 || sum === 10) return size === 9;
            return size === 7 || size === 9;
        }
    
        function handleBoardSelection(event) {
            const target = event.target;
            if (gameState || !target.classList.contains("available") || !target.dataset.value) return;
    
            const boardValue = parseInt(target.dataset.value, 10);
            if (isNaN(boardValue)) return;
    
            console.log("Выбран размер доски:", boardValue); // Проверка
    
            clearSelected(boardButtons);
            target.classList.add("selected");
    
            boardSize = boardValue;
        }
    
        digitButtons.forEach(button => button.addEventListener("click", handleDigitSelection));
        boardButtons.forEach(button => button.addEventListener("click", handleBoardSelection));

        startButton.addEventListener("click", startGame)
    }

    function startGame() {
        if (!sumTarget || !boardSize) return;

        gameState = true;
        digitSetup.classList.add("disabled");
        boardSetup.classList.add("disabled");
        startButton.classList.add("disabled");
        
        board = generateBoard();
        renderBoard();
        updateGridSize();
        mistakes = 0;
        time = 0;
        timer = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
        }, 1000);
    }

    function generateBoard() {
        let numbers = numberDistribution[sumTarget].numbers;
        if (sumTarget === 8) numbers = numbers[boardSize];

        let cells = [];

        for (let num in numbers) {
            for (let i = 0; i < numbers[num]; i++) {
                cells.push(Number(num));
            }
        }

        cells.sort(() => Math.random() - 0.5);

        let newBoard = [];
        let center = Math.floor(boardSize / 2);
        let index = 0;

         for (let i = 0; i < boardSize; i++) {
            let row = [];
            for (let j = 0; j < boardSize; j++) {
                if (i === center && j === center) {
                    row.push(null);
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
                    if (isNextToEmpty(rowIndex, colIndex)) cell.classList.add("enable")
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

    function updateGridSize() {
        const boardElement = document.getElementById("game_board");
        boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;
        boardElement.style.gridTemplateRows = `repeat(${boardSize}, 50px)`;
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

        if (first.value + second.value === sumTarget) {
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
        gameState = false;

        digitSetup.classList.remove("disabled");
        boardSetup.classList.remove("disabled");
        startButton.classList.remove("disabled");
    }

    setupGameMenu();
});
