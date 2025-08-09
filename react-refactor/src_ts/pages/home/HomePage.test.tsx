import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './HomePage';
import { LanguageProvider } from '@/contexts/i18n';

// Mock electronAPI for tests
beforeAll(() => {
	(window as any).electronAPI = { quitApp: jest.fn() };
});

const renderWithProviders = (initialPath: string = '/') =>
	render(
		<LanguageProvider>
			<MemoryRouter initialEntries={[initialPath]}>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/catalog" element={<div>Catalog!</div>} />
					<Route path="/achievements" element={<div>Achievements!</div>} />
					<Route path="/settings" element={<div>Settings!</div>} />
				</Routes>
			</MemoryRouter>
		</LanguageProvider>
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

