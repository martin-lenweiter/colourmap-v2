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

describe('DayTabs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders the two top-level tabs: Cockpit and Overview', () => {
    render(<DayTabs cockpitContent={<div>cockpit</div>} overviewContent={<div>overview</div>} />);
    expect(screen.getByText('Cockpit')).toBeDefined();
    expect(screen.getByText('Overview')).toBeDefined();
  });

  it('shows cockpit content by default', () => {
    render(
      <DayTabs
        cockpitContent={<div>cockpit-content</div>}
        overviewContent={<div>overview-content</div>}
      />,
    );
    expect(screen.getByText('cockpit-content')).toBeDefined();
  });

  it('switches to overview when the Overview tab is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DayTabs
        cockpitContent={<div>cockpit-content</div>}
        overviewContent={<div>overview-content</div>}
      />,
    );
    await user.click(screen.getByText('Overview'));
    expect(screen.getByText('overview-content')).toBeDefined();
  });
});
