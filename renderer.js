document.addEventListener("DOMContentLoaded", () => {
    const exitBtn = document.getElementById('exit_btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            window.electronAPI.quitApp();
        });
    }

    const digitSolverBtn = document.getElementById('digit_solver');
    if (digitSolverBtn) {
        digitSolverBtn.addEventListener('click', () => {
            window.location.href = '../games/digit/game_digit_solver.html';
        });
    }

    const sumSolverBtn = document.getElementById('sum_solver');
    if (sumSolverBtn) {
        sumSolverBtn.addEventListener('click', () => {
            window.location.href = '../games/game_sum_solver.html';
        });
    }

    const syllableBtn = document.getElementById('syllable');
    if (syllableBtn) {
        syllableBtn.addEventListener('click', () => {
            window.location.href = '../games/syllable/game_syllable.html';
        });
    }

    const shulteBtn = document.getElementById('shulte');
    if (shulteBtn) {
        shulteBtn.addEventListener('click', () => {
            window.location.href = '../games/shulte/game_shulte.html';
        });
    }

    window.electronAPI.navigate = (path) => {
        window.location.href = path;
    };
});