import { addHighScore, getHighScores, getVolume,  
    parseAchievementId, generateAchievementId, getName
} from '../../data_manager.js';

import { checkAchievement } from '../achievements.js';

document.addEventListener("DOMContentLoaded", () => {     
    let gameState = false;
    let infoState = false;
    let pause = false;
    let board = [];
    let selectedCells = [];
    let mistakes = 0;
    let time = 0;
    let timer;
    let currentNumber = 1;

    const savedVolume = getVolume();
    console.log(savedVolume);
    
    const boardSetup = document.getElementById("board_setup");
    let boardSize = 4;
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
        const boardButtons = document.querySelectorAll("#board_setup span");
    
        function clearSelected(elements) {
            elements.forEach(el => el.classList.remove("selected"));
        }
    
        function handleBoardSelection(event) {
            const target = event.target;
            if (gameState || !target.dataset.value) return;
    
            const selectedValue = parseInt(target.dataset.value, 10);
            if (isNaN(selectedValue)) return;
    
            clearSelected(boardButtons);
            target.classList.add("selected");
    
            boardSize = selectedValue;
            setupScoreSection();
        }
    
        boardButtons.forEach(button => button.addEventListener("click", handleBoardSelection));

        startButton.addEventListener("click", startGame);
        reloadButton.addEventListener("click", handleReloadClick);
        infoButton.addEventListener("click", handleInfoClick);
        pauseButton.addEventListener("click", handlePauseClick);
    }

    function setupScoreSection(newScore = null) {
        const scoreTable = document.getElementById("score_table");
        const highScores = getHighScores("shulte");

        scoreTable.innerHTML = '';
        
        let targetId = generateAchievementId({ size: boardSize, digit: boardSize });
        let scoreArray = highScores[targetId] || [];

        const scrollContainer = document.createElement("div");
        scrollContainer.classList.add("scroll-container");
        const theScroll = document.createElement("div");
        theScroll.className = "the-scroll";

        if (scoreArray.length === 0) {
            const warnMsg = document.createElement("span");
            warnMsg.className = "warn-msg";
            warnMsg.innerHTML = "Рекордов не найдено"; 
            theScroll.appendChild(warnMsg);
        } else {
            for (let record of scoreArray) {
                const recordContainer = document.createElement("div");
                recordContainer.classList.add("record-container");

                if (newScore && record.score === newScore.score && record.date === newScore.date) {
                    recordContainer.classList.add("new-score");
                }

                const infoContainer = document.createElement("div");
                infoContainer.className = "score-info-container";
                const nameLabel = document.createElement("h3");
                nameLabel.innerHTML = getName();
                const dateSpan = document.createElement("span");
                dateSpan.innerHTML = record.date === "unknown" ? "В прошлых версиях" : record.date;
                const scoreContainer = document.createElement("div");
                scoreContainer.className = "score-container-score";
                scoreContainer.innerHTML = record.score;

                infoContainer.appendChild(nameLabel);
                infoContainer.appendChild(dateSpan);

                recordContainer.appendChild(infoContainer);
                recordContainer.appendChild(scoreContainer);

                theScroll.appendChild(recordContainer);
            }
        }

        scrollContainer.appendChild(theScroll);
        scoreTable.appendChild(scrollContainer);
    }

    function startGame() {
        if (!boardSize) return;

        gameState = true;
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
        currentNumber = 1;
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
        let cells = [];
        for (let i = 1; i <= boardSize * boardSize; i++) {
            cells.push(i);
        }

        cells.sort(() => Math.random() - 0.5);

        let newBoard = [];
        let index = 0;

        for (let i = 0; i < boardSize; i++) {
            let row = [];
            for (let j = 0; j < boardSize; j++) {
                row.push(cells[index++]);
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
                cell.textContent = num;
                cell.dataset.value = num;
                cell.dataset.row = rowIndex;
                cell.dataset.col = colIndex;
                cell.addEventListener("click", handleCellClick);
                gameBoard.appendChild(cell);
            });
        });
    }

    function updateGridSize() {
        const boardElement = document.getElementById("game_board");
        boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 80px)`;
        boardElement.style.gridTemplateRows = `repeat(${boardSize}, 80px)`;
    }

    function handleCellClick(event) {
        let cell = event.target;
        if (gameBoard.classList.contains("paused") || pause) return;

        let row = Number(cell.dataset.row);
        let col = Number(cell.dataset.col);
        let value = Number(cell.dataset.value);

        console.log(value);

        if (value === currentNumber) {
            cell.classList.add("correct");
            setTimeout(() => {
                board[row][col] = null;
                renderBoard();
                currentNumber++;
                checkWin();
            }, 300);
        } else if ( !value.isNaN() ) {
            errorSound.play();
            mistakes++;
            updateMistakes(mistakes);

            if (mistakes >= 3) {
                endGame(false);
            }

            cell.classList.add("wrong");
            setTimeout(() => {
                cell.classList.remove("wrong");
            }, 300);
        }
    }

    function updateMistakes(counter) {
        const mistakes = document.querySelectorAll(".mistake");
    
        mistakes.forEach(mistake => mistake.classList.remove("cross"));
    
        for (let i = 0; i < counter && i < mistakes.length; i++) {
            mistakes[i].classList.add("cross");
        }
    }

    function checkWin() {
        if (board.flat().every(cell => cell === null)) {
            endGame(true);
        }
    }

    function endGame(win) {
        clearInterval(timer);
        if (win) {
            const winTime = document.getElementById("win_time");
            WINmodul.style.display = "flex";
            winTime.textContent = time;
            winSound.play();

            const addach = { size: boardSize, digit: boardSize };
            const achId = generateAchievementId(addach);
            const addhigh = { size: boardSize, digit: boardSize };
            const highId = generateAchievementId(addhigh);
    
            const today = new Date();
            const date = today.getDate();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            const hours = today.getHours() < 10 ? `0${today.getHours()}` : today.getHours();
            const minutes = today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes();

            const scoreDate = `${hours}:${minutes} ${date}.${month}.${year}`;
            // console.log(scoreDate);

            addHighScore("shulte", highId, time, scoreDate);

            setupScoreSection({ id: highId, score: time, date: scoreDate });

            setTimeout(() => {
                checkAchievement("shulte", achId, time);
                checkAchievement("shulte", highId, time);
            }, 3000); 
        } else {
            defeatSound.play();
            LOSEmodul.style.display = "flex";
        }
        gameState = false;
    }

    setupSounds();
    setupGameMenu();
    setupScoreSection();
});
