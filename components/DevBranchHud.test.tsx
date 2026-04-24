// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DevBranchHud from './DevBranchHud';

describe('DevBranchHud', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubEnv('NEXT_PUBLIC_BUILD_REF', '');
    vi.stubEnv('NEXT_PUBLIC_BUILD_SHA', '');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  it('renders nothing when NEXT_PUBLIC_BUILD_REF is empty', () => {
    const { container } = render(<DevBranchHud />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when ref is main (production)', () => {
    vi.stubEnv('NEXT_PUBLIC_BUILD_REF', 'main');
    vi.stubEnv('NEXT_PUBLIC_BUILD_SHA', 'abc1234');
    const { container } = render(<DevBranchHud />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the branch and sha pill on a non-main branch', () => {
    vi.stubEnv('NEXT_PUBLIC_BUILD_REF', 'feature/atom-visualizer');
    vi.stubEnv('NEXT_PUBLIC_BUILD_SHA', 'abc1234');
    render(<DevBranchHud />);
    const pill = screen.getByRole('button', { name: /dismiss build indicator/i });
    expect(pill.textContent).toContain('feature/atom-visualizer');
    expect(pill.textContent).toContain('abc1234');
  });

  it('dismisses on click and persists the dismissal in sessionStorage', () => {
    vi.stubEnv('NEXT_PUBLIC_BUILD_REF', 'feature/x');
    vi.stubEnv('NEXT_PUBLIC_BUILD_SHA', 'deadbee');
    const { rerender, container } = render(<DevBranchHud />);
    const pill = screen.getByRole('button', { name: /dismiss build indicator/i });
    fireEvent.click(pill);
    expect(sessionStorage.getItem('colourmap:hud-dismissed')).toBe('true');
    rerender(<DevBranchHud />);
    expect(container.firstChild).toBeNull();
  });

  it('restores dismissed state from sessionStorage on mount', () => {
    sessionStorage.setItem('colourmap:hud-dismissed', 'true');
    vi.stubEnv('NEXT_PUBLIC_BUILD_REF', 'feature/y');
    vi.stubEnv('NEXT_PUBLIC_BUILD_SHA', 'cafeba0');
    const { container } = render(<DevBranchHud />);
    expect(container.firstChild).toBeNull();
  });
});
