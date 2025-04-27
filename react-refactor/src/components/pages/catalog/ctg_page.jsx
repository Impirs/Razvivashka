import React, { useCallback, useEffect, useMemo, useState } from "react";
import useStorage from "../../../hooks/useStorage";

import GamesList from "./ctg_list";
import DropdownMenu from "../../inputs/dropdown";

import '../../../styles/modules/catalog.scss';

function CatalogPage() {
    const { games, types, isLoading } = useStorage();

    const [filter, setFilter] = useState("type_all");
    const [gamesMeta, setMeta] = useState([]);

    const options = useMemo(() => {
        if (isLoading || !types) return [];
        return ["type_all", ...types];
    }, [types, isLoading]);

    useEffect(() => {
        if (isLoading || !games) return;

        const gamesArr = games || [];
        const meta = gamesArr.filter((game) => {
            if (filter === "type_all") return true;
            return game.type.includes(filter.slice(5)); 
        });

        setMeta(meta);
    }, [filter, games, isLoading]);

    const handleFilter = useCallback((value) => {
        setFilter(value);
    }, []);

    return (
        <div className="page-content">
            <div className="container-header">
                <div>{/* Поиск */}</div>
                <div>{/* Центр */}</div>
                <div style={{justifySelf: "end"}}>
                    {
                        <DropdownMenu 
                            options={options} 
                            onSelect={handleFilter} 
                        />
                    }
                </div>
            </div>
            <div className="container-content">
                <GamesList games={gamesMeta} />
            </div>
        </div>
    );
}

export default CatalogPage;