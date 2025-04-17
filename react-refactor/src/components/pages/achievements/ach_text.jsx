import React, { useEffect, useState } from "react";
import usei18n from "../../../hooks/usei18n";

const AchievementText = React.memo(({ game, tag, ranks, unlocked }) => {
    const { t } = usei18n();
    const [title, setTitle] = useState("Tilte");
    const [description, setDes] = useState("descrition");
    const [timetag, setTimetag] = useState("");
    const [count, setCount] = useState("");
    const [opened, setOpened] = useState(0);

    useEffect(() => {
        const fetchText = async () => {
            const translatedTitle = await t(`${tag}_title`);
            const translatedDes = await t(`${tag}_des`);
            const translatedTime = await t("seconds");
            const translatedCount = await t("count");

            setTitle(translatedTitle);
            setTimetag(translatedTime);
            setCount(translatedCount);
            setDes(generateDes(game, translatedDes));
        };

        lastUnlockedAchRank(ranks, unlocked );
        fetchText();
    }, [tag, t]);

    function lastUnlockedAchRank( numbers, bool ){
        let lastNumber = numbers[numbers.length - 1];
        for (let i = 0; i < numbers.length; i++) {
            if (bool[i] === true){
                setOpened(numbers[i]);
            }
        }
        setOpened(lastNumber);
    }

    function generateDes(game, tagtext) {
        switch (game){
            case 'digit':
                if (ranks[0] === 10000 || ranks[0] === 20000) {
                    return `${tagtext}`;
                } else {
                    return `${tagtext} ${opened} ${timetag}.`;
                }
            case 'shulte':
                return `${tagtext} ${opened} ${timetag}.`;
            case 'syllable':
                return `${tagtext} ${opened} ${count}.`;
            default:
                return "Игра не была распознана для отображения описания достижения.";
        }
    }

    return (
        <div className="achievement-text">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
});

export default AchievementText;