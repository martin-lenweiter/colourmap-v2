import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { getConversationDetail } = vi.hoisted(() => ({ getConversationDetail: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/chat', () => ({ getConversationDetail }));

import { GET } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user }, error: null });
});

describe('GET /api/chat/[conversationId]', () => {
  it('returns conversation detail', async () => {
    getConversationDetail.mockResolvedValue({ id: 'conv-1', channels: [], members: [] });
    const res = await GET(new Request('http://localhost/api/chat/conv-1'), {
      params: Promise.resolve({ conversationId: 'conv-1' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    getConversationDetail.mockResolvedValue(null);
    const res = await GET(new Request('http://localhost/api/chat/bad'), {
      params: Promise.resolve({ conversationId: 'bad' }),
    });
    expect(res.status).toBe(404);
  });
});
