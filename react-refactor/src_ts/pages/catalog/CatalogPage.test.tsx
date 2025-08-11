import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CatalogPage from './CatalogPage';
import { LanguageProvider } from '@/contexts/i18n';

test('renders catalog and filters by type', () => {
    render(
        <LanguageProvider>
            <MemoryRouter>
                <CatalogPage />
            </MemoryRouter>
        </LanguageProvider>
    );

    // GameBadge renders as <a> links to /catalog/:id; count anchors with that href pattern
    const getCount = () =>
        screen
            .queryAllByRole('link')
            .filter((a) => (a as HTMLAnchorElement).getAttribute('href')?.startsWith('/catalog/'))
            .length;

    // by default shows both games
    expect(getCount()).toBe(2);

    const select = screen.getByLabelText('catalog-filter');

    // filter by math => only Digit
    fireEvent.change(select, { target: { value: 'math' } });
    expect(getCount()).toBe(1);

    // filter by attention => Digit and Shulte
    fireEvent.change(select, { target: { value: 'attention' } });
    expect(getCount()).toBe(2);

    // filter by reading => none
    fireEvent.change(select, { target: { value: 'reading' } });
    expect(getCount()).toBe(0);
});
