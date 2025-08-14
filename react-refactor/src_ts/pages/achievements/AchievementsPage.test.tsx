import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { within } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import AchievementsPage from './AchievementsPage';
import { LanguageProvider } from '@/contexts/i18n';
import { SettingsProvider } from '@/contexts/pref';
import achievementsData from '@/data/achievements.json';

// Settings shim for tests
(() => {
    if ((window as any).settingsAPI) return;
    const store: any = {
        volume: { notifications: 0.25, effects: 0.25 },
        language: 'ru',
        currentUser: 'user',
        games: { digit: { view_modification: true }, shulte: { view_modification: true } },
    };
    const listeners = new Set<(k: string, v: any) => void>();
    (window as any).settingsAPI = {
        getAll: () => JSON.parse(JSON.stringify(store)),
        get: (k: string) => store[k],
        set: (k: string, v: any) => { store[k] = v; listeners.forEach(cb => cb(k, v)); },
        subscribe: (cb: any) => { listeners.add(cb); return () => listeners.delete(cb); },
    };
})();

test('filters achievements by game', () => {
    render(
        <SettingsProvider>
            <LanguageProvider>
                <MemoryRouter>
                    <AchievementsPage />
                </MemoryRouter>
            </LanguageProvider>
        </SettingsProvider>
    );

    const allCount = (achievementsData as any[]).length;
    const countFor = (gameId: string) => (achievementsData as any[]).filter(a => a.gameId === gameId).length;

    // Initially shows all achievements
    expect(screen.getAllByRole('listitem')).toHaveLength(allCount);

    // Select digit only
    const combo = screen.getByRole('combobox', { name: 'game-filter' });
    fireEvent.click(combo);
    fireEvent.click(screen.getByRole('option', { name: 'Состав числа' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(countFor('digit'));

    // Select shulte only
    fireEvent.click(combo);
    fireEvent.click(screen.getByRole('option', { name: 'Таблица Шульте' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(countFor('shulte'));
});

test('renders 3 medals (gold, silver, bronze) for 3-tier achievements and all are locked without user data', () => {
    render(
        <SettingsProvider>
            <LanguageProvider>
                <MemoryRouter>
                    <AchievementsPage />
                </MemoryRouter>
            </LanguageProvider>
        </SettingsProvider>
    );

    const items = screen.getAllByRole('listitem');
    // Find the first item that has 3 trophies
    const threeTierItem = items.find(li => within(li).getByLabelText('achievement-trophies').querySelectorAll('.trophy').length === 3);
    expect(threeTierItem).toBeTruthy();
    const trophies = within(threeTierItem as HTMLElement).getByLabelText('achievement-trophies').querySelectorAll('.trophy');
    expect(trophies.length).toBe(3);
    // Order should be gold, silver, bronze
    expect((trophies[0] as HTMLElement).className).toContain('gold');
    expect((trophies[1] as HTMLElement).className).toContain('silver');
    expect((trophies[2] as HTMLElement).className).toContain('bronze');
    // No store/user in this test => all should be locked
    expect(Array.from(trophies).every(t => (t as HTMLElement).className.includes('locked'))).toBe(true);
});

test('renders 1 medal (gold) for 1-tier achievements', () => {
    render(
        <SettingsProvider>
            <LanguageProvider>
                <MemoryRouter>
                    <AchievementsPage />
                </MemoryRouter>
            </LanguageProvider>
        </SettingsProvider>
    );

    // Narrow to a game that has single-tier achievements
    const combo = screen.getByRole('combobox', { name: 'game-filter' });
    fireEvent.click(combo);
    fireEvent.click(screen.getByRole('option', { name: 'Состав числа' }));

    const items = screen.getAllByRole('listitem');
    const singleTier = items.find(li => within(li).getByLabelText('achievement-trophies').querySelectorAll('.trophy').length === 1);
    expect(singleTier).toBeTruthy();
    const only = within(singleTier as HTMLElement).getByLabelText('achievement-trophies').querySelector('.trophy') as HTMLElement;
    expect(only).toBeTruthy();
    expect(only.className).toContain('gold');
    expect(only.className).toContain('locked');
});
