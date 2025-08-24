import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './HomePage';
import { SettingsProvider } from '@/contexts/pref';

// Mock the useSelectiveContext hooks
jest.mock('@/hooks/useSelectiveContext', () => ({
    useTranslationFunction: () => {
        const mockT = (key: string) => {
            const mockTranslations: Record<string, string> = {
                'routes.home': 'Развивашка',
                'routes.catalog': 'Каталог',
                'routes.settings': 'Настройки',
                'routes.achievements': 'Достижения',
                'buttons.play': 'Играть',
                'navigation.exit': 'Выход'
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

// Mock electronAPI for tests
beforeAll(() => {
	(window as any).electronAPI = { quitApp: jest.fn() };
	if (!(window as any).settingsAPI) {
		const store: any = {
			volume: { notifications: 0.25, effects: 0.25 },
			language: 'ru',
			currentUser: 'user',
			games: { digit: { view_modification: true }, shulte: { view_modification: true } },
		};
		const listeners = new Set<(k: string, v: any) => void>();
		;(window as any).settingsAPI = {
			getAll: () => JSON.parse(JSON.stringify(store)),
			get: (k: string) => store[k],
			set: (k: string, v: any) => { store[k] = v; listeners.forEach(cb => cb(k, v)); },
			subscribe: (cb: any) => { listeners.add(cb); return () => listeners.delete(cb); },
		};
	}
});

const renderWithProviders = (initialPath: string = '/') =>
	render(
		<SettingsProvider>
			<MemoryRouter initialEntries={[initialPath]}>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/catalog" element={<div>Catalog!</div>} />
					<Route path="/achievements" element={<div>Achievements!</div>} />
					<Route path="/settings" element={<div>Settings!</div>} />
				</Routes>
			</MemoryRouter>
		</SettingsProvider>
	);

test('renders translated title and buttons', () => {
	renderWithProviders();

	expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	expect(screen.getByLabelText('nav-play')).toBeInTheDocument();
	expect(screen.getByLabelText('nav-achievements')).toBeInTheDocument();
	expect(screen.getByLabelText('nav-settings')).toBeInTheDocument();
	expect(screen.getByLabelText('nav-exit')).toBeInTheDocument();
});

test('navigates to catalog on Play click', () => {
	renderWithProviders();
	fireEvent.click(screen.getByLabelText('nav-play'));
	expect(screen.getByText('Catalog!')).toBeInTheDocument();
});

test('navigates to achievements on click', () => {
	renderWithProviders();
	fireEvent.click(screen.getByLabelText('nav-achievements'));
	expect(screen.getByText('Achievements!')).toBeInTheDocument();
});

test('navigates to settings on click', () => {
	renderWithProviders();
	fireEvent.click(screen.getByLabelText('nav-settings'));
	expect(screen.getByText('Settings!')).toBeInTheDocument();
});

test('calls quit on Exit click when available', () => {
	renderWithProviders();
	const spy = (window as any).electronAPI.quitApp as jest.Mock;
	fireEvent.click(screen.getByLabelText('nav-exit'));
	expect(spy).toHaveBeenCalled();
});

