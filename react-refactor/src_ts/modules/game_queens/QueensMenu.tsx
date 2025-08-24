import React, { useEffect, useState, useMemo, useCallback } from 'react';
import GameSetting from '@/components/gamesetting/gamesetting';
import Button from '@/components/button/button';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';
import type { QueensSettings } from './types/game_queens';

interface QueensMenuProps {
	onStart: (settings: QueensSettings) => void;
	onChangeSettings?: (settings: QueensSettings) => void;
	initialSettings?: QueensSettings;
}

const QueensMenu = React.memo<QueensMenuProps>(({ onStart, onChangeSettings, initialSettings }) => {
	const [size, setSize] = useState<4|5|6|7|8>(initialSettings?.size ?? 4);
	const t = useTranslationFunction(); 

	// Notify parent about settings change
	useEffect(() => {
		onChangeSettings?.({ size });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [size]);

	// Memoized available sizes
	const availableSizes = useMemo(() => [4, 5, 6, 7, 8] as const, []);

	// Memoized options for sizes
	const sizeOptions = useMemo(() => 
		availableSizes.map(v => ({ key: v, label: `${v}` })), [availableSizes]
	);

	// Memoized handlers
	const handleSizeChange = useCallback((k: string | number) => {
		setSize(Number(k) as 4|5|6|7|8);
	}, []);

	const handleStart = useCallback(() => {
		onStart({ size });
	}, [onStart, size]);

	return (
		<div className="game-menu">
			<h2>{t('game-menu.setup')}</h2>
			<GameSetting
				title={t('game-menu.shulte.size')}
				options={sizeOptions}
				selected={size}
				onChange={handleSizeChange}
			/>
			<Button 
				className="game-button" 
				onClick={handleStart}
			>
				{t('buttons.start')}
			</Button>
		</div>
	);
});

QueensMenu.displayName = 'QueensMenu';

export default QueensMenu;

