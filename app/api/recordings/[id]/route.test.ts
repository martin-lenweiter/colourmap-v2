import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { deleteRecording, updateRecording } = vi.hoisted(() => ({
  deleteRecording: vi.fn(),
  updateRecording: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/recordings', () => ({ deleteRecording, updateRecording }));

import { DELETE, PATCH } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'rec-1' });
const REC = { id: 'rec-1', title: 'Jam', category: 'solo' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/recordings/rec-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('recordings detail route', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    updateRecording.mockResolvedValue(REC);
    deleteRecording.mockResolvedValue(REC);
  });

  it('updates a recording', async () => {
    const res = await PATCH(makeRequest({ title: 'Jam' }), { params });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(REC);
    expect(updateRecording).toHaveBeenCalledWith('user-1', 'rec-1', { title: 'Jam' });
  });

  it('deletes a recording', async () => {
    const res = await DELETE(new Request('http://localhost/api/recordings/rec-1'), { params });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ deleted: 'rec-1' });
    expect(deleteRecording).toHaveBeenCalledWith('user-1', 'rec-1');
  });

  it('returns 404 when not found on update', async () => {
    updateRecording.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ title: 'x' }), { params });
    expect(res.status).toBe(404);
  });

  it('returns 404 when not found on delete', async () => {
    deleteRecording.mockResolvedValue(null);
    const res = await DELETE(new Request('http://localhost/api/recordings/rec-1'), { params });
    expect(res.status).toBe(404);
  });

  it('returns 400 when no valid fields', async () => {
    const res = await PATCH(makeRequest({}), { params });
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(makeRequest({ title: 'x' }), { params });
    expect(res.status).toBe(401);
  });
});
