import React, { useEffect, useMemo, useState } from 'react';
import achievementsData from '@/data/achievements.json';
import { useLanguage } from '@/contexts/i18n';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/button/button';
import Select from '@/components/select/select';
import Icon from '@/components/icon/icon';
import { useGameStore } from '@/contexts/gameStore';

interface AchRow {
  gameId: string;
  gameProps: string;
  requirements: number[];
}

// Optional GameStore access (component still works without provider, useful for tests)
function useOptionalGameStore() {
    try {
        return useGameStore();
    } catch {
        return null;
    }
}

function AchievementsPage() {
    const { t } = useLanguage();
    const [selectedGame, setSelectedGame] = useState<string>('all');
    const gameStore = useOptionalGameStore();
    const currentUser = gameStore?.currentUser ?? null;

    const games = useMemo(() => {
        const set = new Set<string>(['all']);
        (achievementsData as AchRow[]).forEach(a => set.add(a.gameId));
        return Array.from(set);
    }, []);

    const rows = useMemo(() => {
        const all = achievementsData as AchRow[];
        return selectedGame === 'all' ? all : all.filter(a => a.gameId === selectedGame);
    }, [selectedGame]);

    // Register achievements in store (grouped by game) once when store is available
    useEffect(() => {
        if (!gameStore) return;
        if (Object.keys(gameStore.allAchievements).length > 0) return;
        const grouped = new Map<string, AchRow[]>();
        (achievementsData as AchRow[]).forEach(a => {
            const arr = grouped.get(a.gameId) ?? [];
            arr.push(a);
            grouped.set(a.gameId, arr);
        });
        grouped.forEach((list, gameId) => {
            gameStore.addGameAchievements(
                gameId,
                list.map(l => ({ gameId: l.gameId, gameProps: l.gameProps, requirements: l.requirements })) as any
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStore]);

    // Resolve translation by trying plural (achievements) first, then singular (achievement)
    const translateWithFallback = (keys: string[]): string => {
        for (const key of keys) {
            const val = t(key as any) as unknown as string;
            if (val && val !== key) return val;
        }
        // If nothing translated, return the last key to surface an obvious placeholder
        return keys[keys.length - 1] ?? '';
    };

    const getTitle = (row: AchRow) =>
        translateWithFallback([
            `achievements.${row.gameId}.${row.gameProps}.title`,
            `achievement.${row.gameId}.${row.gameProps}.title`,
        ]);

    const getDescription = (row: AchRow) => {
        const base = translateWithFallback([
            `achievements.${row.gameId}.${row.gameProps}.description`,
            `achievement.${row.gameId}.${row.gameProps}.description`,
        ]);
        const trimmed = base.trim();
        if (trimmed.endsWith('.')) return base; // already a full sentence
        const secondsLabel = t('record.seconds' as any) as unknown as string;
        const firstReq = row.requirements?.[0];
        // If there's no requirement, just return base to avoid dangling text
        if (firstReq == null) return base;
        // Preserve trailing space if present, otherwise add one
        const needsSpace = base.length > 0 && !/[\s]$/.test(base);
        return `${base}${needsSpace ? ' ' : ''}${firstReq} ${secondsLabel}.`;
    };

    // Build a quick lookup for user achievements by key "gameId|gameProps"
    const userAchByKey = useMemo(() => {
        const map = new Map<string, boolean[]>();
        const list = currentUser?.achievements ?? [];
        for (const a of list) map.set(`${a.gameId}|${a.gameProps}`, Array.isArray(a.unlockedTiers) ? a.unlockedTiers : []);
        return map;
    }, [currentUser?.achievements]);

    // Ensure unlocked array matches the requirements length for a row
    const normalizeUnlocked = (key: string, reqCount: number): boolean[] => {
        const src = userAchByKey.get(key) ?? [];
        const trimmed = src.slice(0, reqCount);
        return trimmed.length < reqCount
            ? trimmed.concat(new Array(reqCount - trimmed.length).fill(false))
            : trimmed;
    };

    // Map how many medals to show and in which visual order; we display highest tier first
    const visualOrderForCount = (count: number): { variants: Array<'gold' | 'silver' | 'bronze'>; idxMap: number[] } => {
        // requirements and unlockedTiers are both [gold, silver, bronze] in this app
        if (count >= 3) return { variants: ['gold', 'silver', 'bronze'], idxMap: [0, 1, 2] };
        if (count === 2) return { variants: ['gold', 'silver'], idxMap: [0, 1] };
        return { variants: ['gold'], idxMap: [0] };
    };

    const navigate = useNavigate();
    return (
        <div className='page-layout'>
            <div className="page-content">
                <div className="container-header">
                    <div style={{ justifySelf: 'start' }}>
                        <Select
                            ariaLabel="game-filter"
                            translationKeyPrefix='games'
                            options={games}
                            value={selectedGame}
                            onValueChange={setSelectedGame}
                        />
                    </div>
                    <div>
                        <h1>{t('routes.achievements' as any)}</h1>
                    </div>
                    <div style={{ justifySelf: 'end' }}>
                        <Button aria-label="nav-back" 
                                size="small" 
                                leftIcon="left" 
                                className='nav-button'
                                onClick={() => navigate(-1)} />
                        <Button aria-label="nav-home"
                                size="small"
                                leftIcon="home"
                                className='nav-button'
                                onClick={() => navigate('/')} />
                    </div>
                </div>
                <div className="container-content" style={{marginTop: '18px', padding: '0 35px'}}>
                    <ul className="achievement-list">
                        {rows.map((r, idx) => {
                            const key = `${r.gameId}|${r.gameProps}`;
                            const unlocked = normalizeUnlocked(key, r.requirements?.length ?? 0);
                            const { variants, idxMap } = visualOrderForCount(r.requirements?.length ?? 0);
                            return (
                                <li key={`${r.gameId}-${r.gameProps}-${idx}`} className="achievement">
                                    <div className="trophies" aria-label="achievement-trophies">
                                        {variants.map((variant, i) => {
                                            const achieved = unlocked[idxMap[i]] ?? false;
                                            const cls = `trophy ${variant}${achieved ? '' : ' locked'}`;
                                            const size = variant === 'gold' ? 80 : variant === 'silver' ? 70 : 60;
                                            // Use masked Icon so color/background comes from CSS class
                                            return (
                                                <Icon
                                                    key={`${key}-${variant}-${i}`}
                                                    name="medal"
                                                    masked
                                                    className={cls}
                                                    size={size}
                                                    aria-hidden={true}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="achievement-text">
                                        <h3>{getTitle(r)}</h3>
                                        <p>{getDescription(r)}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AchievementsPage;
