import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { removeDesignerObservation, markDesignerObservationDone } = vi.hoisted(() => ({
  removeDesignerObservation: vi.fn(),
  markDesignerObservationDone: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/designer-observations', () => ({
  removeDesignerObservation,
  markDesignerObservationDone,
}));

import { DELETE, PATCH } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'obs-1' });

describe('designer observation detail route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    removeDesignerObservation.mockReset();
    markDesignerObservationDone.mockReset();
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

  describe('PATCH', () => {
    const obsRow = { id: 'obs-1', userId: 'user-1', text: 'foo', area: null, done: true };

    it('marks observation done', async () => {
      markDesignerObservationDone.mockResolvedValue(obsRow);
      const response = await PATCH(
        new Request('http://localhost/api/designer-observations/obs-1', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: true }),
        }),
        { params },
      );
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ done: true });
      expect(markDesignerObservationDone).toHaveBeenCalledWith('user-1', 'obs-1', true);
    });

    it('returns 404 when observation not found', async () => {
      markDesignerObservationDone.mockResolvedValue(null);
      const response = await PATCH(
        new Request('http://localhost/api/designer-observations/obs-1', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: false }),
        }),
        { params },
      );
      expect(response.status).toBe(404);
    });

    it('returns 400 when done is not a boolean', async () => {
      const response = await PATCH(
        new Request('http://localhost/api/designer-observations/obs-1', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: 'yes' }),
        }),
        { params },
      );
      expect(response.status).toBe(400);
    });

    it('returns 401 when unauthenticated', async () => {
      getUser.mockResolvedValue({ data: { user: null } });
      const response = await PATCH(
        new Request('http://localhost/api/designer-observations/obs-1', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: true }),
        }),
        { params },
      );
      expect(response.status).toBe(401);
    });
  });
});
