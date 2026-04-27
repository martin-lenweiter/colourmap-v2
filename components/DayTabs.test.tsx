// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DayTabs from './DayTabs';

// Mock StyleContext
vi.mock('@/components/StyleContext', () => ({
  useStyle: () => ({
    style: {
      id: 'handwritten',
      headingFont: 'var(--font-handwritten)',
      titleSize: '13px',
      weight: { title: 600 },
    },
  }),
}));

function renderTabs() {
  return render(
    <DayTabs
      feelingContent={<div>feeling-content</div>}
      doingContent={<div>doing-content</div>}
      sharingContent={<div>sharing-content</div>}
      roadContent={<div>road-content</div>}
    />,
  );
}

describe('DayTabs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders the List/Overview scope strip and the Feeling/Doing/Sharing trio', () => {
    renderTabs();
    expect(screen.getByText('List')).toBeDefined();
    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Feeling')).toBeDefined();
    expect(screen.getByText('Doing')).toBeDefined();
    expect(screen.getByText('Sharing')).toBeDefined();
  });

  it('shows feeling content by default (List scope, Feeling tab)', () => {
    renderTabs();
    expect(screen.getByText('feeling-content')).toBeDefined();
  });

  it('switches to Doing when the Doing tab is clicked', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText('Doing'));
    expect(screen.getByText('doing-content')).toBeDefined();
  });

  it('switches to Overview and hides the inner trio when Overview is clicked', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText('Overview'));
    expect(screen.getByText('road-content')).toBeDefined();
    // Inner trio is hidden when scope = road, so Doing/Sharing buttons
    // shouldn't be reachable as buttons.
    expect(screen.queryByText('Doing')).toBeNull();
    expect(screen.queryByText('Sharing')).toBeNull();
  });
});
