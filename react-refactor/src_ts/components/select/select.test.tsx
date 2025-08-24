import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import Select from './select';
import { SettingsProvider } from '@/contexts/pref';

// Mock the useSelectiveContext hooks
jest.mock('@/hooks/useSelectiveContext', () => ({
    useTranslationFunction: () => {
        const mockT = (key: string) => {
            const mockTranslations: Record<string, string> = {
                'buttons.filter': 'Выберите...',
                'types.all': 'Все категории',
                'types.math': 'Счет',
                'types.logic': 'Логика'
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

const renderWithI18n = (ui: React.ReactElement) => {
  return render(
    <SettingsProvider>
      {ui}
    </SettingsProvider>
  );
};

// Provide settingsAPI shim for SettingsProvider
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

describe('Select', () => {
  const options = ['all', 'math', 'logic'];

  it('renders options with translated labels (default ru)', () => {
    renderWithI18n(
      <Select ariaLabel="catalog-filter" options={options} value={options[0]} />
    );

    const combo = screen.getByRole('combobox', { name: /catalog-filter/i });
    expect(combo).toBeInTheDocument();

    // Open dropdown and assert options
    fireEvent.click(combo);
    const optEls = screen.getAllByRole('option');
    expect(optEls).toHaveLength(3);
    expect(optEls[0]).toHaveTextContent('Все категории');
    expect(optEls[1]).toHaveTextContent('Счет');
    expect(optEls[2]).toHaveTextContent('Логика');
  });

  it('calls onChange and onValueChange when selection changes', () => {
    const handleChange = jest.fn();
    const handleValueChange = jest.fn();

    renderWithI18n(
      <Select
        ariaLabel="catalog-filter"
        options={options}
        value={options[0]}
        onChange={handleChange}
        onValueChange={handleValueChange}
      />
    );

  const combo = screen.getByRole('combobox', { name: /catalog-filter/i });
  fireEvent.click(combo);
  fireEvent.click(screen.getByRole('option', { name: 'Счет' }));

  expect(handleChange).toHaveBeenCalledTimes(1);
  expect(handleValueChange).toHaveBeenCalledWith('math');
  });

  it('supports custom option label renderer', () => {
    renderWithI18n(
      <Select
        ariaLabel="catalog-filter"
        options={['math']}
        defaultValue="math"
        renderOptionLabel={(opt) => `Label-${opt}`}
      />
    );

  const button = screen.getByRole('combobox', { name: 'catalog-filter' });
  expect(button).toHaveTextContent('Label-math');
  fireEvent.click(button);
  const option = screen.getByRole('option', { name: 'Label-math' });
  expect(option).toBeInTheDocument();
  });
});
