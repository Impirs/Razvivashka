import React, { useEffect, useMemo } from "react";
import useStorage from "../../../hooks/useStorage";
import AchievementText from "./ach_text";
import TrophyList from "./ach_result";

function AchievementList({ game }) {
    const { achievements, games, isLoading } = useStorage();

    const acharr = useMemo(() => {
        if (isLoading) return [];

        if (game === 'all') {
            return games.flatMap(g => {
                const gameAch = achievements[g.id] || [];
                return gameAch.map(ach => ({ ...ach, game: g.id, type: g.type }));
            });
        } else {
            const currentGame = games.find(g => g.id === game);
            if (currentGame) {
                const gameAch = achievements[game] || [];
                return gameAch.map(ach => ({
                    ...ach, game, type: currentGame.type
                }));
            }
            return [];
        }
    }, [game, achievements, games, isLoading]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="achievement-list">
            {acharr.map(({ id, game, ranks, unlocked }) => (
                <div key={`${game}_${id}`} className="achievement">
                    <TrophyList ranks={ranks} unlocked={unlocked} />
                    <AchievementText game={game} tag={`ach_${game}_${id}`} ranks={ranks} unlocked={unlocked}/>
                </div>
            ))}
        </div>
    );
}

export default AchievementList;