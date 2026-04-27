import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/db/client', () => ({ getDb }));

import { GET } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

const dbRows = [
  { emotion_name: 'Courage', emotion_color: '#F8C040', current_count: 5, yesterday_count: 3 },
  { emotion_name: 'Fear', emotion_color: '#F080B8', current_count: 2, yesterday_count: 4 },
  { emotion_name: 'Peace', emotion_color: '#88C8E8', current_count: 1, yesterday_count: 1 },
];

describe('GET /api/field', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    getDb.mockReturnValue({ execute: vi.fn().mockResolvedValue(dbRows) });
  });

  it('returns field entries with trend arrows', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([
      { emotionName: 'Courage', emotionColor: '#F8C040', count: 5, trend: 'up' },
      { emotionName: 'Fear', emotionColor: '#F080B8', count: 2, trend: 'down' },
      { emotionName: 'Peace', emotionColor: '#88C8E8', count: 1, trend: 'flat' },
    ]);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
