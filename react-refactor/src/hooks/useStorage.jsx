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

    // trigger for useEffects -> updating data after changing by functions
    const [refreshUser, setUserTrigger] = useState(0);
    const [refreshSettings, setSettingsTrigger] = useState(0);

    // functions changing user data
    const addScore = async (game, id, score, date) => {
        try {
            await window.storageAPI.addHighscore(game, id, score, date);
            setUserTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error adding the score:', error);
        }
    };
    const removeScore = async (game, id, score, date) => {
        try {
            await window.storageAPI.removeHighscore(game, id, score, date);
            setUserTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error deleting the score:', error);
        }
    };
    const unlockAchive = async (game, id, score) => {
        try {
            await window.storageAPI.unlockAchievement(game, id,score);
            setUserTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error trying to unlock the achievement:', error);
        }
    };
    const changeUsername = async (newName) => {
        try {
            await window.storageAPI.setName(newName.trim());
            setUserTrigger((prev) => prev + 1);
        } catch (error) {
            console.error("Error trying to set new username:", error);
        }
    };
    
    // functions changing settings data
    const changeVolume = (key, value) => {
        try {
            setVolume((prevVolume) => ({
                ...prevVolume,
                [key]: value, 
            }));
            setSettingsTrigger((prev) => prev + 1);
            window.storageAPI.saveSettings({ ...settings, volume: { ...volume, [key]: value } });
        } catch (error) {
            console.error(`Error updating volume for key "${key}":`, error);
        }
    };
    const setFeature = (gameKey, featureKey, newState) => {
        try {
            setGameSettings((prevGameSettings) => ({
                ...prevGameSettings,
                [gameKey]: {
                    ...prevGameSettings[gameKey],
                    [featureKey]: newState, 
                },
            }));
            setSettingsTrigger((prev) => prev + 1);
            window.storageAPI.saveSettings({
                ...settings,
                games: {
                    ...game_settings,
                    [gameKey]: {
                        ...game_settings[gameKey],
                        [featureKey]: newState,
                    },
                },
            });
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
            setHighscores(allhighscores);
        } catch (error) {
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