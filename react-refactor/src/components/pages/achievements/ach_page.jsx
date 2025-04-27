import React, { useMemo, useState, useCallback } from "react";
import useStorage from "../../../hooks/useStorage";
import usei18n from "../../../hooks/usei18n";

import DropdownMenu from "../../inputs/dropdown";
import AchievementList from "./ach_list";

import '../../../styles/modules/achievements.scss';

function AchievementPage() {
    const [selectedGame, setSelectedGame] = useState("all");
    const { games, isLoading } = useStorage();
    const { t } = usei18n();

    const options = useMemo(() => {
        if (isLoading) return [];
        const gamesArr = games || [];
        return ["game_all", ...gamesArr.map(game => `game_${game.id}`)];
    }, [games, isLoading]);

    if (isLoading) return <div>Loading...</div>;

    const handleSelect = useCallback((value) => {
        setSelectedGame(value.slice(5));
    }, []);

    return (
        <div className="page-content">
            <div className="container-header">
                <div>{/* Поиск */}</div>
                <div>{/* Центр */}</div>
                <div style={{justifySelf: "center"}}>
                    {
                        <DropdownMenu
                            options={options}
                            onSelect={handleSelect}
                            value={`game_${selectedGame}`}
                        />
                    }
                </div>
            </div>
            <div className="container-content">
                <AchievementList game={selectedGame} />
            </div>
        </div>
    );
}

export default AchievementPage;