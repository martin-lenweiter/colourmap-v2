// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import CaringDepth from './CaringDepth';

const PILLS_KEY = 'colourmap:pattern-pills';

describe('CaringDepth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders Flow and Challenge inputs and creates pills on Enter', async () => {
    const user = userEvent.setup();
    render(<CaringDepth />);

    const flowInput = screen.getByPlaceholderText("What's flowing?...");
    const challengeInput = screen.getByPlaceholderText("What's challenging?...");

    expect(flowInput).toBeDefined();
    expect(challengeInput).toBeDefined();

    await user.type(flowInput, 'Courage{Enter}');
    await waitFor(() => {
      expect(screen.getByText('Courage')).toBeDefined();
    });

    await user.type(challengeInput, 'Overthinking{Enter}');
    await waitFor(() => {
      expect(screen.getByText('Overthinking')).toBeDefined();
    });

    // Verify pills persisted to localStorage
    const saved = JSON.parse(localStorage.getItem(PILLS_KEY) || '[]');
    expect(saved.length).toBe(2);
    expect(saved[0].name).toBe('Courage');
    expect(saved[0].type).toBe('strength');
    expect(saved[1].name).toBe('Overthinking');
    expect(saved[1].type).toBe('weakness');
  });

  it('removes a pill when clicking the delete button', async () => {
    const user = userEvent.setup();
    render(<CaringDepth />);

    const flowInput = screen.getByPlaceholderText("What's flowing?...");
    await user.type(flowInput, 'Creativity{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Creativity')).toBeDefined();
    });

    const deleteBtn = screen.getByTitle('Remove');
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Creativity')).toBeNull();
    });
  });

  it('loads pills from localStorage on mount', async () => {
    localStorage.setItem(
      PILLS_KEY,
      JSON.stringify([
        {
          id: 'p1',
          name: 'Music',
          type: 'strength',
          color: '#D4805A',
          createdAt: '2026-04-10T08:00:00.000Z',
        },
        {
          id: 'p2',
          name: 'Sleep',
          type: 'weakness',
          color: '#6890B0',
          createdAt: '2026-04-10T08:00:00.000Z',
        },
      ]),
    );

    render(<CaringDepth />);

    await waitFor(() => {
      expect(screen.getByText('Music')).toBeDefined();
      expect(screen.getByText('Sleep')).toBeDefined();
    });
  });
});
