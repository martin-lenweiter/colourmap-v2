// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DoingDepth from './DoingDepth';

describe('DoingDepth', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => '[]'),
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders with empty state', () => {
    render(<DoingDepth />);
    expect(screen.getByText('Life Wheel')).toBeDefined();
    expect(screen.getByPlaceholderText('+ add aspect...')).toBeDefined();
  });

  it('shows suggestion pills when fewer than 3 aspects', () => {
    render(<DoingDepth />);
    expect(screen.getByText('Add at least 3 aspects to see your wheel.')).toBeDefined();
    expect(screen.getByText('Sleep')).toBeDefined();
    expect(screen.getByText('Sport')).toBeDefined();
  });
});
