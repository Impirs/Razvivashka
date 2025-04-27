import React from "react";
import './styles/main.scss';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AchievementPage from "./components/pages/achievements/ach_page";
import CatalogPage from "./components/pages/catalog/ctg_page";
import SettingsPage from "./components/pages/settings/stg_page";
import HomePage from "./components/pages/menu";

import MainLayout from "./components/layouts/primary";
import SecondaryLayout from "./components/layouts/secondary";
import GameCentralLayout from "./components/layouts/game_central";

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={ <HomePage /> } />
                </Route>
                <Route element={<SecondaryLayout pageType="catalog"/>}>
                    <Route path="/catalog" element={ <CatalogPage/> } />
                    <Route element={<GameCentralLayout />}>
                        <Route path="/catalog/digit" element={ <Container /> } />
                        <Route path="/catalog/shulte" element={ <Container /> } />
                    </Route>
                    {/* <Route path="/catalog/:gameID" element={ <Container /> } /> */}
                </Route>
                <Route element={<SecondaryLayout pageType="settings"/>}>
                    <Route path="/settings" element={ <SettingsPage/> } />
                </Route>
                <Route element={<SecondaryLayout pageType="achievements"/>}>
                    <Route path="/achievements" element={ <AchievementPage/> } />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;