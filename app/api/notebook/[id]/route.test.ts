import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const {
  deleteNotebookEntry,
  normalizeUpdateNotebookEntryInput,
  NotebookValidationError,
  updateNotebookEntry,
} = vi.hoisted(() => {
  const deleteNotebookEntry = vi.fn();
  const normalizeUpdateNotebookEntryInput = vi.fn((value) => value as { title: string });
  const updateNotebookEntry = vi.fn();
  class NotebookValidationError extends Error {
    name = 'NotebookValidationError';
  }
  return {
    deleteNotebookEntry,
    normalizeUpdateNotebookEntryInput,
    NotebookValidationError,
    updateNotebookEntry,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/notebook', () => ({
  deleteNotebookEntry,
  normalizeUpdateNotebookEntryInput,
  NotebookValidationError,
  updateNotebookEntry,
}));

import { DELETE, PATCH } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'note-1' });

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/notebook/note-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('notebook detail route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    deleteNotebookEntry.mockReset();
    normalizeUpdateNotebookEntryInput.mockReset();
    updateNotebookEntry.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    updateNotebookEntry.mockResolvedValue({ id: 'note-1', title: 'Draft' });
    normalizeUpdateNotebookEntryInput.mockImplementation((value) => value as { title: string });
  });

  it('updates a notebook entry', async () => {
    const body = { title: 'Draft' };
    const response = await PATCH(makeRequest(body), { params });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: 'note-1', title: 'Draft' });
    expect(normalizeUpdateNotebookEntryInput).toHaveBeenCalledWith(body);
    expect(updateNotebookEntry).toHaveBeenCalledWith('user-1', 'note-1', body);
  });

  it('deletes a notebook entry', async () => {
    const response = await DELETE(new Request('http://localhost/api/notebook/note-1'), { params });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(deleteNotebookEntry).toHaveBeenCalledWith('user-1', 'note-1');
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await PATCH(makeRequest({ title: 'Draft' }), { params });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/notebook/note-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
      { params },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when notebook validation fails', async () => {
    normalizeUpdateNotebookEntryInput.mockImplementation(() => {
      throw new NotebookValidationError('No valid fields');
    });

    const response = await PATCH(makeRequest({ title: '   ' }), { params });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'No valid fields' });
  });

  it('returns 404 when the entry is missing', async () => {
    updateNotebookEntry.mockResolvedValue(null);

    const response = await PATCH(makeRequest({ title: 'Draft' }), { params });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not found' });
  });

  it('rethrows unexpected persistence failures', async () => {
    updateNotebookEntry.mockRejectedValue(new Error('update failed'));

    await expect(PATCH(makeRequest({ title: 'Draft' }), { params })).rejects.toThrow(
      'update failed',
    );
  });
});
