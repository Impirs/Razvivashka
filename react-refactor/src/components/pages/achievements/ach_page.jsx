import React, { useMemo, useState, useEffect } from "react";
import useStorage from "../../../hooks/useStorage";
import usei18n from "../../../hooks/usei18n";

import List from "../../lists/ctrl_list";
import AchievementList from "./ach_list";

function AchievementPage() {
    const [ selectedgame, setgame ] = useState("all");
    const [ gameslist, setGameslist ] = useState(["game_all"]);

    const { games, isLoading } = useStorage();
    const { t } = usei18n();

    useEffect(() => {
        const fetchGameNames = async () => {
            if (isLoading) return;

            const gamesArr = games || [];
            const translatedAllGames = await t('game_all');
            const translatedGameNames = await Promise.all(
                gamesArr.map(async (game) => {
                    const translatedName = await t(`game_${game.id}`);
                    return translatedName;
                })
            );

            setGameslist([translatedAllGames, ...translatedGameNames]);
        };

        fetchGameNames();
    }, [games, isLoading, t]);

    const gametags = useMemo(() => {
        if (isLoading) return [];
    
        const gamesArr = games || [];
        const gameNames = gamesArr.map(game => game.id);
        return ["all", ...gameNames];
    }, [games, isLoading]);

    if (isLoading) return <div>Loading...</div>;

    const handleItemClick = (value) => {
        setgame(value);
    }

    return (
        <div className="achievement-content">
            <List data={gameslist} dataValue={gametags} onItemClick={handleItemClick} />
            <AchievementList game={selectedgame} />
        </div>
    );
}

export default AchievementPage;