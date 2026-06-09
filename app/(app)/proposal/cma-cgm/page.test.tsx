// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import CmaCgmProposalPage from './page';

describe('/proposal/cma-cgm route', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('mounts the CMA CGM proposal artifact', () => {
    render(<CmaCgmProposalPage />);
    expect(screen.getByTestId('cma-cgm-proposal')).toBeDefined();
  });
});
