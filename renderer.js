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
if (document.getElementById('syllable')){
    document.getElementById('syllable').addEventListener('click', () => {
        window.location.href = '../games/syllable/game_syllable.html'
    })
}
if (document.getElementById('')){
    document.getElementById('').addEventListener('click', () => {
        window.location.href = '../games/.html'
    })
}
window.electronAPI.navigate = (path) => {
    window.location.href = path;
};