import React, { useEffect, useState } from 'react';
import GameSetting from '@/components/gamesetting/gamesetting';
import Button from '@/components/button/button';
import { useLanguage } from '@/contexts/i18n';
import type { QueensSettings } from './types/game_queens';

interface QueensMenuProps {
	onStart: (settings: QueensSettings) => void;
	onChangeSettings?: (settings: QueensSettings) => void;
	initialSettings?: QueensSettings;
}

function QueensMenu({ onStart, onChangeSettings, initialSettings }: QueensMenuProps) {
	const [size, setSize] = useState<4|5|6|7|8>(initialSettings?.size ?? 4);
	const { t } = useLanguage();

	useEffect(() => {
		onChangeSettings?.({ size });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [size]);

	const sizes: (4|5|6|7|8)[] = [4,5,6,7,8];

	return (
		<div className="game-menu">
			<h2>{t('game-menu.setup')}</h2>
			<GameSetting
				title={t('game-menu.shulte.size')}
				options={sizes.map(v => ({ key: v, label: `${v}` }))}
				selected={size}
				onChange={(k) => setSize(Number(k) as any)}
			/>
			<Button className="game-button" onClick={() => onStart({ size })}>
				{t('buttons.start')}
			</Button>
		</div>
	);
}

export default QueensMenu;

