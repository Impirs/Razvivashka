
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './button';

import '@testing-library/jest-dom';

describe('Button', () => {
  it('renders with text child', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with a component as child', () => {
    const Child = () => <span>ChildComp</span>;
    render(<Button><Child /></Button>);
    expect(screen.getByText('ChildComp')).toBeInTheDocument();
  });

  it('renders with multiple children', () => {
    render(
      <Button>
        <span>First</span>
        <span>Second</span>
      </Button>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('passes props to button element', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Test</Button>);
    fireEvent.click(screen.getByText('Test'));
    expect(onClick).toHaveBeenCalled();
  });
});
