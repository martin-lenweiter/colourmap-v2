import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const {
  createNotebookEntry,
  listNotebookEntries,
  normalizeCreateNotebookEntryInput,
  NotebookValidationError,
} = vi.hoisted(() => {
  const createNotebookEntry = vi.fn();
  const listNotebookEntries = vi.fn();
  const normalizeCreateNotebookEntryInput = vi.fn((value) => value as { title: string });
  class NotebookValidationError extends Error {
    name = 'NotebookValidationError';
  }
  return {
    createNotebookEntry,
    listNotebookEntries,
    normalizeCreateNotebookEntryInput,
    NotebookValidationError,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/notebook', () => ({
  createNotebookEntry,
  listNotebookEntries,
  normalizeCreateNotebookEntryInput,
  NotebookValidationError,
}));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/notebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('notebook route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    createNotebookEntry.mockReset();
    listNotebookEntries.mockReset();
    normalizeCreateNotebookEntryInput.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    createNotebookEntry.mockResolvedValue({ id: 'note-1', title: 'Draft' });
    listNotebookEntries.mockResolvedValue([{ id: 'note-1', title: 'Draft' }]);
    normalizeCreateNotebookEntryInput.mockImplementation((value) => value as { title: string });
  });

  it('lists notebook entries', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([{ id: 'note-1', title: 'Draft' }]);
    expect(listNotebookEntries).toHaveBeenCalledWith('user-1');
  });

  it('creates a notebook entry', async () => {
    const body = { category: 'Ideas', title: 'Draft', content: 'Lines' };
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: 'note-1', title: 'Draft' });
    expect(normalizeCreateNotebookEntryInput).toHaveBeenCalledWith(body);
    expect(createNotebookEntry).toHaveBeenCalledWith('user-1', body);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ category: 'Ideas', title: 'Draft' }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when notebook validation fails', async () => {
    normalizeCreateNotebookEntryInput.mockImplementation(() => {
      throw new NotebookValidationError('category and title required');
    });

    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'category and title required' });
  });

  it('rethrows unexpected persistence failures', async () => {
    createNotebookEntry.mockRejectedValue(new Error('insert failed'));

    await expect(POST(makeRequest({ category: 'Ideas', title: 'Draft' }))).rejects.toThrow(
      'insert failed',
    );
  });
});
