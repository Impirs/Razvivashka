function goCatalog() {
    window.location.href = 'page_catalog.html';
}
function goAchievements() {
    window.location.href = 'page_achievements.html';
}
function goSettings() {
    window.location.href = 'page_settings.html';
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
        window.location.href = 'game_digit_solver.html'
    })
}
if (document.getElementById('sum_solver')){
    document.getElementById('sum_solver').addEventListener('click', () => {
        window.location.href = 'game_sum_solver.html'
    })
}

//document.getElementById('play_bnt').addEventListener('click', () => {
//  alert("Start to Play!")
//});
