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
		<div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<div className="menu-card">
				<h1>{t('routes.home' as any)}</h1>
				{/* Optional mascot slot — add an image in src_ts/assets/images and set src here if needed */}
				{/* <img className={sty.menuLogo} src={new URL('@/assets/images/mascot.png', import.meta.url).toString()} alt="" /> */}
				<div>
					<Button aria-label="nav-play" onClick={onPlay} leftIcon="play" size="large">
						{t('buttons.play' as any)}
					</Button>
					<Button aria-label="nav-achievements" onClick={onAchievements} leftIcon="medal" size="large">
						{t('routes.achievements' as any)}
					</Button>
					<Button aria-label="nav-settings" onClick={onSettings} leftIcon="settings" size="large">
						{t('routes.settings' as any)}
					</Button>
					<Button aria-label="nav-exit" onClick={onExit} leftIcon="exit" size="large">
						{t('buttons.close' as any)}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default HomePage;

