import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/button/button';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';

const HomePage = React.memo(() => {
	const navigate = useNavigate();
	const t = useTranslationFunction(); // Optimized: only translation function

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
				{/* TODO: mascot slot — add an image in src_ts/assets/images and set src here if needed */}
				{/* <img className={sty.menuLogo} src={new URL('@/assets/images/mascot.png', import.meta.url).toString()} alt="" /> */}
				<div>
					<Button aria-label="nav-play" onClick={onPlay} leftIcon="play" className='nav-button' size="large">
						{t('buttons.play' as any)}
					</Button>
					<Button aria-label="nav-achievements" onClick={onAchievements} leftIcon="medal" className='nav-button' size="large">
						{t('routes.achievements' as any)}
					</Button>
					<Button aria-label="nav-settings" onClick={onSettings} leftIcon="settings" className='nav-button' size="large">
						{t('routes.settings' as any)}
					</Button>
					<Button aria-label="nav-exit" onClick={onExit} leftIcon="exit" className='nav-button' size="large">
						{t('buttons.close' as any)}
					</Button>
				</div>
			</div>
		</div>
	);
});

HomePage.displayName = 'HomePage';

export default HomePage;

