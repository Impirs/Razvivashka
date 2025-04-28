import React from "react";
import './styles/main.scss';

import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { LanguageProvider } from "./lang_provider";
import AchievementPage from "./components/pages/achievements/ach_page";
import CatalogPage from "./components/pages/catalog/ctg_page";
import SettingsPage from "./components/pages/settings/stg_page";
import HomePage from "./components/pages/menu";

import MainLayout from "./components/layouts/primary";
import SecondaryLayout from "./components/layouts/secondary";
import GameCentralLayout from "./components/layouts/game_central";

function GameCentralWrapper() {
    const { gameId } = useParams();
    return (
        <GameCentralLayout gameId={gameId}/>
    );
}

function App() {
    return (
        <LanguageProvider>
            <Router>
                <Routes>
                    {/* Main */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                    </Route>
                    {/* Games */}
                    <Route element={<SecondaryLayout pageType="catalog" />}>
                        <Route path="/catalog" element={<CatalogPage />} />
                    </Route>
                    <Route path="/catalog/:gameId" element={<GameCentralWrapper />} />
                    {/* Settings */}
                    <Route element={<SecondaryLayout pageType="settings" />}>
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                    {/* Achievements */}
                    <Route element={<SecondaryLayout pageType="achievements" />}>
                        <Route path="/achievements" element={<AchievementPage />} />
                    </Route>
                </Routes>
            </Router>
        </LanguageProvider>
    );
}

export default App;