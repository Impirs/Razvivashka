import React, { useMemo, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/i18n';
import { Link } from 'react-router-dom';

type GameMeta = {
    id: string;
    title: string;
    type: string[];
};

// Catalog of games with metadata
const GAMES: GameMeta[] = [
    { id: 'digit', title: 'Digit', type: ['math', 'attention'] },
    { id: 'shulte', title: 'Shulte', type: ['attention'] },
];

const TYPES = ['all', 'math', 'attention', 'logic', 'reading'] as const;

const CatalogPage: React.FC = () => {
    const [filter, setFilter] = useState<(typeof TYPES)[number]>('all');
    const { t } = useLanguage();

    const options = TYPES;

    const gamesMeta = useMemo(() => {
        if (filter === 'all') return GAMES;
        return GAMES.filter(g => g.type.includes(filter));
    }, [filter]);

    const handleFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter(e.target.value as (typeof TYPES)[number]);
    }, []);

    return (
        <div className="page-content">
            <div className="container-header">
                <div />
                <div />
                <div style={{ justifySelf: 'end' }}>
                    <label>
                        {t('buttons.filter')}:
                        <select aria-label="catalog-filter" value={filter} onChange={handleFilter}>
                            {options.map(opt => (
                                <option key={opt} value={opt}>{t(`types.${opt}`)}</option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
            <div className="container-content">
                <ul>
                    {gamesMeta.map(game => (
                        <li key={game.id}>
                            <Link to={`/catalog/${game.id}`}>{t(`games.${game.id}` as any)}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CatalogPage;
