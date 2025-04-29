import React, { useEffect, useState } from "react";
import { useLanguage } from "../../../provider_lang";

import TextInput from "../../inputs/input";
import DropdownMenu from "../../inputs/dropdown";
import Slider from "../../inputs/slider";
import Checkbox from "../../inputs/checkbox";

import useStorage from "../../../hooks/useStorage";

import '../../../styles/modules/settings.scss';

function SettingsPage() {
    const {
        username,
        volume,
        game_settings,
        changeUsername,
        changeVolume,
        setFeature,
    } = useStorage();
    const { t, lang, setLanguage } = useLanguage();

    const [translations, setTranslations] = useState({
        generalSettings: "",
        player: "",
        placeholder: "",
        username: "",
        language: "",
        currentLanguage: "",
        volume: "",
        notification: "",
        gameEffects: "",
        gameplaySettings: "",
        games: {},
    });

    useEffect(() => {
        const fetchTranslations = async () => {
            if (!t || !lang) return;

            try {
                const generalSettings = await t("general_settings");
                const player = await t("player");
                const name = await t("name");
                const username = await t("username");
                const language = await t("language");
                const currentLanguage = await t(lang);
                const volume = await t("volume");
                const notification = await t("volume_notifications");
                const gameEffects = await t("volume_effects");
                const gameplaySettings = await t("gameplay_settings");

                const gameTitles = {};
                for (const [gameKey, settings] of Object.entries(game_settings || {})) {
                    const gameTitle = await t(`game_${gameKey}`);
                    gameTitles[gameKey] = {
                        title: gameTitle,
                        settings: {},
                    };

                    for (const [settingKey] of Object.entries(settings)) {
                        const settingTitle = await t(`${settingKey}`);
                        gameTitles[gameKey].settings[settingKey] = settingTitle;
                    }
                }

                setTranslations({
                    generalSettings,
                    username,
                    player,
                    name,
                    language,
                    currentLanguage,
                    volume,
                    notification,
                    gameEffects,
                    gameplaySettings,
                    games: gameTitles,
                });
            } catch (error) {
                console.error("Error fetching translations:", error);
            }
        };

        fetchTranslations();
    }, [game_settings, t, lang]);

    const handleCheckbox = (gameKey, settingKey, newValue) => {
        // console.log(gameKey,settingKey,newValue);
        setFeature(gameKey, settingKey, newValue);
    };

    const handleVolumeChange = (key, newValue) => {
        changeVolume(key, newValue);
    };

    const handleUsernameChange = (newUsername) => {
        if (username !== newUsername) {
            changeUsername(newUsername);
        }
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
    };

    return (
        <div className="page-content">
            <div className="container-header">
                <div>{/* Поиск */}</div>
                <div>{/* Центр */}</div>
                <div>{/* Дропдаун */}</div>
            </div>
            <div className="container-content">
                {/* General Settings */}
                <section className="general">
                    <div className="section-header">
                        <h2>{translations.generalSettings}</h2>
                        <hr />
                    </div>
                    <div className="section-content">
                        {/* Username Setting */}
                        <div className="settings-line-parameter">
                            <h3>{translations.player}</h3>
                            <TextInput
                                placeholder={translations.name}
                                value={(username === "default" )||(username === "") ? "" : username}
                                onChange={handleUsernameChange}
                            />
                        </div>

                        {/* Language Setting */}
                        <div className="settings-line-parameter">
                            <h3>{translations.language}</h3>
                            <DropdownMenu
                                options={["en", "ru", "sb_l", "sb_k"]}
                                placeholder={translations.currentLanguage}
                                onSelect={handleLanguageChange}
                            />
                        </div>

                        {/* Volume Settings */}
                        <div className="section-header">
                            <h2>{translations.volume}</h2>
                            <hr />
                        </div>
                        <div className="section-content">
                            <div className="settings-line-parameter">
                                <h3>{translations.notification}</h3>
                                <Slider
                                    value={volume?.notification || 0.5}
                                    onChange={(value) => handleVolumeChange("notification", value)}
                                />
                            </div>
                            <div className="settings-line-parameter">
                                <h3>{translations.gameEffects}</h3>
                                <Slider
                                    value={volume?.game_effects || 0.5}
                                    onChange={(value) => handleVolumeChange("game_effects", value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gameplay Settings */}
                <section className="gameplay">
                    <div className="section-header">
                        <h2>{translations.gameplaySettings}</h2>
                        <hr />
                    </div>
                    <div className="section-content">
                        {game_settings &&
                            Object.entries(game_settings).map(([gameKey, settings]) => (
                                <div key={gameKey}>
                                    <h3>{translations.games[gameKey]?.title}</h3>
                                    {Object.entries(settings).map(([settingKey, setting]) => (
                                        <div
                                            className="settings-line-parameter"
                                            key={`${gameKey}_${settingKey}`}
                                        >
                                            <div className="game-setting">
                                                <h4>{translations.games[gameKey]?.settings[settingKey]}</h4>
                                            </div>
                                            <Checkbox
                                                checked={setting.state}
                                                onClick={(newValue) =>
                                                    handleCheckbox(gameKey, settingKey, newValue)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default SettingsPage;
