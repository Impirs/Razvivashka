import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/button/button';
import { useLanguage } from '@/contexts/i18n';

const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useLanguage();

	const onPlay = () => navigate('/catalog');
	const onAchievements = () => navigate('/achievements');
	const onSettings = () => navigate('/settings');
	const onExit = () => {
		// Electron app quit if available; no-op in web/tests
		const api = (window as any).electronAPI;
		if (api?.quitApp) api.quitApp();
	};

	return (
		<div className="page-content">
			<div className="container-content">
				<h1>{t('routes.home' as any)}</h1>
				<div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
					<Button aria-label="nav-play" onClick={onPlay}>{t('buttons.play' as any)}</Button>
					<Button aria-label="nav-achievements" onClick={onAchievements}>{t('routes.achievements' as any)}</Button>
					<Button aria-label="nav-settings" onClick={onSettings}>{t('routes.settings' as any)}</Button>
					<Button aria-label="nav-exit" onClick={onExit}>{t('buttons.close' as any)}</Button>
				</div>
			</div>
		</div>
	);
};

export default HomePage;

