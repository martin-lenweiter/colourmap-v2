// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import GeopoliticsMapPage from './page';

describe('/education/world/map route', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('mounts the regional map', () => {
    render(<GeopoliticsMapPage />);
    expect(screen.getByTestId('geopolitics-map')).toBeDefined();
  });
});
