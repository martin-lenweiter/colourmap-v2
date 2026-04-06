import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({
    auth: { getUser },
  }));

  return { createClient, getUser };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));

import {
  parseJsonBody,
  requireAuthenticatedUser,
  unauthorizedTextResponse,
  withAuthenticatedUser,
} from './route-helpers';

const fakeUser = { id: 'user-1', email: 'test@example.com' };

describe('requireAuthenticatedUser', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
  });

  it('returns the user when authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: fakeUser } });

    const result = await requireAuthenticatedUser();

    expect(result).toEqual({ ok: true, value: fakeUser });
  });

  it('returns the default JSON 401 response when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const result = await requireAuthenticatedUser();

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Expected unauthenticated result');
    }

    expect(result.response.status).toBe(401);
    await expect(result.response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('supports a custom unauthorized response', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const result = await requireAuthenticatedUser({
      unauthorizedResponse: unauthorizedTextResponse,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Expected unauthenticated result');
    }

    expect(result.response.status).toBe(401);
    await expect(result.response.text()).resolves.toBe('Unauthorized');
  });
});

describe('withAuthenticatedUser', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
  });

  it('passes the authenticated user to the handler', async () => {
    getUser.mockResolvedValue({ data: { user: fakeUser } });

    const handler = vi.fn(async () => new Response('ok'));
    const response = await withAuthenticatedUser(handler);

    expect(handler).toHaveBeenCalledWith(fakeUser);
    await expect(response.text()).resolves.toBe('ok');
  });
});

describe('parseJsonBody', () => {
  it('returns parsed JSON for valid bodies', async () => {
    const result = await parseJsonBody(
      new Request('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Hello' }),
      }),
    );

    expect(result).toEqual({ ok: true, value: { title: 'Hello' } });
  });

  it('returns a 400 response for invalid JSON', async () => {
    const result = await parseJsonBody(
      new Request('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Expected invalid JSON result');
    }

    expect(result.response.status).toBe(400);
    await expect(result.response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });
});
