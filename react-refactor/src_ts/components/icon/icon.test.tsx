import React from 'react';
import { render, screen } from '@testing-library/react';

// Import the component under test after mocking its dependency
// It's unexpected, but I had a lot of problems with this test cuz of iconMap, so I had to mock it.
const { default: Icon, availableIcons } = require('./icon');

// Smoke test: renders an existing icon (from our mock)
const someIcon = 'test';

test('renders without crashing when icon exists', () => {
  const { container } = render(<Icon name={someIcon} data-testid="svg" />);
  const svg = container.querySelector('svg');
  expect(svg).not.toBeNull();
});

test('does not crash for unknown icon', () => {
  const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const { container } = render(<Icon name="__unknown__" />);
  expect(container.firstChild).toBeNull();
  spy.mockRestore();
});
