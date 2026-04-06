import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { normalizeSectionEntryInput, recordSectionEntry, SectionValidationError } = vi.hoisted(
  () => {
    const normalizeSectionEntryInput = vi.fn(
      (value) => value as { trackerId: string; value: number },
    );
    const recordSectionEntry = vi.fn();
    class SectionValidationError extends Error {
      name = 'SectionValidationError';
    }
    return { normalizeSectionEntryInput, recordSectionEntry, SectionValidationError };
  },
);

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/sections', () => ({
  normalizeSectionEntryInput,
  recordSectionEntry,
  SectionValidationError,
}));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'section-1' });

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/sections/section-1/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('section entries route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    normalizeSectionEntryInput.mockReset();
    recordSectionEntry.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    recordSectionEntry.mockResolvedValue({ id: 'entry-1', value: 4 });
    normalizeSectionEntryInput.mockImplementation(
      (value) => value as { trackerId: string; value: number },
    );
  });

  it('records a section entry', async () => {
    const body = { trackerId: 'tracker-1', value: 4 };
    const response = await POST(makeRequest(body), { params });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: 'entry-1', value: 4 });
    expect(normalizeSectionEntryInput).toHaveBeenCalledWith(body);
    expect(recordSectionEntry).toHaveBeenCalledWith('user-1', expect.any(String), body);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ trackerId: 'tracker-1', value: 4 }), { params });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/sections/section-1/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
      { params },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when validation fails', async () => {
    normalizeSectionEntryInput.mockImplementation(() => {
      throw new SectionValidationError('trackerId and value are required');
    });

    const response = await POST(makeRequest({}), { params });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'trackerId and value are required' });
  });

  it('rethrows unexpected persistence failures', async () => {
    recordSectionEntry.mockRejectedValue(new Error('upsert failed'));

    await expect(
      POST(makeRequest({ trackerId: 'tracker-1', value: 4 }), { params }),
    ).rejects.toThrow('upsert failed');
  });
});
