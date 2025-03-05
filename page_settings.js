import { 
    updateData, getVolume
} from './data_manager.js';

document.addEventListener("DOMContentLoaded", () => {     
    const effectSlider = document.getElementById("effects_slider");
    const notifSlider = document.getElementById("notification_slider");

    const effectsVolumeSpan = document.getElementById("effects_volume");
    const notifVolumeSpan = document.getElementById("notification_volume");


    const savedVolume = getVolume(); 
    if (savedVolume !== null) {
        notifSlider.value = savedVolume.notification;
        notifVolumeSpan.textContent = savedVolume.notification;
        effectSlider.value = savedVolume.game_effects;
        effectsVolumeSpan.textContent = savedVolume.game_effects;
    }

    notifSlider.addEventListener("input", (event) => {
        const volume = event.target.value;
        notifVolumeSpan.textContent = volume;
        updateData("settings", "volume", { ...getVolume(), notification: volume });
    });

    effectSlider.addEventListener("input", (event) => {
        const volume = event.target.value;
        effectsVolumeSpan.textContent = volume;
        updateData("settings", "volume", { ...getVolume(), game_effects: volume });
    });
});