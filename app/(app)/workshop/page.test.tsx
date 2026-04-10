// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import WorkshopPage from './page';

describe('WorkshopPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('switches between reflection, tools, and lab content without leaking open state', async () => {
    const user = userEvent.setup();

    render(<WorkshopPage />);

    expect(screen.getByRole('heading', { name: 'Workshop' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Reflection' })).toBeDefined();
    expect(screen.getByText('App Architecture')).toBeDefined();

    await user.click(screen.getByRole('button', { name: /App Architecture/i }));
    expect(screen.getByText(/The app has four layers, each with a clear purpose/i)).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Visual Tools' }));
    expect(screen.queryByText(/The app has four layers, each with a clear purpose/i)).toBeNull();
    expect(screen.getByText('The Compass')).toBeDefined();

    await user.click(screen.getByRole('button', { name: /The Compass/i }));
    expect(screen.getByText(/Rate your 4 dimensions/i)).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Design Lab' }));
    expect(screen.queryByText(/Rate your 4 dimensions\./i)).toBeNull();
    expect(screen.getByText('Typography Pairs')).toBeDefined();

    await user.click(screen.getByRole('button', { name: /Typography Pairs/i }));
    expect(screen.getByText('Elegant')).toBeDefined();
    expect(screen.getAllByText('Caring · Doing · Sharing').length).toBeGreaterThan(0);
  });
});
