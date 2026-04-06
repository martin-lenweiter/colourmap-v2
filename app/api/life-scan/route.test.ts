import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const {
  listLatestLifeScans,
  normalizeSubmitLifeScanInput,
  submitLifeScan,
  LifeScanValidationError,
} = vi.hoisted(() => {
  const listLatestLifeScans = vi.fn();
  const normalizeSubmitLifeScanInput = vi.fn((value) => value as { scanGroup: string });
  const submitLifeScan = vi.fn();
  class LifeScanValidationError extends Error {
    name = 'LifeScanValidationError';
  }
  return {
    listLatestLifeScans,
    normalizeSubmitLifeScanInput,
    submitLifeScan,
    LifeScanValidationError,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/life-scans', () => ({
  listLatestLifeScans,
  normalizeSubmitLifeScanInput,
  submitLifeScan,
  LifeScanValidationError,
}));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/life-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('life-scan route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    listLatestLifeScans.mockReset();
    normalizeSubmitLifeScanInput.mockReset();
    submitLifeScan.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    listLatestLifeScans.mockResolvedValue([{ id: 'scan-1' }]);
    submitLifeScan.mockResolvedValue({ scans: [{ id: 'scan-1' }], scanGroup: 'group-1' });
    normalizeSubmitLifeScanInput.mockImplementation((value) => value as { scanGroup: string });
  });

  it('lists life scans', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([{ id: 'scan-1' }]);
    expect(listLatestLifeScans).toHaveBeenCalledWith('user-1');
  });

  it('submits a life scan', async () => {
    const body = { doors: [{ door: 'Feeling', sliders: { calm: 70 } }], scanGroup: 'group-1' };
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      scans: [{ id: 'scan-1' }],
      scanGroup: 'group-1',
    });
    expect(normalizeSubmitLifeScanInput).toHaveBeenCalledWith(body);
    expect(submitLifeScan).toHaveBeenCalledWith('user-1', body);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ doors: [], scanGroup: 'group-1' }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/life-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when the submission is invalid', async () => {
    normalizeSubmitLifeScanInput.mockImplementation(() => {
      throw new LifeScanValidationError('doors array is required');
    });

    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'doors array is required' });
  });

  it('rethrows unexpected persistence failures', async () => {
    submitLifeScan.mockRejectedValue(new Error('insert failed'));

    await expect(POST(makeRequest({ doors: [], scanGroup: 'group-1' }))).rejects.toThrow(
      'insert failed',
    );
  });
});
