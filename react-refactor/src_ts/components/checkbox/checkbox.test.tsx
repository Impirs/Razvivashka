
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from './checkbox';
import '@testing-library/jest-dom';

describe('Checkbox', () => {
  it('renders with label and checked state', () => {
    render(<Checkbox checked={true} onChange={() => {}}>Label</Checkbox>);
    const input = screen.getByRole('checkbox');
    expect(input).toBeChecked();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('renders unchecked', () => {
    render(<Checkbox checked={false} onChange={() => {}}>Label</Checkbox>);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onChange with correct value', () => {
    const handleChange = jest.fn();
    render(<Checkbox checked={false} onChange={handleChange}>Label</Checkbox>);
    const input = screen.getByRole('checkbox');
    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
