import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CatalogPage from './CatalogPage';
import { LanguageProvider } from '@/contexts/i18n';
import { SettingsProvider } from '@/contexts/pref';

// Minimal settings shim for LanguageProvider
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

test('renders catalog and filters by type', () => {
    render(
        <SettingsProvider>
            <LanguageProvider>
                <MemoryRouter>
                    <CatalogPage />
                </MemoryRouter>
            </LanguageProvider>
        </SettingsProvider>
    );

    // GameBadge renders as <a> links to /catalog/:id; count anchors with that href pattern
    const getCount = () =>
        screen
            .queryAllByRole('link')
            .filter((a) => (a as HTMLAnchorElement).getAttribute('href')?.startsWith('/catalog/'))
            .length;

    // by default shows both games
    expect(getCount()).toBe(2);

    const combo = screen.getByRole('combobox', { name: 'catalog-filter' });
    // open and select Math ("Счет") => only Digit
    fireEvent.click(combo);
    fireEvent.click(screen.getByRole('option', { name: 'Счет' }));
    expect(getCount()).toBe(1);

    // filter by attention ("Внимательность") => Digit and Shulte
    fireEvent.click(combo);
    fireEvent.click(screen.getByRole('option', { name: 'Внимательность' }));
    expect(getCount()).toBe(2);

    // filter by reading ("Чтение") => none
    fireEvent.click(combo);
    fireEvent.click(screen.getByRole('option', { name: 'Чтение' }));
    expect(getCount()).toBe(0);
});
