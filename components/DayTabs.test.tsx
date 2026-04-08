// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
  it('renders three tab buttons', () => {
    render(
      <DayTabs
        feelingContent={<div>feeling</div>}
        doingContent={<div>doing</div>}
        sharingContent={<div>sharing</div>}
      />,
    );
    expect(screen.getByText('Caring')).toBeDefined();
    expect(screen.getByText('Doing')).toBeDefined();
    expect(screen.getByText('Sharing')).toBeDefined();
  });

  it('shows feeling content by default', () => {
    render(
      <DayTabs
        feelingContent={<div>feeling-content</div>}
        doingContent={<div>doing-content</div>}
        sharingContent={<div>sharing-content</div>}
      />,
    );
    expect(screen.getByText('feeling-content')).toBeDefined();
  });
});
