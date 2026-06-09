// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import ShippingIntelPage from './page';

describe('/education/world/intel route', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('mounts the Shipping Intel dashboard', () => {
    render(<ShippingIntelPage />);
    expect(screen.getByTestId('shipping-intel-dashboard')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Shipping Intel' })).toBeDefined();
  });
});
