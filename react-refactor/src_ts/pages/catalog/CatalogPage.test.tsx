import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CatalogPage from './CatalogPage';
import { SettingsProvider } from '@/contexts/pref';

// Mock the useSelectiveContext hooks
jest.mock('@/hooks/useSelectiveContext', () => ({
    useTranslationFunction: () => {
        const mockT = (key: string) => {
            const mockTranslations: Record<string, string> = {
                'routes.catalog': 'Каталог',
                'buttons.back': 'Назад',
                'buttons.filter': 'Выберите...',
                'types.all': 'Все категории',
                'types.math': 'Счет',
                'types.attention': 'Внимательность',
                'types.logic': 'Логика',
                'types.reading': 'Чтение',
                'games.digit': 'Состав числа',
                'games.shulte': 'Таблица Шульте'
            };
            return mockTranslations[key] || key;
        };
        return mockT;
    }
}));

// Mock the i18n context
jest.mock('@/contexts/i18n');

// Mock gameController to avoid sound file imports
jest.mock('@/contexts/gameController');

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
            <MemoryRouter>
                <CatalogPage />
            </MemoryRouter>
        </SettingsProvider>
    );

    // GameBadge renders as <a> links to /catalog/:id; count anchors with that href pattern
    const getCount = () =>
        screen
            .queryAllByRole('link')
            .filter((a) => (a as HTMLAnchorElement).getAttribute('href')?.startsWith('/catalog/'))
            .length;

    // by default shows all games (now 3: digit, shulte, queens)
    expect(getCount()).toBe(3);

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
