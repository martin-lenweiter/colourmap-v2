import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { removeDesignerObservation } = vi.hoisted(() => ({
  removeDesignerObservation: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/designer-observations', () => ({ removeDesignerObservation }));

import { DELETE } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'obs-1' });

describe('designer observation detail route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    removeDesignerObservation.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    removeDesignerObservation.mockResolvedValue(true);
  });

  it('deletes an observation', async () => {
    const response = await DELETE(new Request('http://localhost/api/designer-observations/obs-1'), {
      params,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(removeDesignerObservation).toHaveBeenCalledWith('user-1', 'obs-1');
  });

  it('returns 404 when the observation is missing or not owned by user', async () => {
    removeDesignerObservation.mockResolvedValue(false);
    const response = await DELETE(new Request('http://localhost/api/designer-observations/obs-2'), {
      params,
    });
    expect(response.status).toBe(404);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await DELETE(new Request('http://localhost/api/designer-observations/obs-1'), {
      params,
    });
    expect(response.status).toBe(401);
  });
});
