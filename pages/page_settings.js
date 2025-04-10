import { 
    updateData, getSettings, syncDataWithInitial, getName, setName
} from '../data_manager.js';

document.addEventListener("DOMContentLoaded", () => {     
    const settingsCategories = document.getElementById("settings_categories");
    const settingsList = document.getElementById("settings_list");

    syncDataWithInitial();

    const settings = getSettings();

    const categories = [
        { id: "sound", name: "Общие настройки" },
        { id: "gameplay", name: "Настройки геймплея" }
    ];

    categories.forEach(category => {
        const button = document.createElement("div");
        const btn_title = document.createElement("h3");
        btn_title.textContent = category.name;
        button.classList.add("category_btn");
        button.dataset.category = category.id;
        button.addEventListener("click", () => renderSettings(category.id));
        button.appendChild(btn_title);
        settingsCategories.appendChild(button);
    });

    renderSettings("sound");
    function renderSettings(category) {
        settingsList.innerHTML = "";

        if (category === "sound") {
            renderSoundSettings();
        } else if (category === "gameplay") {
            renderGameplaySettings();
        }
    }

    function renderSoundSettings() {
        const RTname = getName();

        const userContainer = document.createElement("div");
        userContainer.className = "user-name-settings";
        const settingLabel = document.createElement("h2");
        settingLabel.innerHTML = "Твое имя: ";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Введи свое имя";
        if (RTname != "default") {
            nameInput.value = RTname;
        }
        nameInput.addEventListener("input", () => {
            setName(nameInput.value === "" ? "default" : nameInput.value);
        });
        
        userContainer.appendChild(settingLabel);
        userContainer.appendChild(nameInput);

        settingsList.appendChild(userContainer);

        const soundSettings = [
            {
                title: "Громкость эффектов",
                id: "effects_slider",
                value: settings.volume.game_effects,
                spanId: "effects_volume",
                onInput: (value) => updateData("settings", "volume", { ...settings.volume, game_effects: value })
            },
            {
                title: "Громкость уведомлений",
                id: "notification_slider",
                value: settings.volume.notification,
                spanId: "notification_volume",
                onInput: (value) => updateData("settings", "volume", { ...settings.volume, notification: value })
            }
        ];

        soundSettings.forEach(setting => {
            const container = document.createElement("div");
            container.classList.add("sound_setting");

            const title = document.createElement("h2");
            title.textContent = setting.title;

            const slider = document.createElement("input");
            const value_container = document.createElement("div");
            value_container.classList.add("value_container");
            slider.type = "range";
            slider.classList.add("volume_slider");
            slider.id = setting.id;
            slider.min = "0";
            slider.max = "1";
            slider.step = "0.05";
            slider.value = setting.value;
            slider.addEventListener("input", (event) => {
                const value = event.target.value;
                document.getElementById(setting.spanId).textContent = value;
                setting.onInput(value);
            });

            const span = document.createElement("span");
            span.id = setting.spanId;
            span.textContent = setting.value;

            container.appendChild(title);
            value_container.appendChild(slider);
            value_container.appendChild(span);
            container.appendChild(value_container);
            settingsList.appendChild(container);
        });
    }

    function renderGameplaySettings() {
        const gamesSettings = settings.games;
        
        Object.keys(gamesSettings).forEach(gameId => {
            const gameSettings = gamesSettings[gameId];
            
            const container = document.createElement("div");
            container.classList.add("gameplay_settings");

            const title = document.createElement("h2");
            switch (gameId) {
                case "digit":
                    title.textContent = "Состав числа";
                    break;
                case "syllable":
                    title.textContent = "Гласные - согласные";
                    break;
                case "shulte":
                    title.textContent = "Таблица Шульте";
                    break;
                default:
                    title.textContent = "Неизвестная игра";
                    break;
            }

            container.appendChild(title);

            Object.keys(gameSettings).forEach(settingKey => {
                const setting = gameSettings[settingKey];

                const featureContainer = document.createElement("div");
                featureContainer.classList.add("feature_settings");

                const description = document.createElement("span");
                description.classList.add("description");
                description.textContent = setting.description;

                const checkbox = document.createElement("div");
                checkbox.classList.add("custom-checkbox");
                if (setting.state) {
                    checkbox.classList.add("active");
                }

                checkbox.addEventListener("click", () => {
                    const isActive = checkbox.classList.toggle("active");
                    gameSettings[settingKey].state = isActive;
                    updateData("settings", "games", settings.games);
                });

                featureContainer.appendChild(description);
                featureContainer.appendChild(checkbox);
                container.appendChild(featureContainer);
            });
            settingsList.appendChild(container);
        });
    }
});