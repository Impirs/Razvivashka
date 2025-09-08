import React, { useMemo, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/i18n';
import { Link, useNavigate } from 'react-router-dom';

import Button from '@/components/button/button';
import Select from '@/components/select/select';
import GameBadge from '@/components/badge/badge';

type GameMeta = {
    id: string;
    type: string[];
};

// Catalog of games with metadata
const GAMES: GameMeta[] = [
    { id: 'digit', type: ['math', 'attention'] },
    { id: 'shulte', type: ['attention'] },
    { id: 'queens', type: ['logic'] },
    { id: 'tango', type: ['logic'] },
];

const TYPES = ['all', 'math', 'attention', 'logic', 'reading'] as const;

function CatalogPage() {
    const [filter, setFilter] = useState<(typeof TYPES)[number]>('all');
    const { t } = useLanguage();
    const navigate = useNavigate();

    const options = TYPES;

    const gamesMeta = useMemo(() => {
        if (filter === 'all') return GAMES;
        return GAMES.filter(g => g.type.includes(filter));
    }, [filter]);

    const handleFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter(e.target.value as (typeof TYPES)[number]);
    }, []);

    // TODO: 
    // 1. Implement search functionality
    // 2. Implement the game sorting functionality
    // 3. Restyle the gamelist as a scrollable container

    return (
        <div className="page-layout">
            <div className="page-content">
                <div className="container-header">
                    <div style={{justifySelf: "start"}}>
                        <Select
                            ariaLabel="catalog-filter"
                            options={[...options]}
                            value={filter}
                            onValueChange={(value: string) => setFilter(value as (typeof TYPES)[number])}
                        />
                    </div>
                    <div>
                        <h1>{t('routes.catalog' as any)}</h1>
                    </div>
                    <div style={{justifySelf: "end"}}>
                        <Button aria-label="nav-back" 
                                size="small" 
                                leftIcon="left" 
                                className='nav-button'
                                onClick={() => navigate(-1)} 
                                />
                        <Button aria-label="nav-settings" 
                                size="small" 
                                leftIcon="settings" 
                                className='nav-button'
                                onClick={() => navigate('/settings')} 
                                />
                    </div>
                </div>
                <div className='container-content' style={{ padding: '35px' }}>
                    <div className="games-container">
                        {gamesMeta.map(game => (
                            <GameBadge key={game.id} game={game} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogPage;
