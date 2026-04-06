import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const selectOrderBy = vi.fn();
const selectWhere = vi.fn(() => ({ orderBy: selectOrderBy }));
const selectFrom = vi.fn(() => ({ where: selectWhere }));
const select = vi.fn(() => ({ from: selectFrom }));
const insertReturning = vi.fn();
const insertValues = vi.fn(() => ({ returning: insertReturning }));
const insert = vi.fn(() => ({ values: insertValues }));

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => ({ select, insert })),
}));
const { getBacklogItems, insertBacklogItem } = vi.hoisted(() => ({
  getBacklogItems: vi.fn(),
  insertBacklogItem: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/db/client', () => ({ getDb }));
vi.mock('@/lib/db/queries/backlog', () => ({ getBacklogItems, insertBacklogItem }));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/backlog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('backlog route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    getBacklogItems.mockReset();
    insertBacklogItem.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    getBacklogItems.mockResolvedValue([{ id: 'item-1', title: 'Inbox' }]);
    insertBacklogItem.mockResolvedValue({ id: 'item-1', title: 'Inbox' });
  });

  it('lists backlog items', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([{ id: 'item-1', title: 'Inbox' }]);
  });

  it('creates a backlog item', async () => {
    const response = await POST(makeRequest({ title: ' Inbox ' }));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: 'item-1', title: 'Inbox' });
    expect(insertBacklogItem).toHaveBeenCalledWith(expect.anything(), {
      userId: 'user-1',
      title: 'Inbox',
    });
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest({ title: 'Inbox' }));
    expect(response.status).toBe(401);
  });

  it('returns 400 for validation failure', async () => {
    const response = await POST(makeRequest({ title: '' }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'title must be a non-empty string' });
  });

  it('rethrows unexpected persistence failures', async () => {
    insertBacklogItem.mockRejectedValue(new Error('insert failed'));
    await expect(POST(makeRequest({ title: 'Inbox' }))).rejects.toThrow('insert failed');
  });
});
