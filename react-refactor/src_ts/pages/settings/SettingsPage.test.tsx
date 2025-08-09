import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from './SettingsPage';
import { LanguageProvider } from '@/contexts/i18n';
import { SettingsProvider } from '@/contexts/pref';

// Stateful preload shim for tests with publish/subscribe
(() => {
    const store = {
        volume: { notifications: 0.5, effects: 0.5 },
        language: 'ru',
        games: { digit: { show_available: true }, shulte: { check_all_letters_tested: false } },
    };
    const listeners = new Set<(key: string, value: any) => void>();
    (window as any).settingsAPI = {
        getAll: () => ({ ...store, volume: { ...store.volume }, games: { ...store.games } }),
        subscribe: (cb: any) => {
            listeners.add(cb);
            return () => listeners.delete(cb);
        },
        set: (k: keyof typeof store, v: any) => {
            // mutate store and notify subscribers
            // shallow assign to mimic real behavior
            (store as any)[k] = v;
            listeners.forEach((cb) => cb(k as string, v));
        },
    };
})();

test('changes volume via sliders', () => {
    render(
        <SettingsProvider>
            <LanguageProvider>
                <SettingsPage />
            </LanguageProvider>
        </SettingsProvider>
    );

    const notif = screen.getByLabelText('volume-notifications') as HTMLInputElement;
    fireEvent.change(notif, { target: { value: '0.8' } });
    expect(notif.value).toBe('0.8');
});
