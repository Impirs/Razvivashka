import React from "react";
import AchievementPage from "./components/pages/achievements/ach_page";
import CatalogPage from "./components/pages/catalog/ctg_page";
import SettingsPage from "./components/pages/settings/stg_page";
import './styles/icons.module.css';

function App() {
    // <AchievementPage />
    // <CatalogPage />
    return (
        <div className="test-instrument">
            <SettingsPage />
        </div>
    );
}

export default App;