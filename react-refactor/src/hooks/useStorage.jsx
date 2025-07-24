import { useState, useEffect } from 'react';

export default function useStorage() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [settings, setSettings] = useState(null);
    const [volume , setVolume] = useState(null)
    const [game_settings, setGameSettings] = useState(null);
    const [achievements, setAchevements] = useState([]);
    const [highscores, setHighscores] = useState(null);
    const [games, setGames] = useState([]);
    const [types, setTypes] = useState([]);

    const [refreshUser, setUserTrigger] = useState(0);
    const [refreshSettings, setSettingsTrigger] = useState(0);

    // functions changing user data
    const addScore = async (game, id, score, date) => {
        try {
            await window.storageAPI.addHighScore(game, id, score, date);
            // console.log("Adding new highscore...");
            await fetchHighscores();
        } catch (error) {
            console.error('Error adding the score:', error);
        }
    };
    const removeScore = async (game, id, score, date) => {
        try {
            await window.storageAPI.removeHighScore(game, id, score, date);
            await fetchHighscores();
        } catch (error) {
            console.error('Error deleting the score:', error);
        }
    };
    const unlockAchive = async (game, id, score) => {
        try {
            const unlocked = await window.storageAPI.unlockAchievement(game, id, score);
            // console.log(unlocked);
            await fetchAchievements();
            return unlocked;
        } catch (error) {
            console.error('Error trying to unlock the achievement:', error);
            return [];
        }
    };
    const changeUsername = async (newName) => {
        const trimmed = newName.trim();
        if (trimmed === username) return;
        try {
            await window.storageAPI.setName(trimmed);
            setUserTrigger((prev) => prev + 1);
            // console.log("changeUsername set:", trimmed);
        } catch (error) {
            console.error("Error trying to set new username:", error);
        }
    };
    
    // functions changing settings data
    const changeVolume = (key, value) => {
        try {
            setVolume((prevVolume) => {
                const updatedVolume = { ...prevVolume, [key]: value };
                window.storageAPI.saveSettings({ ...settings, volume: updatedVolume });
                return updatedVolume;
            });
            setSettingsTrigger((prev) => prev + 1);
        } catch (error) {
            console.error(`Error updating volume for key "${key}":`, error);
        }
    };
    const setFeature = (gameKey, featureKey, newState) => {
        try {
            setGameSettings((prevGameSettings) => {
                const updatedGameSettings = {
                    ...prevGameSettings,
                    [gameKey]: {
                        ...prevGameSettings[gameKey],
                        [featureKey]: { 
                            ...prevGameSettings[gameKey][featureKey], 
                            state: newState 
                        },
                    },
                };
                window.storageAPI.saveSettings({
                    ...settings,
                    games: updatedGameSettings,
                });
                return updatedGameSettings;
            });
            setSettingsTrigger((prev) => prev + 1);
        } catch (error) {
            console.error(
                `Error updating feature "${featureKey}" for game "${gameKey}":`,
                error
            );
        }
    };

    // Getting data functions
    const fetchUser = async () => {
        try {
            const userData = await window.storageAPI.getUser();
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    const fetchUsername = async () => {
        try {
            const usernameData = await window.storageAPI.getName();
            setUsername(usernameData);
        } catch (error) {
            console.error('Error fetching username:', error);
        }
    };
    const fetchSettings = async () => {
        try {
            const settingsData = await window.storageAPI.getSettings();
            setSettings(settingsData);
        } catch (error) {
            console.error('Error fetching settings data:', error);
        }
    };
    const fetchVolume = async () => {
        try {
            const volumeData = await window.storageAPI.getVolume();
            setVolume(volumeData);
        } catch (error) {
            console.error('Error fetching volume settings:', error);
        }
    };
    const fetchGameSettings = async () => {
        try {
            const gamesettingsData = await window.storageAPI.getGameSettings();
            setGameSettings(gamesettingsData);
        } catch (error) {
            console.error("Error fetching game settings:", error);
        }
    };
    const fetchAchievements = async () => {
        try {
            const allachievements = await window.storageAPI.getAchievements();
            // console.log(allachievements);
            setAchevements(allachievements);
        } catch (error) {
            console.error('Error fetching user achievements:', error);
        }
    };
    const fetchHighscores = async () => {
        try {
            const allhighscores = await window.storageAPI.getHighScores();
            // console.log("Fetched highscores:", allhighscores);
            setHighscores(JSON.parse(JSON.stringify(allhighscores)));
        } catch (error) {
            setHighscores({});
            console.error('Error fetching highscores:', error);
        }
    }
    const fetchGames = async () => {
        try {
            const allgames = await window.storageAPI.getGames();
            // console.log(allgames);
            setGames(allgames);
        } catch (error) {
            console.error("Error fetching games list:", error);
        }
    }
    const fetchTypes = async () => {
        try {
            const alltypes = await window.storageAPI.getTypes();
            // console.log(alltypes);
            setTypes(alltypes);
        } catch (error) {
            console.error("Error fetching types list:", error);
        }
    }

    useEffect(() => {
        fetchUser();
        fetchUsername();
        fetchSettings();
        fetchVolume();
        fetchGameSettings();
        fetchAchievements();
        fetchHighscores();
        fetchGames();
        fetchTypes();
    }, []);

    useEffect(() => {
        fetchUser();
        fetchUsername();
        fetchAchievements(); // new ach unlocked
        fetchHighscores();   // more or less highscores
    }, [refreshUser]);

    useEffect(() => {
        fetchSettings();
        fetchVolume();
        fetchGameSettings();
    }, [refreshSettings]);

    return {
            user, username, achievements, highscores, games, types,
            addScore, removeScore, unlockAchive, changeUsername,
            settings, volume, game_settings,
            changeVolume, setFeature
        };
}