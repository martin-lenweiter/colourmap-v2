import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { createRecording, listRecordings } = vi.hoisted(() => ({
  createRecording: vi.fn(),
  listRecordings: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/recordings', () => ({ createRecording, listRecordings }));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const REC = {
  id: 'rec-1',
  title: 'Jam',
  storagePath: 'jam.webm',
  publicUrl: 'https://example.com/jam.webm',
};

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/recordings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('recordings route', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    listRecordings.mockResolvedValue([REC]);
    createRecording.mockResolvedValue(REC);
  });

  it('lists recordings', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([REC]);
    expect(listRecordings).toHaveBeenCalledWith('user-1');
  });

  it('creates a recording', async () => {
    const body = {
      title: 'Jam',
      storagePath: 'jam.webm',
      publicUrl: 'https://example.com/jam.webm',
      durationSecs: 60,
      songId: null,
      category: 'solo',
      notes: null,
    };
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual(REC);
  });

  it('returns 400 when title is missing', async () => {
    const res = await POST(makeRequest({ storagePath: 'x', publicUrl: 'y' }));
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest({ title: 'x', storagePath: 'x', publicUrl: 'y' }));
    expect(res.status).toBe(401);
  });
});
