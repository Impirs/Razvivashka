import React, {useState, useEffect} from "react";

function List({ data, onItemClick }) {
    return(
        <div className="ctrl-list">
            {data.map((item, index) => (
                <div key={index} className="list-item" 
                     onClick={() => onItemClick(item)}
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