import React from 'react';
// SCSS is imported in main.ts

import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';

// TS providers
import { LanguageProvider } from './contexts/i18n';
import { NotificationProvider } from './contexts/notifProvider';
import { GameStoreProvider } from './contexts/gamestore';
import { SettingsProvider } from './contexts/pref';

// TS pages
import CatalogPage from './pages/catalog/CatalogPage';
import AchievementPage from './pages/achievements/AchievementsPage';
import SettingsPage from './pages/settings/SettingsPage';
import HomePage from './pages/home/HomePage';

// Layout with game hub
import GameLayout from './layouts/GameLayout';

// Notification component
import NotificationDisplay from './components/notification/notification';

// Update handler hook
import { useUpdateHandler } from './utils/useUpdateHandler';


function GameCentralWrapper() {
	const { gameId } = useParams();
	if (!gameId) return null;
	return <GameLayout gameId={gameId} />;
}

function AppContent() {
	// Initialize update handler
	useUpdateHandler();
	
	return (
		<>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/catalog" element={<CatalogPage />} />
				<Route path="/catalog/:gameId" element={<GameCentralWrapper />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="/achievements" element={<AchievementPage />} />
			</Routes>
			<NotificationDisplay />
		</>
	);
}

function App() {
	return (
		<SettingsProvider>
		<LanguageProvider>
			<Router>
				<NotificationProvider>
				<GameStoreProvider>
					<AppContent />
				</GameStoreProvider>
				</NotificationProvider>
			</Router>
		</LanguageProvider>
		</SettingsProvider>
	);
}

export default App;
