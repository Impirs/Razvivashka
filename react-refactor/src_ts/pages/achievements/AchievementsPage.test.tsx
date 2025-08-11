import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { within } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import AchievementsPage from './AchievementsPage';
import { LanguageProvider } from '@/contexts/i18n';
import achievementsData from '@/data/achievements.json';

test('filters achievements by game', () => {
    render(
        <LanguageProvider>
            <MemoryRouter>
                <AchievementsPage />
            </MemoryRouter>
        </LanguageProvider>
    );

    const allCount = (achievementsData as any[]).length;
    const countFor = (gameId: string) => (achievementsData as any[]).filter(a => a.gameId === gameId).length;

    // Initially shows all achievements
    expect(screen.getAllByRole('listitem')).toHaveLength(allCount);

    // Select digit only
    const select = screen.getByLabelText('game-filter');
    fireEvent.change(select, { target: { value: 'digit' } });
    expect(screen.getAllByRole('listitem')).toHaveLength(countFor('digit'));

    // Select shulte only
    fireEvent.change(select, { target: { value: 'shulte' } });
    expect(screen.getAllByRole('listitem')).toHaveLength(countFor('shulte'));
});

test('renders 3 medals (gold, silver, bronze) for 3-tier achievements and all are locked without user data', () => {
    render(
        <LanguageProvider>
            <MemoryRouter>
                <AchievementsPage />
            </MemoryRouter>
        </LanguageProvider>
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
        <LanguageProvider>
            <MemoryRouter>
                <AchievementsPage />
            </MemoryRouter>
        </LanguageProvider>
    );

    // Narrow to a game that has single-tier achievements
    const select = screen.getByLabelText('game-filter');
    fireEvent.change(select, { target: { value: 'digit' } });

    const items = screen.getAllByRole('listitem');
    const singleTier = items.find(li => within(li).getByLabelText('achievement-trophies').querySelectorAll('.trophy').length === 1);
    expect(singleTier).toBeTruthy();
    const only = within(singleTier as HTMLElement).getByLabelText('achievement-trophies').querySelector('.trophy') as HTMLElement;
    expect(only).toBeTruthy();
    expect(only.className).toContain('gold');
    expect(only.className).toContain('locked');
});
