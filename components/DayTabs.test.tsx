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

  it('renders the V1 tabs: Check in and Sounds', () => {
    render(<DayTabs checkinContent={<div>checkin</div>} overviewContent={<div>overview</div>} />);
    expect(screen.getByText('Check in')).toBeDefined();
    expect(screen.getByText('Sounds')).toBeDefined();
  });

  it('shows check-in content by default', () => {
    render(
      <DayTabs
        checkinContent={<div>checkin-content</div>}
        overviewContent={<div>overview-content</div>}
      />,
    );
    expect(screen.getByText('checkin-content')).toBeDefined();
  });

  it('switches to sounds when the Sounds tab is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DayTabs
        checkinContent={<div>checkin-content</div>}
        overviewContent={<div>overview-content</div>}
        tunerContent={<div>sounds-content</div>}
      />,
    );
    await user.click(screen.getByText('Sounds'));
    expect(screen.getByText('sounds-content')).toBeDefined();
  });
});
