import React from "react";
import './styles/icons.module.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AchievementPage from "./components/pages/achievements/ach_page";
import CatalogPage from "./components/pages/catalog/ctg_page";
import SettingsPage from "./components/pages/settings/stg_page";
import HomePage from "./components/pages/Menu";

import MainLayout from "./components/layouts/primary";
import SecondaryLayout from "./components/layouts/secondary";

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={ <HomePage /> } />
                </Route>
                <Route element={<SecondaryLayout/>}>
                    <Route path="/catalog" element={ <CatalogPage/> } />
                    {/* <Route path="/catalog/:gameID" element={ <Container /> } /> */}
                </Route>
                <Route element={<SecondaryLayout/>}>
                    <Route path="/settings" element={ <SettingsPage/> } />
                </Route>
                <Route element={<SecondaryLayout/>}>
                    <Route path="/achievements" element={ <AchievementPage/> } />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;