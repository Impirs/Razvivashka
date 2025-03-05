import { 
    addHighScore, unlockAchievement, getHighScores,
    getVolume ,parseAchievementId, generateAchievementId 
} from './data_manager.js';

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
    let notificationQueue = [];
    let isDisplayingNotification = false;
    let gameState = false
    let infoState = false
    let pause = false
    let board = [];
    let selectedCells = [];
    let mistakes = 0;
    let time = 0;
    let timer;

    const savedVolume = getVolume();
    console.log(savedVolume);
    
    const boardSetup = document.getElementById("board_setup");
    let boardSize = 9;
    const digitSetup = document.getElementById("digit_setup");
    let sumTarget = 8;
    const gameBoard = document.getElementById("game_board");
    const WINmodul = document.getElementById("winModul");
    const LOSEmodul = document.getElementById("loseModul");
    const timerDisplay = document.getElementById("timer");
    const mistakesCounter = document.getElementById("mistakes");

    const achieveSound = document.getElementById("achieve_sound");
    const defeatSound = document.getElementById("defeat_sound");
    const errorSound = document.getElementById("error_sound");
    const winSound = document.getElementById("win_sound");

    const startButton = document.getElementById("start_btn");
    const infoButton = document.getElementById("info_btn");
    const reloadButton = document.getElementById("reload_btn");
    const pauseButton = document.getElementById("pause_btn");
    document.getElementById("close_info").addEventListener("click", closeInfo);
    
    

    function setupSounds() {
        achieveSound.volume = savedVolume.notification;
        errorSound.volume = savedVolume.notification;
        defeatSound.volume = savedVolume.game_effects;
        winSound.volume = savedVolume.game_effects;
    }

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
    
            // console.log("Выбрана сумма:", selectedValue);
    
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
        
            // console.log("Размер доски:", boardSize);
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
    
            // console.log("Выбран размер доски:", boardValue);
    
            clearSelected(boardButtons);
            target.classList.add("selected");
    
            boardSize = boardValue;
        }
    
        digitButtons.forEach(button => button.addEventListener("click", handleDigitSelection));
        boardButtons.forEach(button => button.addEventListener("click", handleBoardSelection));

        startButton.addEventListener("click", startGame)
        reloadButton.addEventListener("click", handleReloadClick)
        infoButton.addEventListener("click", handleInfoClick)
        pauseButton.addEventListener("click", handlePauseClick)
    }

    function setupScoreSection() {
        const highScores = getHighScores("digit");
        if (!highScores || highScores.length === 0) {
            console.warn("No high scores available.");
            return;
        }
        const scoreTable = document.getElementById("score_table");
        scoreTable.innerHTML = ""; 
    
        let bestScoreEntry = getBestScore();
        let bestDigit = bestScoreEntry.digit;
        let bestSize = bestScoreEntry.size;
        // console.log("Лучший результат:", bestDigit, bestSize);
        highScores.sort((a, b) => {
            let parsedA = parseAchievementId(a.id);
            let parsedB = parseAchievementId(b.id);
            if (parsedA.digit === 8 && parsedB.digit === 8) {
                return parsedA.size - parsedB.size;
            }
            return parsedA.digit - parsedB.digit;
        });
    
        let uniqueEntries = highScores.map(hs => {
            let parsed = parseAchievementId(hs.id);
            return { ...parsed, highScore: hs.score };
        });
        let currentIndex = uniqueEntries.findIndex(entry => entry.digit === bestDigit && entry.size === bestSize);
        
        // console.log("Default index:", currentIndex);
        if (currentIndex === -1) currentIndex = 0;
    
        let container = document.createElement("div");
        container.classList.add("highscore_container");
        let title = document.createElement("h2");
        let span1 = document.createElement("span");
        let span2 = document.createElement("span");
        let bestLabel = document.createElement("span");
        let nav_section = document.createElement("div");
        let btnLeft = document.createElement("button");
        let leftBtnIcon = document.createElement("div");
        let btnRight = document.createElement("button");
        let rightBtnIcon = document.createElement("div");
        
        span1.classList.add("digit_label");
        bestLabel.classList.add("best_label");
        bestLabel.textContent = "Лучший результат";
        btnLeft.classList.add("score_ctrl_btn");
        leftBtnIcon.classList.add("score_ctrl_icon");
        leftBtnIcon.id = "nav_left";
        btnRight.classList.add("score_ctrl_btn");
        rightBtnIcon.classList.add("score_ctrl_icon");
        rightBtnIcon.id = "nav_right";
    
        function updateDisplay(index) {
            if (index < 0 || index >= uniqueEntries.length) return;
    
            currentIndex = index;
            let entry = uniqueEntries[currentIndex];
    
            title.textContent = entry.highScore;
            span1.textContent = `#${entry.digit}`;
            span2.textContent = (entry.size === 7) ? "Стандарт" : "Большая";
            
            bestLabel.style.visibility = (entry.digit === bestDigit && entry.size === bestSize) ? "visible" : "hidden";
        }
    
        updateDisplay(currentIndex);
        btnLeft.addEventListener("click", () => {
            if (currentIndex > 0) {
                updateDisplay(currentIndex - 1);
            }
        });
        btnRight.addEventListener("click", () => {
            if (currentIndex < uniqueEntries.length - 1) {
                updateDisplay(currentIndex + 1);
            }
        });
        nav_section.classList.add("nav_section");
        btnLeft.appendChild(leftBtnIcon);
        nav_section.appendChild(btnLeft);
        nav_section.appendChild(span2);
        btnRight.appendChild(rightBtnIcon);
        nav_section.appendChild(btnRight);

        container.appendChild(title);
        container.appendChild(bestLabel);
        container.appendChild(span1);
        container.appendChild(nav_section);
        scoreTable.appendChild(container);
    }

    function getBestScore() {
        const highScores = getHighScores("digit");
        if (!highScores || highScores.length === 0) {
            console.warn("No high scores available.");
            return { digit: null, size: null };
        }
        // console.log("High scores:", highScores);
        let bestScore = Infinity;
        let bestDigit = null;
        let bestSize = null;
    
        highScores.forEach(hs => {
            const parsed = parseAchievementId(hs.id);
            // console.log("Parsed:", parsed);
            // console.log("Score:", hs.score);
            if (hs.score < bestScore) {
                bestScore = hs.score;
                bestDigit = parsed.digit;
                bestSize = parsed.size;
            }
        });
        console.log("Лучший результат:", bestScore, "секунд");
        return { digit: bestDigit, size: bestSize };
    }

    function startGame() {
        if (!sumTarget || !boardSize) return;

        gameState = true;
        digitSetup.classList.add("disabled");
        boardSetup.classList.add("disabled");
        startButton.classList.add("disabled");
        WINmodul.style.display = "none";
        LOSEmodul.style.display = "none";

        board = generateBoard();
        renderBoard();
        updateGridSize();
        clearInterval(timer);
        time = 0;
        timerDisplay.textContent = time;
        mistakes = 0;
        updateMistakes(mistakes);
        timer = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
        }, 1000);
    }

    function handleReloadClick() {
        if (!gameState) return;
        if (pause) handlePauseClick(); clearInterval(timer);
        startGame();
    }

    function handlePauseClick() {
        if (!gameState) return;
    
        pause = !pause; 
        const p_icon = document.getElementById("pause");
        const c_icon = document.getElementById("continue")
        if (pause) {
            clearInterval(timer);
            p_icon.style.display = "none";
            c_icon.style.display = "flex";
            document.querySelector(".game_board").classList.add("paused");
        } else {
            p_icon.style.display = "flex";
            c_icon.style.display = "none";
            timer = setInterval(() => {
                time++;
                timerDisplay.textContent = time;
            }, 1000);
        }
    }

    function handleInfoClick() {
        if (!infoState) {
            infoState = true;
            document.getElementById("infoModul").style.display = "flex";
        } else {
            closeInfo();
        }
    }

    function closeInfo() {
        infoState = false;
        document.getElementById("infoModul").style.display = "none";
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
        if (gameBoard.classList.contains("paused") || pause) return;

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
            [-1, 0], [1, 0], [0, -1], [0, 1], 
            [-1, -1], [-1, 1], [1, -1], [1, 1]
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
            }, 300);
        } else {
            errorSound.play();
            mistakes++;
            updateMistakes(mistakes);
            first.element.classList.add("wrong");
            second.element.classList.add("wrong");

            if (mistakes >= 3) {
                endGame(false);
            }

            setTimeout(() => {
                first.element.classList.remove("wrong", "selected");
                second.element.classList.remove("wrong", "selected");
            }, 300);
        }
        selectedCells = [];
    }

    function updateMistakes(counter) {
        const mistakes = document.querySelectorAll(".mistake");
    
        mistakes.forEach(mistake => mistake.classList.remove("cross"));
    
        for (let i = 0; i < counter && i < mistakes.length; i++) {
            mistakes[i].classList.add("cross");
        }
    }

    function checkAchievement(game, id, score) {
        let unlockedAchievements = unlockAchievement(game, id, score);
        if (unlockedAchievements.length > 0) {
            notificationQueue.push(...unlockedAchievements);
            if (!isDisplayingNotification) {
                displayNextNotification();
            }
        }
    }
    
    function displayNextNotification() {
        if (notificationQueue.length === 0) {
            isDisplayingNotification = false;
            return;
        }
        
        isDisplayingNotification = true;
        let achievement = notificationQueue.shift();
        
        let notification = document.createElement("div");
        let icon = document.createElement("div");
        icon.classList.add("achievement_icon");
        icon.classList.add(`rank_${achievement.rank}`);
        icon.id = "trophy";
        let avards_section = document.createElement("div");
        avards_section.classList.add("avards_section");
        let title = document.createElement("h3");
        title.textContent = achievement.title;
        let description = document.createElement("p");
        const parsed = parseAchievementId(achievement.id);
        if (mistakes === 0){
            description.textContent = `Закончить игру с размером игровой доски ${parsed.size} без ошибок.`;
        }
        else description.textContent = `Закончить игру в режиме ${achievement.id} за ${achievement.ranks[achievement.rank - 1]} секунд или быстрее.`;

        notification.classList.add("achievement_notification");
        console.log(`Достижение разблокировано: ${achievement.title} (Ранг ${achievement.rank})`);
        
        const container = document.querySelector(".game_container") || document.body;
        notification.appendChild(icon);
        avards_section.appendChild(title);
        avards_section.appendChild(description);
        notification.appendChild(avards_section);
        container.appendChild(notification);

        achieveSound.play();
        
        setTimeout(() => {
            notification.remove();
            displayNextNotification();
        }, 3500);
    }

    function checkWin() {
        if (board.flat().every(cell => cell === null)) {
            endGame(true);
        }
    }

    function endGame(win) {
        clearInterval(timer);
        if (win) {
            let digit_target;
            const winTime = document.getElementById("win_time");
            WINmodul.style.display = "flex";
            winTime.textContent = time;
            winSound.play();

            if (mistakes === 0) {
                digit_target = 100;
            } else {
                digit_target = sumTarget;
            }
            const addach = { size: boardSize, digit: digit_target };
            const achId = generateAchievementId(addach);
            const addhigh = { size: boardSize, digit: sumTarget };
            const highId = generateAchievementId(addhigh);
            addHighScore("digit", highId, time);
            setupScoreSection();

            setTimeout(() => {
                checkAchievement("digit", achId, time);
                checkAchievement("digit", highId, time);
            }, 3000); 
        } else {
            defeatSound.play();
            LOSEmodul.style.display = "flex";
        }
        gameState = false;

        digitSetup.classList.remove("disabled");
        boardSetup.classList.remove("disabled");
        startButton.classList.remove("disabled");
    }

    window.checkAchievement = checkAchievement;
    setupSounds();
    setupGameMenu();
    setupScoreSection();
});
