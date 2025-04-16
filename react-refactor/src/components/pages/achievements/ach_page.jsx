import React, { useMemo, useState } from "react";
import useStorage from "../../../hooks/useStorage";

import List from "../../lists/ctrl_list";
import AchievementList from "./ach_list";

function AchievementPage() {
    const [ selectedgame, setgame ] = useState("all");
    const { games, isLoading } = useStorage();

    const gameslist = useMemo(() => {
        if (isLoading) return [];
    
        const gamesArr = games || [];
        // console.log(gamesArr);
        const gameNames = gamesArr.map(game => game.id);
        return ["all", ...gameNames];
    }, [games, isLoading]);
    // console.log(gameslist);

    if (isLoading) return <div>Loading...</div>;

    const handleItemClick = (item) => {
        // console.log("Clicked item:", item);
        setgame(item);
    }

    return (
        <div className="achievement-content">
            <List data={gameslist} onItemClick={handleItemClick} />
            <AchievementList game={selectedgame} />
        </div>
    );
}

export default AchievementPage;