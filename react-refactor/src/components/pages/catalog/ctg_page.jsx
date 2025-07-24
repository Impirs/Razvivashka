import React, { useCallback, useEffect, useMemo, useState } from "react";
import useStorage from "../../../hooks/useStorage";
import { useDevFilter } from "../../../contexts/provider_dev";

import GamesList from "./ctg_list";
import DropdownMenu from "../../inputs/dropdown";

import '../../../styles/modules/catalog.scss';

function CatalogPage() {
    const { games, types, isLoading } = useStorage();
    const { filterGames } = useDevFilter();

    const [filter, setFilter] = useState("type_all");
    const [gamesMeta, setMeta] = useState([]);

    const filteredGames = useMemo(() => filterGames(games), [games, filterGames]);

    const options = useMemo(() => {
        if (isLoading || !types) return [];
        return ["type_all", ...types];
    }, [types, isLoading]);

    useEffect(() => {
        if (isLoading || !filteredGames) return;

        const gamesArr = filteredGames || [];
        const meta = gamesArr.filter((game) => {
            if (filter === "type_all") return true;
            return game.type.includes(filter.slice(5)); 
        });

        setMeta(meta);
    }, [filter, filteredGames, isLoading]);

    const handleFilter = useCallback((value) => {
        setFilter(value);
    }, []);

    return (
        <div className="page-content">
            <div className="container-header">
                <div>{/* Поиск */}</div>
                <div>{/* Центр */}</div>
                <div style={{justifySelf: "end"}}>
                    <DropdownMenu 
                        options={options} 
                        onSelect={handleFilter} 
                    />
                </div>
            </div>
            <div className="container-content">
                <GamesList games={gamesMeta} />
            </div>
        </div>
    );
}

export default CatalogPage;