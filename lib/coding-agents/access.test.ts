import { describe, expect, it, vi } from 'vitest';

import { canAccessBuildLab } from './access';

describe('canAccessBuildLab', () => {
  it('allows the dev auth user outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(
      canAccessBuildLab({
        email: 'dev@localhost',
      } as never),
    ).toBe(true);

    vi.unstubAllEnvs();
  });

  it('allows configured creator emails', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BUILD_LAB_ALLOWED_EMAILS', 'owner@example.com, martin@example.com');

    expect(
      canAccessBuildLab({
        email: 'MARTIN@example.com',
      } as never),
    ).toBe(true);

    vi.unstubAllEnvs();
  });

  it('rejects unconfigured users', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BUILD_LAB_ALLOWED_EMAILS', 'owner@example.com');

    expect(
      canAccessBuildLab({
        email: 'guest@example.com',
      } as never),
    ).toBe(false);

    vi.unstubAllEnvs();
  });
});
