import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { getResonancesByUser } = vi.hoisted(() => ({
  getResonancesByUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/db/queries/sparks', () => ({ getResonancesByUser }));

import { GET } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

describe('GET /api/sparks/resonances/mine', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    getResonancesByUser.mockResolvedValue([{ id: 'r-1', sparkId: 'spark-1' }]);
  });

  it("returns user's resonances", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([{ id: 'r-1', sparkId: 'spark-1' }]);
    expect(getResonancesByUser).toHaveBeenCalledWith('user-1');
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
