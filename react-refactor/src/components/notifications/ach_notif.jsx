import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/notifications/achieve.scss";

const AchNotif = ({ achievement }) => {
    const navigate = useNavigate();

    if (!achievement) return null;

    const handleClick = () => {
        navigate("/achievements");
    };

    return (
        <div className={`achievement-notification rank_${achievement.rank}`} onClick={handleClick}>
            <div className="achievement-icon" />
            <div className="achievement-info">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
            </div>
        </div>
    );
};

export default AchNotif;