import React from "react";
import './styles/main.scss';

import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { LanguageProvider } from "./contexts/provider_lang";
import { NotifProvider } from "./contexts/provider_notif";
import { StorageProvider } from "./contexts/provider_storage";
import { DevFilterProvider } from "./contexts/provider_dev";

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
        <StorageProvider>
        <LanguageProvider>
        <DevFilterProvider>
            <Router>
            <NotifProvider>
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
            </NotifProvider>
            </Router>
        </DevFilterProvider>
        </LanguageProvider>
        </StorageProvider>
    );
}

export default App;