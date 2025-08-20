import React from 'react';
// SCSS is imported in main.ts

import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';

// TS providers
import { LanguageProvider } from './contexts/i18n';
import { NotificationProvider } from './contexts/notifProvider';
import { GameStoreDataProvider } from './contexts/gameStoreData';
import { GameStoreActionsProvider } from './contexts/gameStoreActions';
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
		</>
	);
}

function App() {
	return (
		<SettingsProvider>
			<LanguageProvider>
				<Router>
					<div style={{ display: 'contents' }}>
						{/* Game data and actions - separated for better performance */}
						<GameStoreDataProvider>
							<GameStoreActionsProvider>
								{/* Notification system - isolated from game data */}
								<NotificationProvider>
									<AppContent />
									<NotificationDisplay />
								</NotificationProvider>
							</GameStoreActionsProvider>
						</GameStoreDataProvider>
					</div>
				</Router>
			</LanguageProvider>
		</SettingsProvider>
	);
}

export default App;
