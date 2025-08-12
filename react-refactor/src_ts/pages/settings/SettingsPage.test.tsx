import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from './SettingsPage';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/i18n';
import { SettingsProvider } from '@/contexts/pref';
import { GameStoreProvider } from '@/contexts/gameStore';

// Shims for preload APIs (settings + gamestore)
(() => {
    const settingsStore: any = {
        volume: { notifications: 0.5, effects: 0.5 },
        language: 'ru',
        currentUser: 'user',
        games: { digit: { show_available: true }, shulte: { check_all_letters_tested: false } },
    };
    const settingsListeners = new Set<(key: string, value: any) => void>();
    (window as any).settingsAPI = {
        getAll: () => ({
            ...settingsStore,
            volume: { ...settingsStore.volume },
            games: { digit: { ...settingsStore.games.digit }, shulte: { ...settingsStore.games.shulte } },
        }),
        get: (k: string) => settingsStore[k],
        subscribe: (cb: any) => {
            settingsListeners.add(cb);
            return () => settingsListeners.delete(cb);
        },
        set: (k: string, v: any) => {
            settingsStore[k] = v;
            settingsListeners.forEach((cb) => cb(k, v));
        },
    };

    const userDb: Record<string, any> = {
        user: { username: 'user', achievements: [], gameRecords: [] },
    };
    (window as any).gameStoreAPI = {
        loadUserData: async (username: string) => {
            if (!userDb[username]) userDb[username] = { username, achievements: [], gameRecords: [] };
            return userDb[username];
        },
        saveUserData: (username: string, data: any) => {
            userDb[username] = data;
        },
        listUsers: () => Object.keys(userDb),
        createUser: (username: string) => {
            if (!username || userDb[username]) return false;
            userDb[username] = { username, achievements: [], gameRecords: [] };
            return true;
        },
        deleteUser: (username: string) => {
            if (!userDb[username]) return false;
            if (username === 'user') {
                userDb['user'] = { username: 'user', achievements: [], gameRecords: [] };
                return true;
            }
            delete userDb[username];
            return true;
        },
        renameUser: (oldUsername: string, newUsername: string) => {
            if (!userDb[oldUsername] || userDb[newUsername]) return false;
            const data = { ...userDb[oldUsername], username: newUsername };
            delete userDb[oldUsername];
            userDb[newUsername] = data;
            return true;
        },
    };
})();

const renderPage = async () => {
    const utils = render(
        <SettingsProvider>
            <LanguageProvider>
                <GameStoreProvider>
                    <MemoryRouter>
                        <SettingsPage />
                    </MemoryRouter>
                </GameStoreProvider>
            </LanguageProvider>
        </SettingsProvider>
    );
    // Wait for initial auto-login and language load to settle
    await screen.findByText('Общие');
    return utils;
};

test('renders localized labels and headings', async () => {
    await renderPage();

    // General and Gameplay headers in Russian
    expect(await screen.findByText('Общие')).toBeInTheDocument();
    expect(await screen.findByText('Игровой процесс')).toBeInTheDocument();

    // Volume labels
    expect(screen.getByText('Громкость уведомлений')).toBeInTheDocument();
    expect(screen.getByText('Громкость эффектов')).toBeInTheDocument();

    // Language label
    expect(screen.getByText('Язык')).toBeInTheDocument();

    // Player name label
    expect(screen.getByText('Имя')).toBeInTheDocument();
});

test('changes volume via sliders (notifications and effects)', async () => {
    await renderPage();

    const notif = screen.getByLabelText('volume-notifications') as HTMLInputElement;
    fireEvent.change(notif, { target: { value: '0.8' } });
    expect(notif.value).toBe('0.8');

    const effects = screen.getByLabelText('volume-effects') as HTMLInputElement;
    fireEvent.change(effects, { target: { value: '0.2' } });
    expect(effects.value).toBe('0.2');
});

test('shows and renames current user', async () => {
    await renderPage();

    const userInput = await screen.findByLabelText('current-user-name');
    expect((userInput as HTMLInputElement).value).toBe('user');

    fireEvent.change(userInput, { target: { value: 'Alice' } });
    fireEvent.blur(userInput);

    await waitFor(() => expect((userInput as HTMLInputElement).value).toBe('Alice'));
});

test('toggles gameplay checkboxes for digit and shulte', async () => {
    await renderPage();

    const digitToggle = await screen.findByRole('checkbox', { name: 'game-digit-show-available' });
    const shulteToggle = await screen.findByRole('checkbox', { name: 'game-shulte-check-all-letters-tested' });

    // initial states from shim: digit true, shulte false
    expect(digitToggle).toHaveAttribute('aria-checked', 'true');
    expect(shulteToggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(digitToggle);
    fireEvent.click(shulteToggle);

    await waitFor(() => {
        expect(digitToggle).toHaveAttribute('aria-checked', 'false');
        expect(shulteToggle).toHaveAttribute('aria-checked', 'true');
    });
});
