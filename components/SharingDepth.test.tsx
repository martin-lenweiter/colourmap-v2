// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SharingDepth from './SharingDepth';

describe('SharingDepth', () => {
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
    render(<SharingDepth />);
    expect(screen.getByText('Constellation')).toBeDefined();
    expect(screen.getByText('Add the people who matter. See how close you feel.')).toBeDefined();
  });

  it('shows add person input', () => {
    render(<SharingDepth />);
    expect(screen.getByPlaceholderText('+ add a person...')).toBeDefined();
  });
});
