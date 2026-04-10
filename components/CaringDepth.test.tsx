// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import CaringDepth from './CaringDepth';

const PILLS_KEY = 'colourmap:pattern-pills';
const CONN_KEY = 'colourmap:pattern-connections';
const PACKS_KEY = 'colourmap:pattern-packs';

const seededPills = [
  {
    id: 'pill-strength-1',
    name: 'Courage',
    type: 'strength',
    color: '#D4805A',
    intensity: 4,
    locked: false,
    createdAt: '2026-04-10T08:00:00.000Z',
    history: [
      { date: '2026-04-09', intensity: 2 },
      { date: '2026-04-10', intensity: 4 },
    ],
  },
  {
    id: 'pill-strength-2',
    name: 'Empathy',
    type: 'strength',
    color: '#C4A060',
    intensity: 3,
    locked: false,
    createdAt: '2026-04-10T08:00:00.000Z',
    history: [],
  },
  {
    id: 'pill-weakness-1',
    name: 'Avoidance',
    type: 'weakness',
    color: '#6890B0',
    intensity: 2,
    locked: false,
    createdAt: '2026-04-10T08:00:00.000Z',
    history: [],
  },
];

describe('CaringDepth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('prompts for at least three pills before showing the wheel', async () => {
    const user = userEvent.setup();

    render(<CaringDepth />);

    expect(screen.getByText('Name your strengths and weaknesses.')).toBeDefined();

    await user.click(screen.getByRole('button', { name: '+ Strength' }));
    await user.click(screen.getByRole('button', { name: 'Courage' }));
    expect(screen.getByText('Add 2 more to see your wheel')).toBeDefined();

    await user.click(screen.getByRole('button', { name: '+ Weakness' }));
    await user.click(screen.getByRole('button', { name: 'Avoidance' }));
    expect(screen.getByText('Add 1 more to see your wheel')).toBeDefined();

    await user.click(screen.getByRole('button', { name: '+ Strength' }));
    await user.click(screen.getByRole('button', { name: 'Empathy' }));

    await waitFor(() => {
      expect(screen.queryByText(/Add \d more to see your wheel/)).toBeNull();
    });
    expect(screen.getByRole('button', { name: /Courage/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /Avoidance/ })).toBeDefined();
  });

  it('connects pills and shows any saved pack memberships in the detail view', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PILLS_KEY, JSON.stringify(seededPills));
    localStorage.setItem(CONN_KEY, JSON.stringify([]));
    localStorage.setItem(
      PACKS_KEY,
      JSON.stringify([
        {
          id: 'pack-1',
          name: 'Shadow Pair',
          type: 'shadow',
          pillIds: ['pill-strength-1', 'pill-weakness-1'],
        },
      ]),
    );

    render(<CaringDepth />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Courage/ })).toBeDefined();
    });

    await user.click(screen.getByRole('button', { name: /Courage/ }));
    expect(screen.getByText('Shadow Pair')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'link' }));
    expect(screen.getByText(/Tap another pill to connect to Courage/)).toBeDefined();

    await user.click(screen.getByRole('button', { name: /Avoidance/ }));
    await user.click(screen.getByRole('button', { name: 'balances' }));

    const chipLabel = await screen.findByText('balances Courage', { selector: 'span' });
    const chipDelete = chipLabel.parentElement?.querySelector('button');
    if (!(chipDelete instanceof HTMLButtonElement)) {
      throw new Error('Expected connection chip delete button');
    }

    await user.click(chipDelete);

    await waitFor(() => {
      expect(screen.queryByText('balances Courage', { selector: 'span' })).toBeNull();
    });
  });

  it('can cancel linking and remove the active pill', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PILLS_KEY, JSON.stringify(seededPills));
    localStorage.setItem(CONN_KEY, JSON.stringify([]));
    localStorage.setItem(PACKS_KEY, JSON.stringify([]));

    render(<CaringDepth />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Courage/ })).toBeDefined();
    });

    await user.click(screen.getByRole('button', { name: /Courage/ }));
    await user.click(screen.getByRole('button', { name: 'link' }));
    await user.click(screen.getByRole('button', { name: 'cancel' }));

    await waitFor(() => {
      expect(screen.queryByText(/Tap another pill to connect to Courage/)).toBeNull();
    });
    await user.click(screen.getAllByRole('button', { name: '✕' })[0]);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Courage/ })).toBeNull();
    });
  });
});
