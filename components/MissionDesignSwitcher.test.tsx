// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MissionDesignSwitcher from './MissionDesignSwitcher';

vi.mock('@/lib/sync', () => ({
  syncPref: vi.fn(),
}));

describe('MissionDesignSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps format 1 as the default mission layout', () => {
    render(<MissionDesignSwitcher />);

    expect(screen.getByRole('button', { name: 'Format 1' })).toBeDefined();
    expect(screen.getByText('Current Mission')).toBeDefined();
  });

  it('switches to format 2 mission control', async () => {
    const user = userEvent.setup();
    render(<MissionDesignSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Format 2' }));

    expect(screen.getByText('Mission Control')).toBeDefined();
    expect(screen.getAllByText('Free Card').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Deep Thought').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pro Work').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Real Work').length).toBeGreaterThan(0);
    expect(localStorage.getItem('colourmap:mission-design-format')).toBe('two');
  });

  it('organises existing missions by area and work type in format 2', () => {
    localStorage.setItem('colourmap:mission-design-format', 'two');
    localStorage.setItem(
      'colourmap:today-objectives',
      JSON.stringify([
        {
          id: 'mission-1',
          text: 'Write investor story',
          done: false,
          tag: { name: 'Work', color: '#688FB0', categoryId: 'work' },
        },
      ]),
    );
    localStorage.setItem('colourmap:mission-kind:mission-1', 'pro');
    localStorage.setItem(
      'colourmap:life-categories',
      JSON.stringify([{ id: 'work', name: 'Work', color: '#688FB0' }]),
    );

    render(<MissionDesignSwitcher />);

    expect(screen.getAllByText('Write investor story').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Work').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pro Work').length).toBeGreaterThan(0);
  });
});
