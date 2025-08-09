import React, { useMemo, useState } from 'react';
import achievementsData from '@/data/achievements.json';
import { useLanguage } from '@/contexts/i18n';

interface AchRow {
  gameId: string;
  gameProps: string;
  requirements: number[];
}

const AchievementsPage: React.FC = () => {
    const { t } = useLanguage();
    const [selectedGame, setSelectedGame] = useState<string>('all');

    const games = useMemo(() => {
        const set = new Set<string>(['all']);
        (achievementsData as AchRow[]).forEach(a => set.add(a.gameId));
        return Array.from(set);
    }, []);

    const rows = useMemo(() => {
        const all = achievementsData as AchRow[];
        return selectedGame === 'all' ? all : all.filter(a => a.gameId === selectedGame);
    }, [selectedGame]);

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
        return `${base}${needsSpace ? ' ' : ''}${firstReq} ${secondsLabel}`;
    };

    return (
        <div className="page-content">
            <div className="container-header">
                <div />
                <div />
                <div style={{ justifySelf: 'center' }}>
                    <select
                      aria-label="game-filter"
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                    >
                        {games.map(g => (
                          <option key={g} value={g}>
                            {g === 'all' ? t('games.all' as any) : t(`games.${g}` as any)}
                          </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="container-content">
                <ul>
                    {rows.map((r, idx) => (
                      <li key={`${r.gameId}-${r.gameProps}-${idx}`}>
                        <div style={{ fontWeight: 600 }}>{getTitle(r)}</div>
                        <div style={{ opacity: 0.85 }}>{getDescription(r)}</div>
                      </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AchievementsPage;
