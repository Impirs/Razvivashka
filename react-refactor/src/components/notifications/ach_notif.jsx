import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usei18n from "../../hooks/usei18n";

import "../../styles/notifications/achieve.scss";

const AchNotif = ({ achievement }) => {
    const [trophyClass, setTrophy] = useState("");
    const [description, setDescription] = useState("");
    const [translations, setTranslations] = useState({
        unlocked: "",
        title: "",
        description: "",
        tag: ""
    })

    const navigate = useNavigate();
    const { t } = usei18n();

    if (!achievement) return null;

    useEffect(() => {
        const fetchTranslations = async () => {
            if (!t) return;

            try {
                const unlocked = await t("ach_unlocked");
                const title = await t(`ach_${achievement.game}_${achievement.id}_title`);
                const description = await t(`ach_${achievement.game}_${achievement.id}_des`);
                let tag; 
                switch (achievement.game) {
                    case "digit":
                        tag = await t("seconds");
                        break;
                    case "shulte":
                        tag = await t("seconds");
                        break;
                    case "syllable":
                        tag = await t("count");
                        break;
                }

                setTranslations({
                    unlocked,
                    title,
                    description,
                    tag
                });

                setTrophy(
                    achievement.rank === 1 ? "gold" :
                    achievement.rank === 2 ? "silver" :
                    "bronze"
                );

                // Корректная проверка id
                if (achievement.id === "7x100" || achievement.id === "9x100") {
                    setDescription(description);
                } else {
                    setDescription(`${description} ${achievement.ranks[achievement.rank - 1]} ${tag}.`);
                }
            } catch (error) {
                console.error("Error fetching translations:", error);
            }
        };

        fetchTranslations();
    }, [achievement, t])

    const handleClick = () => {
        navigate("/achievements");
    };

    return (
        <div className={`achievement-notification rank_${achievement.rank}`} onClick={handleClick}>
            <div 
                className={`achievement-icon ${trophyClass}`} 
                id="trophy"
            />
            <div className="achievement-info">
                <h3>{translations.title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
};

export default AchNotif;