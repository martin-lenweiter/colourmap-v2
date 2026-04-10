// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import SoulConstellation from './SoulConstellation';

const SOUL_KEY = 'colourmap:soul-constellation';

describe('SoulConstellation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('adds, updates, and removes inner terrain points while persisting to localStorage', async () => {
    const user = userEvent.setup();

    render(<SoulConstellation />);

    expect(
      screen.getByText('Map your inner terrain. Fears, needs, strengths, shadows, people.'),
    ).toBeDefined();

    await user.click(screen.getByRole('button', { name: /Fear/i }));
    await user.click(screen.getByRole('button', { name: 'Anger' }));

    const savedAfterAdd = JSON.parse(localStorage.getItem(SOUL_KEY) ?? '[]');
    expect(savedAfterAdd).toHaveLength(1);
    expect(savedAfterAdd[0]?.name).toBe('Anger');

    const angerLabel = await screen.findByText('Anger');
    await user.click(angerLabel);

    const rateRow = await screen.findByText('faint');
    const rowContainer = rateRow.parentElement;
    if (!(rowContainer instanceof HTMLElement)) {
      throw new Error('Expected intensity control row');
    }

    let pointButtons = within(rowContainer).getAllByRole('button');
    await user.click(pointButtons[1]);

    await waitFor(() => {
      pointButtons = within(rowContainer).getAllByRole('button');
      expect((pointButtons[1] as HTMLButtonElement).style.height).toBe('20px');
    });

    await user.click(screen.getByRole('button', { name: '✕' }));

    await waitFor(() => {
      expect(screen.queryByText('Anger')).toBeNull();
    });
    expect(JSON.parse(localStorage.getItem(SOUL_KEY) ?? '[]')).toHaveLength(0);
    expect(
      screen.getByText('Map your inner terrain. Fears, needs, strengths, shadows, people.'),
    ).toBeDefined();
  });
});
