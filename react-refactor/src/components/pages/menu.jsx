import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavButton from "../buttons/nav_btn";
import usei18n from "../../hooks/usei18n";

function HomePage() {
    const { t } = usei18n();
const navigate = useNavigate(); // Хук для навигации

    const [translations, setTranslations] = useState({
        application: "",
        play: "",
        achievements: "",
        settings: "",
        exit: "",
    });

    useEffect(() => {
        const fetchTranslations = async () => {
            if (!t) return;
                
            try {
                const application = await t("application");
                const play = await t("play");
                const achievements = await t("achievements");
                const settings = await t("settings");
                const exit = await t("exit");

                setTranslations({
                    application,
                    play,
                    achievements,
                    settings,
                    exit,
                });
            } catch (error) {
                console.error("Error fetching translations:", error);
            }
        };

        fetchTranslations();
    }, [t]);

    const handlePlayClick = () => navigate("/catalog"); // Переход на страницу каталога
    const handleAchievementsClick = () => navigate("/achievements"); // Переход на страницу достижений
    const handleSettingsClick = () => navigate("/settings"); // Переход на страницу настроек
    const handleExitClick = () => window.electronAPI.quitApp(); // Закрытие приложения

    return (
        <div className="home-page">
                        <h1>{translations.application}</h1>
            <NavButton key={"play"} value={translations.play} onClick={handlePlayClick} />
            <NavButton key={"achievements"} value={translations.achievements} onClick={handleAchievementsClick} />
            <NavButton key={"settings"} value={translations.settings} onClick={handleSettingsClick} />
            <NavButton key={"exit"} value={translations.exit} onClick={handleExitClick} />
        </div>
    );
}

export default HomePage;