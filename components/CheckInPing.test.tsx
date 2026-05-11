// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import CheckInPing from './CheckInPing';

const LS_DISMISSED = 'colourmap:checkin-ping-dismissed';

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

  it('shows a daily quote when not dismissed', () => {
    render(<CheckInPing />);
    expect(screen.getByRole('note')).toBeDefined();
  });

  it('renders nothing when user already dismissed the ping today', () => {
    localStorage.setItem(LS_DISMISSED, today());
    const { container } = render(<CheckInPing />);
    expect(container.firstChild).toBeNull();
  });

  it('persists the dismissal to localStorage when the X is clicked', () => {
    render(<CheckInPing />);
    const close = screen.getByRole('button', { name: /dismiss daily reminder/i });
    act(() => {
      fireEvent.click(close);
    });
    expect(localStorage.getItem(LS_DISMISSED)).toBe(today());
  });

  it('hides the component after dismissal', () => {
    const { container } = render(<CheckInPing />);
    const close = screen.getByRole('button', { name: /dismiss daily reminder/i });
    act(() => {
      fireEvent.click(close);
    });
    expect(container.firstChild).toBeNull();
  });
});
