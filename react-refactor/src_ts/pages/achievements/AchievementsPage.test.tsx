import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AchievementsPage from './AchievementsPage';
import { LanguageProvider } from '@/contexts/i18n';
import achievementsData from '@/data/achievements.json';

test('filters achievements by game', () => {
    render(
        <LanguageProvider>
            <AchievementsPage />
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
