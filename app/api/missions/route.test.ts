import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { createMission, listMissions, MissionValidationError, normalizeCreateMissionInput } =
  vi.hoisted(() => {
    const createMission = vi.fn();
    const listMissions = vi.fn();
    const normalizeCreateMissionInput = vi.fn((value) => value as { title: string });
    class MissionValidationError extends Error {
      name = 'MissionValidationError';
    }
    return { createMission, listMissions, MissionValidationError, normalizeCreateMissionInput };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/missions', () => ({
  createMission,
  listMissions,
  MissionValidationError,
  normalizeCreateMissionInput,
}));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/missions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('missions route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    createMission.mockReset();
    listMissions.mockReset();
    normalizeCreateMissionInput.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    createMission.mockResolvedValue({ id: 'mission-1', title: 'Ship' });
    listMissions.mockResolvedValue([{ id: 'mission-1', title: 'Ship' }]);
    normalizeCreateMissionInput.mockImplementation((value) => value as { title: string });
  });

  it('lists missions for authenticated users', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([{ id: 'mission-1', title: 'Ship' }]);
    expect(listMissions).toHaveBeenCalledWith('user-1');
  });

  it('creates a mission', async () => {
    const response = await POST(makeRequest({ title: 'Ship' }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: 'mission-1', title: 'Ship' });
    expect(normalizeCreateMissionInput).toHaveBeenCalledWith({ title: 'Ship' });
    expect(createMission).toHaveBeenCalledWith('user-1', 'Ship');
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ title: 'Ship' }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when validation fails', async () => {
    normalizeCreateMissionInput.mockImplementation(() => {
      throw new MissionValidationError('title is required');
    });

    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'title is required' });
  });

  it('rethrows unexpected persistence failures', async () => {
    createMission.mockRejectedValue(new Error('insert failed'));

    await expect(POST(makeRequest({ title: 'Ship' }))).rejects.toThrow('insert failed');
  });
});
