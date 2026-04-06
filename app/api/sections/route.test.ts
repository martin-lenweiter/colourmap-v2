import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const {
  createSectionWithTrackers,
  listSectionsForToday,
  normalizeCreateSectionInput,
  SectionValidationError,
} = vi.hoisted(() => {
  const createSectionWithTrackers = vi.fn();
  const listSectionsForToday = vi.fn();
  const normalizeCreateSectionInput = vi.fn((value) => value as { name: string });
  class SectionValidationError extends Error {
    name = 'SectionValidationError';
  }
  return {
    createSectionWithTrackers,
    listSectionsForToday,
    normalizeCreateSectionInput,
    SectionValidationError,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/sections', () => ({
  createSectionWithTrackers,
  listSectionsForToday,
  normalizeCreateSectionInput,
  SectionValidationError,
}));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('sections route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    listSectionsForToday.mockReset();
    createSectionWithTrackers.mockReset();
    normalizeCreateSectionInput.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    listSectionsForToday.mockResolvedValue({ sections: [{ id: 'section-1' }], entries: {} });
    createSectionWithTrackers.mockResolvedValue({ id: 'section-1', name: 'Focus' });
    normalizeCreateSectionInput.mockImplementation((value) => value as { name: string });
  });

  it('lists sections with today entries', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      sections: [{ id: 'section-1' }],
      entries: {},
    });
    expect(listSectionsForToday).toHaveBeenCalledWith('user-1', expect.any(String));
  });

  it('creates a section', async () => {
    const body = { name: 'Focus', trackers: [] };
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: 'section-1', name: 'Focus' });
    expect(normalizeCreateSectionInput).toHaveBeenCalledWith(body);
    expect(createSectionWithTrackers).toHaveBeenCalledWith('user-1', body);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ name: 'Focus' }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when section validation fails', async () => {
    normalizeCreateSectionInput.mockImplementation(() => {
      throw new SectionValidationError('name is required');
    });

    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'name is required' });
  });

  it('rethrows unexpected persistence failures', async () => {
    createSectionWithTrackers.mockRejectedValue(new Error('insert failed'));

    await expect(POST(makeRequest({ name: 'Focus' }))).rejects.toThrow('insert failed');
  });
});
