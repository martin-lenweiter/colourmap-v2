import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const {
  mutateSectionTracker,
  normalizeRenameSectionInput,
  normalizeSectionTrackerMutationInput,
  removeSection,
  renameSection,
  SectionValidationError,
} = vi.hoisted(() => {
  const mutateSectionTracker = vi.fn();
  const normalizeRenameSectionInput = vi.fn((value) => value as { name: string });
  const normalizeSectionTrackerMutationInput = vi.fn(
    (value) => value as { action: 'create'; label: string; type: string },
  );
  const removeSection = vi.fn();
  const renameSection = vi.fn();
  class SectionValidationError extends Error {
    name = 'SectionValidationError';
  }
  return {
    mutateSectionTracker,
    normalizeRenameSectionInput,
    normalizeSectionTrackerMutationInput,
    removeSection,
    renameSection,
    SectionValidationError,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/sections', () => ({
  mutateSectionTracker,
  normalizeRenameSectionInput,
  normalizeSectionTrackerMutationInput,
  removeSection,
  renameSection,
  SectionValidationError,
}));

import { DELETE, PATCH, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'section-1' });

function makePatchRequest(body: unknown) {
  return new Request('http://localhost/api/sections/section-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makePostRequest(body: unknown) {
  return new Request('http://localhost/api/sections/section-1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('section detail route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    mutateSectionTracker.mockReset();
    normalizeRenameSectionInput.mockReset();
    normalizeSectionTrackerMutationInput.mockReset();
    removeSection.mockReset();
    renameSection.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    renameSection.mockResolvedValue({ id: 'section-1', name: 'Focus' });
    mutateSectionTracker.mockResolvedValue({ tracker: { id: 'tracker-1', label: 'Energy' } });
    removeSection.mockResolvedValue(true);
    normalizeRenameSectionInput.mockImplementation((value) => value as { name: string });
    normalizeSectionTrackerMutationInput.mockImplementation(
      (value) => value as { action: 'create'; label: string; type: string },
    );
  });

  it('renames a section', async () => {
    const response = await PATCH(makePatchRequest({ name: 'Focus' }), { params });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: 'section-1', name: 'Focus' });
    expect(normalizeRenameSectionInput).toHaveBeenCalledWith({ name: 'Focus' });
    expect(renameSection).toHaveBeenCalledWith('user-1', 'section-1', 'Focus');
  });

  it('creates a tracker', async () => {
    const body = { action: 'create', label: 'Energy', type: 'scale' };
    const response = await POST(makePostRequest(body), { params });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: 'tracker-1', label: 'Energy' });
    expect(normalizeSectionTrackerMutationInput).toHaveBeenCalledWith(body);
    expect(mutateSectionTracker).toHaveBeenCalledWith('section-1', body);
  });

  it('deletes a section', async () => {
    const response = await DELETE(new Request('http://localhost/api/sections/section-1'), {
      params,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await PATCH(makePatchRequest({ name: 'Focus' }), { params });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/sections/section-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
      { params },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when section validation fails', async () => {
    normalizeRenameSectionInput.mockImplementation(() => {
      throw new SectionValidationError('name is required');
    });

    const response = await PATCH(makePatchRequest({ name: '' }), { params });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'name is required' });
  });

  it('returns 404 when the section is missing', async () => {
    renameSection.mockResolvedValue(null);

    const response = await PATCH(makePatchRequest({ name: 'Focus' }), { params });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not found' });
  });

  it('rethrows unexpected persistence failures', async () => {
    mutateSectionTracker.mockRejectedValue(new Error('insert failed'));

    await expect(
      POST(makePostRequest({ label: 'Energy', type: 'scale' }), { params }),
    ).rejects.toThrow('insert failed');
  });
});
