import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { listConversations, createNewConversation } = vi.hoisted(() => ({
  listConversations: vi.fn(),
  createNewConversation: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/chat', () => ({ listConversations, createNewConversation }));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user }, error: null });
});

describe('GET /api/chat', () => {
  it('returns conversations for authenticated user', async () => {
    listConversations.mockResolvedValue([{ id: 'conv-1', name: 'Weekend' }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe('POST /api/chat', () => {
  it('creates a conversation', async () => {
    createNewConversation.mockResolvedValue({ id: 'conv-2', name: 'Band', channels: [] });
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Band', memberIds: ['user-2'] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it('returns 400 when memberIds is missing', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
