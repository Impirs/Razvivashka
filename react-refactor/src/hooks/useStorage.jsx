import { useState, useEffect } from 'react';

export default function useStorage() {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [achievements, setAchevements] = useState([]);
    const [highscores, setHighscores] = useState(null);
    const [games, setGames] = useState([]);

    // trigger for useEffects -> updating data after changing by functions
    const [refreshUser, setUserTrigger] = useState(0);
    const [refreshSettings, setSettingsTrigger] = useState(0);

    const addScore = async (game, id, score, date) => {
        try {
            await window.storageAPI.addHighscore(game, id, score, date);
            setUserTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error adding the score:', error);
        }
    }

    const removeScore = async (game, id, score, date) => {
        try {
            await window.storageAPI.removeHighscore(game, id, score, date);
            setUserTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error deleting the score:', error);
        }
    }

    const unlockAchive = async (game, id, score) => {
        try {
            await window.storageAPI.unlockAchievement(game, id,score);
            setUserTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error trying to unlock the achievement:', error);
        }
    }

    // Getting data functions
    const fetchUser = async () => {
        try {
            const userData = await window.storageAPI.getUser();
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
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

    useEffect(() => {
        fetchUser();
        fetchSettings();
        fetchAchievements();
        fetchHighscores();
        fetchGames();
    }, []);

    useEffect(() => {
        fetchUser();
        fetchAchievements(); // new ach unlocked
        fetchHighscores();   // more or less highscores
    }, [refreshUser]);

    useEffect(() => {
        fetchSettings();
    }, [refreshSettings]);

    return {user, settings, achievements, highscores, games,
            addScore, removeScore, unlockAchive};
}