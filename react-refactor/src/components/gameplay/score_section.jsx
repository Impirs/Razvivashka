import React, { useState, useRef, useEffect } from "react";
import DeletePopup from "../buttons/delete_btn";
import { useStorageContext } from "../../provider_storage";

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

const ScoreSection = ({ gameId, settings }) => {
    const { highscores , removeScore } = useStorageContext();
    const sectionRef = useRef(null);

    let scoreId = null;
    if (gameId === "digit" && settings?.target && settings?.size) {
        scoreId = `${settings.size}x${settings.target}`;
    }
    if (gameId === "shulte" && settings?.size) {
        scoreId = `${settings.size}x${settings.size}`;
    }

    const records = highscores?.[gameId]?.[scoreId] || [];

    // Новое состояние для popup: { idx, top, left }
    const [deletePopup, setDeletePopup] = useState(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (sectionRef.current && !sectionRef.current.contains(e.target)) {
                setDeletePopup(null);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleDelete = (idx) => {
        if (!records[idx]) return;
        if (removeScore) {
            const rec = records[idx];
            removeScore(gameId, scoreId, rec.score, rec.date);
        }
        setDeletePopup(null);
    };

    // Получаем координаты для popup
    const handleContextMenu = (e, idx) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        // Смещение относительно .game-content
        const parent = document.querySelector('.game-content');
        const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 };
        setDeletePopup({
            idx,
            top: rect.top + rect.height/5,
            left: rect.right + 5
        });
    };

    return (
        <section className="score_section" ref={sectionRef}>
            <h2>Рекорды:</h2>
            <div className="score_table">
                {records.length === 0 ? (
                    <span className="warn-msg">Рекордов не найдено</span>
                ) : (
                    <div className="scroll-container">
                        <div className="the-scroll">
                            {records.map((rec, idx) => (
                                <div
                                    className="record-container"
                                    key={idx}
                                    onContextMenu={e => handleContextMenu(e, idx)}
                                    style={{ position: "relative" }}
                                >
                                    <div className="score-info-container">
                                        <h3>{rec.name || "Игрок"}</h3>
                                        <span>{rec.date || "?"}</span>
                                    </div>
                                    <div className="score-container-score">
                                        {formatTime(rec.score)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Popup вне scroll-контейнера, но внутри .score_section */}
            {deletePopup && (
                <DeletePopup
                    onFinish={() => handleDelete(deletePopup.idx)}
                    onCancel={() => setDeletePopup(null)}
                    style={{
                        position: "absolute",
                        top: deletePopup.top,
                        left: deletePopup.left,
                        zIndex: 1000
                    }}
                />
            )}
        </section>
    );
};

export default ScoreSection;