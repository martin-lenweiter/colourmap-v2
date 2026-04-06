import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, signInWithPassword } = vi.hoisted(() => {
  const signInWithPassword = vi.fn();
  const createClient = vi.fn(async () => ({
    auth: { signInWithPassword },
  }));
  return { createClient, signInWithPassword };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));

import { POST } from './route';

function makeRequest(body: { email?: string; password?: string }) {
  return new Request('http://localhost/api/e2e-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/e2e-auth', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    signInWithPassword.mockReset();
    createClient.mockClear();
    process.env.E2E_TEST_AUTH_ENABLED = 'true';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns 404 when E2E_TEST_AUTH_ENABLED is not set', async () => {
    delete process.env.E2E_TEST_AUTH_ENABLED;

    const response = await POST(
      makeRequest({
        email: 'x@test.com',
        password: 'pass',
      }),
    );

    expect(response.status).toBe(404);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('returns 400 when email or password is missing from the request body', async () => {
    const missingEmail = await POST(
      makeRequest({
        password: 'pass',
      }),
    );
    const missingPassword = await POST(
      makeRequest({
        email: 'x@test.com',
      }),
    );

    expect(missingEmail.status).toBe(400);
    expect(await missingEmail.json()).toEqual({ error: 'email and password required' });
    expect(missingPassword.status).toBe(400);
    expect(await missingPassword.json()).toEqual({ error: 'email and password required' });
    expect(createClient).not.toHaveBeenCalled();
  });

  it('returns 401 when Supabase signInWithPassword returns an error', async () => {
    signInWithPassword.mockResolvedValue({
      error: {
        message: 'Invalid login credentials',
      },
    });

    const response = await POST(
      makeRequest({
        email: 'x@test.com',
        password: 'pass',
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Invalid login credentials' });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'x@test.com',
      password: 'pass',
    });
  });

  it('returns 200 when signInWithPassword succeeds', async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    const response = await POST(
      makeRequest({
        email: 'x@test.com',
        password: 'pass',
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'x@test.com',
      password: 'pass',
    });
  });
});
