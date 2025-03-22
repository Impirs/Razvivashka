import { 
    addHighScore, unlockAchievement, getHighScores,
    getVolume, parseAchievementId, generateAchievementId 
} from '../../data_manager.js';

document.addEventListener("DOMContentLoaded", () => {
    const syllableGame = document.querySelector('.syllable-game');

    const basicVowels = ['А', 'О', 'У', 'И', 'Ы', 'Е'];
    const basicConsonants = ['М', 'П', 'Б', 'Д', 'Г', 'Т', 'Р', 'В', 'К', 'З', 'Н', 'С'];
    const advancedVowels = ['Ю', 'Я', 'Ё', 'Э'];
    const advancedConsonants = ['Щ', 'Ч', 'Ц', 'Ш', 'Л', 'Х', 'Ж', 'Ф'];

    let gameState = false;
    let syllNumber = 1;
    let letterArray = [];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function setupSyllableGame() {
        const syllButtons = document.querySelectorAll("#select_slog span");
        const vowsButtons = document.querySelectorAll("#select_vow span");
        const consButtons = document.querySelectorAll("#select_cons span");
        const startBtn = document.querySelector("#start_btn");
        const finishBtn = document.querySelector("#finish_btn");

        function clearSelected(elements) {
            elements.forEach(el => el.classList.remove("selected"));
        }

        function handleDataSelection(event) {
            const target = event.target;
            if (gameState || !target.dataset.value) return;
    
            const selectedValue = parseInt(target.dataset.value, 10);
            if (isNaN(selectedValue)) return;
    
            const parentDiv = target.closest('div');
            const buttons = parentDiv.querySelectorAll('span');
            clearSelected(buttons);
            target.classList.add("selected");
    
            if (parentDiv.id === "select_slog") {
                syllNumber = selectedValue;
            }
        }

        function updateBoardOptions() {
            syllableGame.innerHTML = '';

            for (let i = 0; i < syllNumber; i++) {
                const syllableDiv = document.createElement('div');
                syllableDiv.classList.add('syllable-container');
                if (i === 0) syllableDiv.classList.add('active');

                const consonantContainer = document.createElement('div');
                consonantContainer.classList.add('letter-container');

                const consonantSpan = document.createElement('span');
                consonantSpan.classList.add('letter');

                const consonantCtrlBtns = document.createElement('div');
                consonantCtrlBtns.classList.add('letter-ctrl-btns');

                const btn1 = document.createElement('button');
                const btn1Icon = document.createElement('div');
                btn1.classList.add("ltr-ctrl-btn");
                btn1Icon.classList.add("ltr-ctrl-btn-icon");
                btn1Icon.id = "key_left";
                btn1.appendChild(btn1Icon);

                const btn2 = document.createElement('button');
                const btn2Icon = document.createElement('div');
                btn2.classList.add("ltr-ctrl-btn");
                btn2Icon.classList.add("ltr-ctrl-btn-icon");
                btn2Icon.id = "key_right";
                btn2.appendChild(btn2Icon);

                consonantCtrlBtns.appendChild(btn1);
                consonantCtrlBtns.appendChild(btn2);

                consonantContainer.appendChild(consonantSpan);
                consonantContainer.appendChild(consonantCtrlBtns);

                const vowelContainer = document.createElement('div');
                vowelContainer.classList.add('letter-container');

                const vowelSpan = document.createElement('span');
                vowelSpan.classList.add('letter');

                const vowelCtrlBtns = document.createElement('div');
                vowelCtrlBtns.classList.add('letter-ctrl-btns');

                const btn3 = document.createElement('button');
                const btn3Icon = document.createElement('div');
                btn3.classList.add("ltr-ctrl-btn");
                btn3Icon.classList.add("ltr-ctrl-btn-icon");
                btn3Icon.id = "key_up";
                btn3.appendChild(btn3Icon);

                const btn4 = document.createElement('button');
                const btn4Icon = document.createElement('div');
                btn4.classList.add("ltr-ctrl-btn");
                btn4Icon.classList.add("ltr-ctrl-btn-icon");
                btn4Icon.id = "key_down";
                btn4.appendChild(btn4Icon);

                vowelCtrlBtns.appendChild(btn3);
                vowelCtrlBtns.appendChild(btn4);

                vowelContainer.appendChild(vowelSpan);
                vowelContainer.appendChild(vowelCtrlBtns);

                const switchBtn = document.createElement('button');
                const switchIcon = document.createElement('div');
                switchBtn.classList.add("ltr-ctrl-btn-width");
                switchIcon.classList.add("ltr-ctrl-btn-icon");
                switchIcon.id = "key_space";
                switchBtn.appendChild(switchIcon);

                switchBtn.addEventListener('click', () => {
                    const containers = document.querySelectorAll('.syllable-container');
                    const currentIndex = Array.from(containers).indexOf(syllableDiv);
                    const nextIndex = (currentIndex + 1) % containers.length;
                    syllableDiv.classList.remove('active');
                    containers[nextIndex].classList.add('active');
                });

                syllableDiv.appendChild(consonantContainer);
                syllableDiv.appendChild(vowelContainer);
                syllableDiv.appendChild(switchBtn);

                syllableGame.appendChild(syllableDiv);

                setupLetterControls(consonantSpan, btn1, btn2, 'consonant');
                setupLetterControls(vowelSpan, btn3, btn4, 'vowel');
            }
        }

        function setupLetterControls(letterSpan, btn1, btn2, type) {
            let letters = [];
            if (type === 'consonant') {
                const selectedValue = parseInt(document.querySelector("#select_cons .selected")?.dataset.value || '1', 10);
                letters = selectedValue === 1 ? [...basicConsonants] : [...basicConsonants, ...advancedConsonants];
            } else {
                const selectedValue = parseInt(document.querySelector("#select_vow .selected")?.dataset.value || '1', 10);
                letters = selectedValue === 1 ? [...basicVowels] : [...basicVowels, ...advancedVowels];
            }

            shuffleArray(letters);
            let currentIndex = 0;
            letterSpan.textContent = letters[currentIndex];

            btn1.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + letters.length) % letters.length;
                letterSpan.textContent = letters[currentIndex];
            });

            btn2.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % letters.length;
                letterSpan.textContent = letters[currentIndex];
            });
        }

        syllButtons.forEach(button => button.addEventListener('click', handleDataSelection));
        vowsButtons.forEach(button => button.addEventListener('click', handleDataSelection));
        consButtons.forEach(button => button.addEventListener('click', handleDataSelection));

        startBtn.addEventListener('click', () => {
            gameState = true;
            updateBoardOptions();
        });

        finishBtn.addEventListener('click', () => {
            gameState = false;
            syllableGame.innerHTML = '';
        });

        // Выбор значений по умолчанию
        document.querySelector("#select_slog span[data-value='1']").classList.add("selected");
        document.querySelector("#select_vow span[data-value='1']").classList.add("selected");
        document.querySelector("#select_cons span[data-value='1']").classList.add("selected");

        // Обработчик для переключения между контейнерами
        document.addEventListener('keydown', (event) => {
            if (!gameState) return;
            const activeContainer = document.querySelector('.syllable-container.active');
            if (!activeContainer) return;
        
            if (event.code === 'Space') {
                const containers = document.querySelectorAll('.syllable-container');
                const currentIndex = Array.from(containers).indexOf(activeContainer);
                const nextIndex = (currentIndex + 1) % containers.length;
                activeContainer.classList.remove('active');
                containers[nextIndex].classList.add('active');
            } else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                const consonantSpan = activeContainer.querySelector('.letter-container:first-child .letter');
                const btn1 = consonantSpan.nextElementSibling.querySelector('button:nth-child(1)');
                const btn2 = consonantSpan.nextElementSibling.querySelector('button:nth-child(2)');
                if (event.code === 'ArrowLeft') {
                    btn1.click();
                } else if (event.code === 'ArrowRight') {
                    btn2.click();
                }
            } else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
                const vowelSpan = activeContainer.querySelector('.letter-container:nth-child(2) .letter');
                const btn3 = vowelSpan.nextElementSibling.querySelector('button:nth-child(1)');
                const btn4 = vowelSpan.nextElementSibling.querySelector('button:nth-child(2)');
                if (event.code === 'ArrowUp') {
                    btn3.click();
                } else if (event.code === 'ArrowDown') {
                    btn4.click();
                }
            }
        });
    }

    setupSyllableGame();
});