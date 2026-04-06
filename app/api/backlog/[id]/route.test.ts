import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { getDb, returning } = vi.hoisted(() => {
  const returning = vi.fn();
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where }));
  const update = vi.fn(() => ({ set }));
  return { getDb: vi.fn(() => ({ update })), update, set, where, returning };
});

const { deleteBacklogItem, toggleBacklogItem } = vi.hoisted(() => ({
  deleteBacklogItem: vi.fn(),
  toggleBacklogItem: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/db/client', () => ({ getDb }));
vi.mock('@/lib/db/queries/backlog', () => ({ deleteBacklogItem, toggleBacklogItem }));

import { DELETE, PATCH } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'item-1' });

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/backlog/item-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('backlog detail route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    deleteBacklogItem.mockReset();
    toggleBacklogItem.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    returning.mockReset();
    returning.mockResolvedValue([{ id: 'item-1', notes: 'note' }]);
    toggleBacklogItem.mockResolvedValue({ id: 'item-1', done: true });
    deleteBacklogItem.mockResolvedValue(true);
  });

  it('updates backlog notes', async () => {
    const response = await PATCH(makeRequest({ notes: 'note' }), { params });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: 'item-1', notes: 'note' });
  });

  it('toggles backlog completion', async () => {
    const response = await PATCH(makeRequest({ done: true }), { params });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: 'item-1', done: true });
  });

  it('deletes a backlog item', async () => {
    const response = await DELETE(new Request('http://localhost/api/backlog/item-1'), { params });
    expect(response.status).toBe(200);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await PATCH(makeRequest({ done: true }), { params });
    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid payloads', async () => {
    const response = await PATCH(makeRequest({ nope: true }), { params });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'No valid fields' });
  });

  it('returns 404 when delete misses', async () => {
    deleteBacklogItem.mockResolvedValue(false);
    const response = await DELETE(new Request('http://localhost/api/backlog/item-1'), { params });
    expect(response.status).toBe(404);
  });
});
