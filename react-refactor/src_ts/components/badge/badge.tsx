import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/i18n';

type GameMeta = {
	id: string;
	type: string[];
	title?: string; // optional override; falls back to i18n by id
};

type GameBadgeProps = {
	game: GameMeta;
	className?: string;
};

// 2-in-1: GameBadge with embedded types line (legacy TypesLine merged here)
function GameBadge({ game, className }: GameBadgeProps) {
	const { t } = useLanguage();
	const title = t(`games.${game.id}` as any);

	return (
		<Link
			to={`/catalog/${game.id}`}
			className={["game-badge", className].filter(Boolean).join(' ')}
			aria-label={title}
			style={{ cursor: 'pointer', textDecoration: 'none' }}
		>
			<div className="game-badge-img" id={`${game.id}_preview`} />
			<div className="game-types">
				{game.type.map((typeKey) => (
					<div key={`${game.id}-type-${typeKey}`} className={`game-type ${typeKey}`}>
						{t(`types.${typeKey}` as any)}
					</div>
				))}
			</div>
			<h3>{title}</h3>
		</Link>
	);
};

export default React.memo(GameBadge);