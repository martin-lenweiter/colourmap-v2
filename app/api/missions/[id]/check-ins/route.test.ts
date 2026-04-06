import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { listMissionCheckIns } = vi.hoisted(() => ({
  listMissionCheckIns: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/check-ins', () => ({ listMissionCheckIns }));

import { GET } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'mission-1' });

describe('mission check-ins route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    listMissionCheckIns.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    listMissionCheckIns.mockResolvedValue([{ id: 'check-1' }]);
  });

  it('returns mission check-ins', async () => {
    const response = await GET(new Request('http://localhost/api/missions/mission-1/check-ins'), {
      params,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([{ id: 'check-1' }]);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await GET(new Request('http://localhost/api/missions/mission-1/check-ins'), {
      params,
    });
    expect(response.status).toBe(401);
  });

  it('rethrows query failures', async () => {
    listMissionCheckIns.mockRejectedValue(new Error('query failed'));
    await expect(
      GET(new Request('http://localhost/api/missions/mission-1/check-ins'), { params }),
    ).rejects.toThrow('query failed');
  });
});
