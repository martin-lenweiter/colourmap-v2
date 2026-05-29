// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ColourMapPanel from './ColourMapPanel';

vi.mock('@/lib/sync', () => ({
  syncPref: vi.fn(),
}));

describe('ColourMapPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows area-created missions once even if duplicate rows exist in mission storage', () => {
    localStorage.setItem(
      'colourmap:cmap-data',
      JSON.stringify({
        title: 'Areas',
        channels: [
          {
            id: 'area-work',
            title: 'Work',
            color: '#4870A8',
            open: true,
            compartments: [],
          },
        ],
        ideas: [],
      }),
    );
    localStorage.setItem(
      'colourmap:today-objectives',
      JSON.stringify([
        {
          id: 'mission-1',
          text: 'Call accountant',
          done: false,
          tag: { name: 'Work', color: '#4870A8', categoryId: 'area-work' },
        },
        {
          id: 'mission-2',
          text: 'Call accountant',
          done: false,
          tag: { name: 'Work', color: '#4870A8', categoryId: 'area-work' },
        },
      ]),
    );

    render(<ColourMapPanel />);

    fireEvent.click(screen.getByText('Areas'));

    expect(screen.getAllByText('Call accountant')).toHaveLength(1);
  });

  it('keeps a horizontal area dot selected when it is clicked again', () => {
    localStorage.setItem(
      'colourmap:cmap-data',
      JSON.stringify({
        title: 'Areas',
        channels: [
          {
            id: 'area-music',
            title: 'Music',
            color: '#4870A8',
            open: true,
            compartments: [],
          },
        ],
        ideas: [],
      }),
    );

    render(<ColourMapPanel />);

    fireEvent.click(screen.getByText('Areas'));
    fireEvent.click(screen.getByRole('button', { name: 'H' }));
    fireEvent.click(screen.getByText('Music'));
    expect(screen.getByText('Missions in this area')).toBeDefined();

    fireEvent.click(screen.getByText('Music'));
    expect(screen.getByText('Missions in this area')).toBeDefined();
  });
});
