import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Slider from './slider';

describe('Slider', () => {
  test('renders with correct ARIA and value, calls onChange', () => {
    const onChange = jest.fn();
    render(
      <Slider
        ariaLabel="volume-test"
        min={0}
        max={1}
        step={0.05}
        value={0.25}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('slider', { name: 'volume-test' }) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '1');
    expect(input).toHaveAttribute('step', '0.05');
    expect(input.value).toBe('0.25');

    fireEvent.change(input, { target: { value: '0.8' } });
    expect(onChange).toHaveBeenCalledWith(0.8);
  });

  test('does not call onChange for NaN values and respects disabled', () => {
    const onChange = jest.fn();
    render(
      <Slider
        ariaLabel="volume-test"
        min={0}
        max={100}
        step={1}
        value={50}
        onChange={onChange}
        disabled
      />
    );

    const input = screen.getByRole('slider', { name: 'volume-test' }) as HTMLInputElement;
    // Disabled attribute present
    expect(input).toBeDisabled();

    // Even if change event fired with invalid value, NaN should be filtered
    fireEvent.change(input, { target: { value: 'not-a-number' } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
