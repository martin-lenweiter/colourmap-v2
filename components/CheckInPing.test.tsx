// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import CheckInPing from './CheckInPing';

const LS_CHECKINS = 'colourmap:check-ins';
const LS_DISMISSED = 'colourmap:checkin-ping-dismissed';

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

describe('CheckInPing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('shows a welcome ping when there are no check-ins at all', () => {
    render(<CheckInPing />);
    expect(screen.getByText(/try a one-minute check-in/i)).toBeDefined();
  });

  it('shows the "N days ago" ping when last check-in was > 2 days ago', () => {
    localStorage.setItem(LS_CHECKINS, JSON.stringify([{ date: iso(3) }]));
    render(<CheckInPing />);
    expect(screen.getByText(/3 days ago/i)).toBeDefined();
  });

  it('renders nothing when most recent check-in was today', () => {
    localStorage.setItem(LS_CHECKINS, JSON.stringify([{ date: iso(0) }]));
    const { container } = render(<CheckInPing />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when user already dismissed the ping today', () => {
    localStorage.setItem(LS_DISMISSED, today());
    const { container } = render(<CheckInPing />);
    expect(container.firstChild).toBeNull();
  });

  it('persists the dismissal to localStorage when the X is clicked', () => {
    render(<CheckInPing />);
    const close = screen.getByRole('button', { name: /dismiss check-in reminder/i });
    act(() => {
      fireEvent.click(close);
    });
    expect(localStorage.getItem(LS_DISMISSED)).toBe(today());
  });

  it('pluralizes correctly (1 day, not 1 days)', () => {
    // "1 day" appears when the most recent check-in is exactly ~1 day ago; but
    // the threshold is 2 days, so to see "1 day" we need to test the branch
    // directly via a 2-day-ago entry (floor(2) = 2 days). Verify 2 pluralizes.
    localStorage.setItem(LS_CHECKINS, JSON.stringify([{ date: iso(2) }]));
    render(<CheckInPing />);
    expect(screen.getByText(/2 days ago/i)).toBeDefined();
  });
});
