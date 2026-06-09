// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import GeopoliticsMap from './GeopoliticsMap';

describe('GeopoliticsMap', () => {
  afterEach(() => cleanup());

  it('renders the regional map with chokepoints visible by default', () => {
    render(<GeopoliticsMap />);
    expect(screen.getByTestId('geopolitics-map')).toBeDefined();
    expect(screen.getByTestId('chokepoint-hormuz')).toBeDefined();
    expect(screen.getByTestId('chokepoint-bab-el-mandeb')).toBeDefined();
    expect(screen.getByTestId('movement-us-carrier-into-gulf-of-oman')).toBeDefined();
  });

  it('layer toggles hide movements of that layer', () => {
    render(<GeopoliticsMap />);

    expect(screen.queryByTestId('movement-houthi-launches')).not.toBeNull();
    fireEvent.click(screen.getByTestId('layer-military'));
    expect(screen.queryByTestId('movement-houthi-launches')).toBeNull();
    expect(screen.queryByTestId('movement-container-reroute-cape')).not.toBeNull();
  });

  it('clicking a chokepoint opens its page', () => {
    const onOpenPage = vi.fn();
    render(<GeopoliticsMap onOpenPage={onOpenPage} />);
    fireEvent.click(screen.getByTestId('chokepoint-hormuz'));
    expect(onOpenPage).toHaveBeenCalledWith('hormuz-geography');
  });

  it('clicking a movement arrow opens its explainer page', () => {
    const onOpenPage = vi.fn();
    render(<GeopoliticsMap onOpenPage={onOpenPage} />);
    fireEvent.click(screen.getByTestId('movement-irgc-fast-boats'));
    expect(onOpenPage).toHaveBeenCalledWith('iran-leverage');
  });
});
