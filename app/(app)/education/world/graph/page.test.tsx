// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import GeopoliticsGraphPage from './page';

describe('/education/world/graph route', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('mounts the graph view', () => {
    render(<GeopoliticsGraphPage />);
    expect(screen.getByTestId('geopolitics-graph')).toBeDefined();
  });
});
