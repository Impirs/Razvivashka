import React from 'react';
// SCSS is imported in main.ts

import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';

// TS providers
import { LanguageProvider } from './contexts/i18n';
import { NotificationProvider } from './contexts/notification';
import { GameStoreProvider } from './contexts/gameStore';
import { SettingsProvider } from './contexts/pref';

// TS pages
import CatalogPage from './pages/catalog/CatalogPage';
import AchievementPage from './pages/achievements/AchievementsPage';
import SettingsPage from './pages/settings/SettingsPage';
import HomePage from './pages/home/HomePage';

// Layout with game hub
import GameLayout from './layouts/GameLayout';

function GameCentralWrapper() {
	const { gameId } = useParams();
	if (!gameId) return null;
	return <GameLayout gameId={gameId} />;
}

function App() {
	return (
		<SettingsProvider>
		<LanguageProvider>
		<GameStoreProvider>
			<Router>
				<NotificationProvider>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/catalog" element={<CatalogPage />} />
					<Route path="/catalog/:gameId" element={<GameCentralWrapper />} />
					<Route path="/settings" element={<SettingsPage />} />
					<Route path="/achievements" element={<AchievementPage />} />
				</Routes>
					{/* Notification component */}
				</NotificationProvider>
			</Router>
		</GameStoreProvider>
		</LanguageProvider>
		</SettingsProvider>
	);
}

export default App;
