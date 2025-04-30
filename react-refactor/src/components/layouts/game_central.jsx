import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import GameLeftPanel from "../gameplay/left_panel";
import GameMainPanel from "../gameplay/central_panel";
import ScoreSection from "../gameplay/score_section";
import NavButton from "../buttons/nav_btn";
import usei18n from "../../hooks/usei18n";

const GameCentralLayout = ({ gameId }) => {
    const [gameTitle, setTitle] = useState("");
    const [settings, setSettings] = useState(null);
    const [activeSettings, setActiveSettings] = useState(null);
    const [started, setStarted] = useState(false);
    const [justAddedRecord, setJustAddedRecord] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { t } = usei18n();

    useEffect(() => {
        const stack = JSON.parse(sessionStorage.getItem('navStack') || '[]');
        if (stack[stack.length - 1] !== location.pathname) {
            stack.push(location.pathname);
            sessionStorage.setItem('navStack', JSON.stringify(stack));
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchTranslation = async () => {
            if (!t || !gameId) return;
            const translation = await t(`game_${gameId}`);
            setTitle(translation);
        };
        fetchTranslation();
    }, [t, gameId]);

    useEffect(() => {
        if (justAddedRecord) {
            const timer = setTimeout(() => setJustAddedRecord(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [justAddedRecord]);

    const handleBack = () => {
        const stack = JSON.parse(sessionStorage.getItem('navStack') || '[]');
        if (stack.length > 1) {
            stack.pop();
            const prev = stack[stack.length - 1];
            sessionStorage.setItem('navStack', JSON.stringify(stack));
            if (prev === "/") {
                sessionStorage.setItem('navStack', JSON.stringify(["/"]));
            }
            navigate(prev);
        } else {
            sessionStorage.setItem('navStack', JSON.stringify(["/"]));
            navigate('/');
        }
    };

    const handleSecond = () => {
        navigate('/settings');
    };

    const handleStart = () => {
        setActiveSettings(settings);
        setStarted(true);
    };

    const handleGameEnd = () => {
        setStarted(false);
    };

    const handleNewRecord = (record) => {
        setJustAddedRecord(record);
    };

    return (
        <div className="game-central-layout">
            <div className="game-header">
                <NavButton id="back" value="" onClick={handleBack} />
                <h1>{gameTitle}</h1>
                <NavButton id="settings" value="" onClick={handleSecond} />
            </div>
            <div className="game-content">
                <aside className="game-side left">
                    <GameLeftPanel
                        gameId={gameId}
                        onStart={handleStart}
                        setSettings={setSettings}
                        settings={settings}
                    />
                </aside>
                <main className="game-main">
                    <GameMainPanel
                        gameId={gameId}
                        settings={activeSettings}
                        started={started}
                        onGameEnd={handleGameEnd}
                        onNewRecord={handleNewRecord}
                    />
                </main>
                <aside className="game-side right">
                    <ScoreSection
                        gameId={gameId}
                        settings={settings}
                        justAddedRecord={justAddedRecord}
                    />
                </aside>
            </div>
        </div>
    );
};

export default GameCentralLayout;