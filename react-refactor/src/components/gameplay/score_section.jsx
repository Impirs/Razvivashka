import React, { useState, useRef, useEffect } from "react";
import DeletePopup from "../buttons/delete_btn";
import { useStorageContext } from "../../contexts/provider_storage";

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}: ${sec.toString().padStart(2, "0")}`;
}

function getRecordKey(rec) {
    return `${String(rec.score)}_${String(rec.date)}`;
}

const ScoreSection = ({ gameId, settings, justAddedRecord }) => {
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

    const [deletePopup, setDeletePopup] = useState(null);
    const [newScoreKey, setNewScoreKey] = useState(null);

    useEffect(() => {
        if (justAddedRecord) {
            const key = getRecordKey(justAddedRecord);
            setNewScoreKey(key);
            const timer = setTimeout(() => setNewScoreKey(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [justAddedRecord]);

    const handleDelete = (idx) => {
        if (!records[idx]) return;
        if (removeScore) {
            const rec = records[idx];
            removeScore(gameId, scoreId, rec.score, rec.date);
        }
        setDeletePopup(null);
    };

    const handleContextMenu = (e, idx) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
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
                            {records.map((rec, idx) => {
                                const recKey = getRecordKey(rec);
                                return (
                                    <div
                                        className={`record-container ${recKey === newScoreKey ? "new-score" : ""}`}
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
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
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