// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DayTabs from './DayTabs';

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
      emotionContent={<div>emotion-content</div>}
      missionContent={<div>mission-content</div>}
      progressContent={<div>progress-content</div>}
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

  it('renders the Emotions / Missions / Progress tab strip', () => {
    renderTabs();
    expect(screen.getByText('Emotions')).toBeDefined();
    expect(screen.getByText('Missions')).toBeDefined();
    expect(screen.getByText('Progress')).toBeDefined();
  });

  it('shows emotion content by default', () => {
    renderTabs();
    expect(screen.getByText('emotion-content')).toBeDefined();
  });

  it('switches to Missions when the Missions tab is clicked', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText('Missions'));
    expect(screen.getByText('mission-content')).toBeDefined();
  });

  it('switches to Progress when the Progress tab is clicked', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText('Progress'));
    expect(screen.getByText('progress-content')).toBeDefined();
  });
});
