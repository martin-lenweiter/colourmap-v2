// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import LifeCategories from './LifeCategories';

const CATS_KEY = 'colourmap:life-categories';

describe('LifeCategories', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders the header and the empty-state prompt', () => {
    render(<LifeCategories />);
    expect(screen.getByText('Life Categories')).toBeDefined();
    expect(screen.getByText(/Name the areas of your life you want to watch/i)).toBeDefined();
  });

  it('shows the add-category losange "+" button', () => {
    render(<LifeCategories />);
    expect(screen.getByText('+')).toBeDefined();
  });

  it('lets a user create a category, persist it, and see it in the list', async () => {
    const user = userEvent.setup();
    render(<LifeCategories />);

    await user.click(screen.getByText('+'));

    const input = screen.getByPlaceholderText(/Name this area of your life/i);
    await user.type(input, 'Shoulder{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Shoulder')).toBeDefined();
    });

    const stored = JSON.parse(localStorage.getItem(CATS_KEY) || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].name).toBe('Shoulder');
  });

  // The view-mode toggle and the click-to-expand-into-list flow were
  // removed when Martin locked Life Categories to polygon mode
  // (2026-04-26). The cycle/expand tests that lived here were tied
  // to those interactions and have been deleted with them. If the
  // detail-panel rendering returns under polygon mode, add a focused
  // test for that interaction.
});
