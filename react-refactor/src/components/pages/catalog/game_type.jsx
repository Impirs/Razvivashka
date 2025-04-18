import React, { useEffect, useState } from "react";
import usei18n from "../../../hooks/usei18n";

const TypesLine = React.memo(({game}) => {
    // {id: "gamename", type: "gametype"}

    // after changing the the sctructure it will look like this:
    // {id: "gamename", type: ["gametype_1", "gametype_2"]} so will write
    // the function with this idea

    const [translatedTypes, setTypes] = useState([]);
    const { t } = usei18n();

    useEffect(() => {
        Promise.all(game.type.map(type => t(`type_${type}`))).then(setTypes);
    }, []);
    
    return (
        <div className="game-types">
            {translatedTypes.map((item, index) => (
                <div key={`gamme-type_${index}`} className={`game-type ${game.type[index]}`}>
                    {item}
                </div>
            ))}
        </div>
    );
});

export default TypesLine;

/*
Логика          #6b9eb8 
Счёт            #a3c47e
Чтение          #d6a86a 
Внимательность  #b29dd9 
*/