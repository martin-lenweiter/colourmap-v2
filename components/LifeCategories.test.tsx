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

  it('cycles view modes through the toggle (list → polygon → cells → river → list)', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      CATS_KEY,
      JSON.stringify([
        { id: 'a', name: 'Music', color: '#D4805A', createdAt: new Date().toISOString() },
      ]),
    );
    // Seed the view mode to 'list' so the cycle order under test is exercised
    // explicitly — the component default switched to polygon but the cycle
    // sequence list → polygon → cells → river → list itself is the contract.
    localStorage.setItem('colourmap:life-view', 'list');
    render(<LifeCategories />);

    const toggle = screen.getByLabelText(/toggle view/i);

    await user.click(toggle);
    await waitFor(() => {
      expect(toggle.textContent?.toLowerCase()).toContain('polygon');
    });

    await user.click(toggle);
    await waitFor(() => {
      expect(toggle.textContent?.toLowerCase()).toContain('cells');
    });

    await user.click(toggle);
    await waitFor(() => {
      expect(toggle.textContent?.toLowerCase()).toContain('river');
    });

    await user.click(toggle);
    await waitFor(() => {
      expect(toggle.textContent?.toLowerCase()).toContain('list');
    });
  });

  it('expands a category on click and reveals the targets + logbook section', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      CATS_KEY,
      JSON.stringify([
        { id: 'a', name: 'Organisation', color: '#C4A060', createdAt: new Date().toISOString() },
      ]),
    );
    // Force list view — in polygon view the category label sits inside an
    // SVG <foreignObject> with pointer-events:none, so the click target
    // isn't reachable. The category-row click-to-expand interaction is the
    // contract under test, regardless of which view is the visual default.
    localStorage.setItem('colourmap:life-view', 'list');
    render(<LifeCategories />);

    await user.click(screen.getByText('Organisation'));

    await waitFor(() => {
      expect(screen.getByText('Targets')).toBeDefined();
      expect(screen.getByText('Logbook')).toBeDefined();
      expect(screen.getByPlaceholderText(/\+ add target/i)).toBeDefined();
    });
  });
});
