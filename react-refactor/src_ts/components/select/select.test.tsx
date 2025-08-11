import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import Select from './select';
import { LanguageProvider } from '@/contexts/i18n';

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('Select', () => {
  const options = ['all', 'math', 'logic'];

  it('renders options with translated labels (default ru)', () => {
    renderWithI18n(
      <Select ariaLabel="catalog-filter" options={options} value={options[0]} />
    );

    const select = screen.getByRole('combobox', { name: /catalog-filter/i });
    expect(select).toBeInTheDocument();

    const optEls = within(select).getAllByRole('option');
    // Expect three options rendered
    expect(optEls).toHaveLength(3);

    // Based on ru.json: types.all => "Все категории", math => "Счет", logic => "Логика"
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

    const select = screen.getByRole('combobox', { name: /catalog-filter/i });

    fireEvent.change(select, { target: { value: 'math' } });

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

    const option = screen.getByRole('option', { name: 'Label-math' });
    expect(option).toBeInTheDocument();
    expect(option).toHaveValue('math');
  });
});
