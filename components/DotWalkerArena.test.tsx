// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import DotWalkerArena from './DotWalkerArena';

describe('DotWalkerArena', () => {
  afterEach(() => cleanup());

  it('renders a phone-friendly fight arena with waves and special attacks', () => {
    render(<DotWalkerArena />);

    expect(screen.getByText('Dot Walker Arena')).toBeDefined();
    expect(screen.getByText(/Wave 1/i)).toBeDefined();
    expect(screen.getByRole('button', { name: 'fight' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'dance' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Strike' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Pulse' })).toBeDefined();
    expect(screen.getByText(/Special attacks should read as golden geometry/i)).toBeDefined();
  });

  it('shows comic text bursts when a special attack lands', () => {
    render(<DotWalkerArena />);

    fireEvent.click(screen.getByRole('button', { name: 'Pulse' }));

    expect(screen.getByText('Pulse')).toBeDefined();
  });

  it('switches to dance mode and disables fight actions', () => {
    render(<DotWalkerArena />);

    fireEvent.click(screen.getByRole('button', { name: 'dance' }));

    expect((screen.getByRole('button', { name: 'Strike' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole('button', { name: 'Comet' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});
