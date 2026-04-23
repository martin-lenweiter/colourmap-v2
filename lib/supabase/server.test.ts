import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type CookieWrite = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

type ServerClientOptions = {
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    setAll: (cookiesToSet: CookieWrite[]) => void;
  };
};

const { cookieStore, cookies, createServerClient } = vi.hoisted(() => ({
  cookieStore: {
    getAll: vi.fn(() => [{ name: 'existing', value: 'cookie' }]),
    set: vi.fn(),
  },
  cookies: vi.fn(),
  createServerClient: vi.fn(
    (_url: string, _key: string, _options: ServerClientOptions) => 'server-client',
  ),
}));

cookies.mockImplementation(async () => cookieStore);

vi.mock('next/headers', () => ({
  cookies,
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient,
}));

import { createClient } from './server';

describe('createClient', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    cookies.mockClear();
    createServerClient.mockClear();
    cookieStore.getAll.mockReturnValue([{ name: 'existing', value: 'cookie' }]);
    cookieStore.set.mockReset();
    vi.stubEnv('NODE_ENV', 'test');
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
    delete process.env.DEV_BYPASS_AUTH;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = { ...ORIGINAL_ENV };
  });

  it('wires the server client to the Next cookie store', async () => {
    expect(await createClient()).toBe('server-client');

    const options = createServerClient.mock.calls[0][2];

    expect(options.cookies.getAll()).toEqual([{ name: 'existing', value: 'cookie' }]);

    options.cookies.setAll([
      {
        name: 'sb-access-token',
        value: 'fresh-token',
        options: { path: '/' },
      },
    ]);

    expect(cookieStore.set).toHaveBeenCalledWith('sb-access-token', 'fresh-token', {
      path: '/',
    });
  });

  it('swallows cookie write errors inside server components', async () => {
    cookieStore.set.mockImplementation(() => {
      throw new Error('cannot write cookies');
    });

    await createClient();
    const options = createServerClient.mock.calls[0][2];

    expect(() =>
      options.cookies.setAll([
        {
          name: 'sb-access-token',
          value: 'fresh-token',
          options: { path: '/' },
        },
      ]),
    ).not.toThrow();
  });

  it('returns a dev client with a fake user when DEV_BYPASS_AUTH is set', async () => {
    process.env.DEV_BYPASS_AUTH = 'true';

    const client = await createClient();
    const { data, error } = await client.auth.getUser();

    expect(data.user).toMatchObject({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'dev@localhost',
    });
    expect(error).toBeNull();
    expect(createServerClient).not.toHaveBeenCalled();
    expect(cookies).not.toHaveBeenCalled();
  });

  it('ignores DEV_BYPASS_AUTH in production when the prod guard is already past', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.DEV_BYPASS_AUTH = 'true';

    expect(await createClient()).toBe('server-client');
    expect(createServerClient).toHaveBeenCalledOnce();
    expect(cookies).toHaveBeenCalledOnce();
  });

  it('throws at import time when NODE_ENV=production and DEV_BYPASS_AUTH=true', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.DEV_BYPASS_AUTH = 'true';
    vi.resetModules();
    await expect(import('./server')).rejects.toThrow(
      /DEV_BYPASS_AUTH must not be set to "true" in production/,
    );
  });

  it('does not throw at import time in production without DEV_BYPASS_AUTH', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.DEV_BYPASS_AUTH;
    vi.resetModules();
    await expect(import('./server')).resolves.toBeDefined();
  });
});
