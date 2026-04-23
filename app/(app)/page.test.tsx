// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

import { redirect } from 'next/navigation';

import RootAppPage from './page';

describe('RootAppPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /day', () => {
    expect(() => RootAppPage()).toThrow('REDIRECT:/day');
    expect(redirect).toHaveBeenCalledWith('/day');
  });
});
