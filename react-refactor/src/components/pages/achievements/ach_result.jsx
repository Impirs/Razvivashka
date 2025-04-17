import React from "react";

function TrophyList({ ranks, unlocked }) {
    return (
        <div className="trophies">
            {ranks.map((rank, index) => {
                const isUnlocked = unlocked[index];
                const trophyClass = index === 0 ? "gold" : index === 1 ? "silver" : "bronze";

                return (
                    <div
                        id="trophy"
                        key={index}
                        className={`trophy ${trophyClass} ${isUnlocked ? "unlocked" : "locked"}`}
                    />
                );
            })}
        </div>
    );
}

export default TrophyList;