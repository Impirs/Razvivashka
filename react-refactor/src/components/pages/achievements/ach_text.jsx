import React, { useEffect, useState } from "react";
import usei18n from "../../../hooks/usei18n";

const AchievementText = React.memo(({ tag }) => {
    const { t } = usei18n();
    const [title, setTitle] = useState("Tilte");
    const [description, setDes] = useState("descrition");

    useEffect(() => {
        const fetchText = async () => {
            const translatedTitle = await t(`${tag}_title`);
            const translatedDes = await t(`${tag}_des`);
            setTitle(translatedTitle);
            setDes(translatedDes);
        };

        fetchText();
    }, [tag, t]);

    return (
        <div className="achievement-text">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
});

export default AchievementText;