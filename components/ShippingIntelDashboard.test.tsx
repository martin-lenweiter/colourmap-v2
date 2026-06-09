// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import ShippingIntelDashboard from './ShippingIntelDashboard';

describe('ShippingIntelDashboard', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('renders six tiles with updatedness badges and the as-of date', () => {
    render(<ShippingIntelDashboard />);

    expect(screen.getByTestId('tile-chokepoints')).toBeDefined();
    expect(screen.getByTestId('tile-war-risk')).toBeDefined();
    expect(screen.getByTestId('tile-freight-rates')).toBeDefined();
    expect(screen.getByTestId('tile-incidents')).toBeDefined();
    expect(screen.getByTestId('tile-cma-cgm-watch')).toBeDefined();
    expect(screen.getByTestId('tile-what-changed')).toBeDefined();

    expect(within(screen.getByTestId('tile-war-risk')).getByText(/of hull value/i)).toBeDefined();
    expect(within(screen.getByTestId('tile-cma-cgm-watch')).getByText('4.140 M TEU')).toBeDefined();
  });

  it('renders the Self↔World switch with World marked active', () => {
    render(<ShippingIntelDashboard />);
    const worldBtn = screen.getByRole('button', { name: 'World' });
    expect(worldBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('forwards a Learn-this click to the onOpenPage callback when provided', () => {
    const onOpenPage = vi.fn();
    render(<ShippingIntelDashboard onOpenPage={onOpenPage} />);

    const learnButtons = screen.getAllByText(/Learn this/i);
    fireEvent.click(learnButtons[0]);
    expect(onOpenPage).toHaveBeenCalledWith('hormuz-geography');
  });

  it('falls back to router.push when no onOpenPage is given', () => {
    render(<ShippingIntelDashboard />);
    const learnButtons = screen.getAllByText(/Learn this/i);
    fireEvent.click(learnButtons[0]);
    expect(pushMock).toHaveBeenCalledWith('/education/world?page=hormuz-geography');
  });
});
