// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import TrustBadge from './TrustBadge';

const sources = [
  {
    ref: 1,
    title: 'Howden Re — Hormuz',
    url: 'https://example.com/howden',
    date: '2026-03',
    quality: 'primary' as const,
  },
  {
    ref: 2,
    title: 'Belfer Center',
    url: 'https://example.com/belfer',
    date: '2026',
    quality: 'primary' as const,
  },
];

describe('TrustBadge', () => {
  afterEach(() => cleanup());

  it('renders a closed badge with confidence, days-ago, and source count', () => {
    render(
      <TrustBadge
        confidence="HIGH"
        lastVerified="2026-06-04"
        sources={sources}
        now={new Date('2026-06-09T12:00:00Z')}
      />,
    );
    const trigger = screen.getByTestId('trust-badge-trigger');
    expect(trigger.textContent).toMatch(/HIGH/);
    expect(trigger.textContent).toMatch(/5d ago/);
    expect(trigger.textContent).toMatch(/2 src/);
    expect(screen.queryByTestId('trust-badge-popover')).toBeNull();
  });

  it('opens the popover on click and lists sources with quality chips', () => {
    render(
      <TrustBadge
        confidence="HIGH"
        lastVerified="2026-06-04"
        sources={sources}
        now={new Date('2026-06-09T12:00:00Z')}
      />,
    );
    fireEvent.click(screen.getByTestId('trust-badge-trigger'));

    const popover = screen.getByTestId('trust-badge-popover');
    expect(popover).toBeDefined();
    expect(popover.textContent).toMatch(/Howden Re/);
    expect(popover.textContent).toMatch(/Belfer Center/);
    expect(popover.textContent).toMatch(/PRIMARY/);
    expect(popover.textContent).toMatch(/Multiple independent primary sources/);
  });

  it('shows changelog entries newest-first', () => {
    render(
      <TrustBadge
        confidence="MED"
        lastVerified="2026-06-04"
        sources={sources}
        changelog={[
          { at: '2026-06-04', note: 'Initial publication.' },
          { at: '2026-06-09', note: 'Verified again — no movement.' },
        ]}
        now={new Date('2026-06-09T12:00:00Z')}
      />,
    );
    fireEvent.click(screen.getByTestId('trust-badge-trigger'));
    const items = screen.getByTestId('trust-changelog').querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toMatch(/2026-06-09/);
    expect(items[1].textContent).toMatch(/2026-06-04/);
  });

  it('falls back to a friendly note when there is no changelog', () => {
    render(
      <TrustBadge
        confidence="LOW"
        lastVerified="2026-06-04"
        sources={sources}
        now={new Date('2026-06-09T12:00:00Z')}
      />,
    );
    fireEvent.click(screen.getByTestId('trust-badge-trigger'));
    expect(screen.getByTestId('trust-changelog').textContent).toMatch(/No changelog yet/);
  });

  it('closes the popover on Escape', () => {
    render(
      <TrustBadge
        confidence="HIGH"
        lastVerified="2026-06-04"
        sources={sources}
        now={new Date('2026-06-09T12:00:00Z')}
      />,
    );
    fireEvent.click(screen.getByTestId('trust-badge-trigger'));
    expect(screen.getByTestId('trust-badge-popover')).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('trust-badge-popover')).toBeNull();
  });
});
