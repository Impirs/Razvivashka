function goCatalog() {
    window.location.href = 'pages/page_catalog.html';
}

function goAchievements() {
    window.location.href = 'pages/page_achievements.html';
}

function goSettings() {
    window.location.href = 'pages/page_settings.html';
}

function goHome() {
    window.location.href = 'index.html'
}

if (document.getElementById('exit_btn')) {
    document.getElementById('exit_btn').addEventListener('click', () => {
        window.electronAPI.quitApp();
    });
}
if (document.getElementById('digit_solver')){
    document.getElementById('digit_solver').addEventListener('click', () => {
        window.location.href = '../games/digit/game_digit_solver.html'
    })
}
if (document.getElementById('sum_solver')){
    document.getElementById('sum_solver').addEventListener('click', () => {
        window.location.href = '../games/game_sum_solver.html'
    })
}
if (document.getElementById('')){
    document.getElementById('').addEventListener('click', () => {
        window.location.href = '../games/.html'
    })
}