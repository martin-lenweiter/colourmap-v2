import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const orderBy = vi.fn();
const where = vi.fn(() => ({ orderBy, limit: vi.fn().mockResolvedValue([]) }));
const from = vi.fn(() => ({ where }));
const select = vi.fn(() => ({ from }));
const updateWhere = vi.fn();
const updateSet = vi.fn(() => ({ where: updateWhere }));
const update = vi.fn(() => ({ set: updateSet }));
const insertValues = vi.fn();
const insert = vi.fn(() => ({ values: insertValues }));

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => ({ select, update, insert })),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/db/client', () => ({ getDb }));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/life-scan-answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('life-scan-answers route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    orderBy.mockReset();
    where.mockClear();
    from.mockClear();
    select.mockClear();
    updateWhere.mockReset();
    insertValues.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    orderBy.mockResolvedValue([{ key: 'vision', value: 'Zurich' }]);
  });

  it('returns latest answers', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ answers: { vision: 'Zurich' } });
  });

  it('writes submitted answers', async () => {
    const response = await POST(makeRequest({ answers: { vision: 'Zurich' } }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest({ answers: {} }));
    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid payloads', async () => {
    const response = await POST(makeRequest({ nope: true }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'answers object is required' });
  });

  it('rethrows unexpected persistence failures', async () => {
    where.mockImplementationOnce(() => ({
      orderBy,
      limit: vi.fn().mockRejectedValue(new Error('db down')),
    }));
    await expect(POST(makeRequest({ answers: { vision: 'Zurich' } }))).rejects.toThrow('db down');
  });
});
