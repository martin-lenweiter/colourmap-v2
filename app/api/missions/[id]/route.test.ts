import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { normalizeMissionUpdateInput, updateMissionFields, removeMission, MissionValidationError } =
  vi.hoisted(() => {
    const normalizeMissionUpdateInput = vi.fn((value) => value as { title?: string });
    const updateMissionFields = vi.fn();
    const removeMission = vi.fn();
    class MissionValidationError extends Error {
      name = 'MissionValidationError';
    }
    return {
      normalizeMissionUpdateInput,
      updateMissionFields,
      removeMission,
      MissionValidationError,
    };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/missions', () => ({
  normalizeMissionUpdateInput,
  updateMissionFields,
  removeMission,
  MissionValidationError,
}));

import { DELETE, PATCH } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/missions/mission-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ id: 'mission-1' });

describe('mission detail route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    normalizeMissionUpdateInput.mockReset();
    updateMissionFields.mockReset();
    removeMission.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    updateMissionFields.mockResolvedValue({ id: 'mission-1', title: 'Ship' });
    removeMission.mockResolvedValue(true);
    normalizeMissionUpdateInput.mockImplementation((value) => value as { title?: string });
  });

  it('updates a mission', async () => {
    const response = await PATCH(makeRequest({ title: 'Ship' }), { params });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: 'mission-1', title: 'Ship' });
    expect(normalizeMissionUpdateInput).toHaveBeenCalledWith({ title: 'Ship' });
    expect(updateMissionFields).toHaveBeenCalledWith('user-1', 'mission-1', { title: 'Ship' });
  });

  it('deletes a mission', async () => {
    const response = await DELETE(new Request('http://localhost/api/missions/mission-1'), {
      params,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(removeMission).toHaveBeenCalledWith('user-1', 'mission-1');
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await PATCH(makeRequest({ title: 'Ship' }), { params });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/missions/mission-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
      { params },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when update validation fails', async () => {
    normalizeMissionUpdateInput.mockImplementation(() => {
      throw new MissionValidationError('No valid fields to update');
    });

    const response = await PATCH(makeRequest({ title: '   ' }), { params });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'No valid fields to update' });
  });

  it('returns 404 when the mission is missing', async () => {
    updateMissionFields.mockResolvedValue(null);

    const response = await PATCH(makeRequest({ title: 'Ship' }), { params });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not found' });
  });

  it('rethrows unexpected update failures', async () => {
    updateMissionFields.mockRejectedValue(new Error('update failed'));

    await expect(PATCH(makeRequest({ title: 'Ship' }), { params })).rejects.toThrow(
      'update failed',
    );
  });
});
