import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import GameBadge from './badge';
import { LanguageProvider } from '@/contexts/i18n';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            <MemoryRouter>{ui}</MemoryRouter>
        </LanguageProvider>
    );
};

describe('GameBadge', () => {
    const baseGame = { id: 'digit', type: ['math', 'attention'] };

    it('renders title from i18n and links to the game route', () => {
        renderWithProviders(<GameBadge game={baseGame} />);

        // Title is taken from ru.json -> games.digit => "Состав числа"
        const link = screen.getByRole('link', { name: 'Состав числа' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/catalog/digit');

        // Image preview placeholder div with id `${id}_preview`
    // Look up preview by id inside the link
    const previewById = (link as HTMLElement).querySelector('#digit_preview');
    expect(previewById).toBeTruthy();
    });

    it('renders translated types badges', () => {
        renderWithProviders(<GameBadge game={baseGame} />);

    const typesContainer = screen.getByText('Счет').closest('.game-types') as HTMLElement | null;
        expect(typesContainer).toBeInTheDocument();

    const typeEls = typesContainer ? within(typesContainer as HTMLElement).getAllByRole('generic') : [];
        // We expect at least two badges for math and attention
        expect(screen.getByText('Счет')).toBeInTheDocument();
        expect(screen.getByText('Внимательность')).toBeInTheDocument();
        expect(typeEls.length).toBeGreaterThanOrEqual(2);
    });

    it('applies extra className and uses i18n title', () => {
        renderWithProviders(
            <GameBadge game={{ ...baseGame, title: 'Custom Title' }} className="extra" />
        );

        // Link aria-label is based on i18n name, not override; find by href/class
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/catalog/digit');
        expect(link).toHaveClass('game-badge');
        expect(link).toHaveClass('extra');
        // Heading text is from i18n
        expect(within(link).getByRole('heading', { level: 3, name: 'Состав числа' })).toBeInTheDocument();
    });
});
