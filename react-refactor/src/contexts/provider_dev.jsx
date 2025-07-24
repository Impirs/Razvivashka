import React, { createContext, useContext } from "react";

const FILTERED_TAGS = ["syllable"];

const DevFilterContext = createContext({
    filterGames: (games) => games,
    filterAchievements: (achievements) => achievements,
    filterGameSettings: (gameSettings) => gameSettings,
});

export function DevFilterProvider({ children }) {
    const filterGames = (games) =>
        Array.isArray(games)
            ? games.filter((game) => !FILTERED_TAGS.includes(game.id))
            : games;

    const filterAchievements = (achievements) => {
        if (!achievements || typeof achievements !== "object") return achievements;
        const filtered = {};
        Object.entries(achievements).forEach(([key, value]) => {
            if (!FILTERED_TAGS.includes(key)) filtered[key] = value;
        });
        return filtered;
    };

    const filterGameSettings = (gameSettings) => {
        if (!gameSettings || typeof gameSettings !== "object") return gameSettings;
        const filtered = {};
        Object.entries(gameSettings).forEach(([key, value]) => {
            if (!FILTERED_TAGS.includes(key)) filtered[key] = value;
        });
        return filtered;
    };

    return (
        <DevFilterContext.Provider
            value={{
                filterGames,
                filterAchievements,
                filterGameSettings,
            }}
        >
            {children}
        </DevFilterContext.Provider>
    );
}

export function useDevFilter() {
    return useContext(DevFilterContext);
}