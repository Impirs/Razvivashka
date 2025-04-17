import React, {useState, useEffect} from "react";

function List({ data, dataValue, onItemClick }) {
    return(
        <div className="ctrl-list">
            {data.map((item, index) => (
                <div key={index} className="list-item" 
                     onClick={() => onItemClick(dataValue[index])}
                     style={{cursor: "pointer"}}>
                    <h2>
                        {item}
                    </h2>
                </div>
            ))}
        </div>
    );
}

export default List;