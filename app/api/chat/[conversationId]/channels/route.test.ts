import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { addChannelToConversation } = vi.hoisted(() => ({ addChannelToConversation: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/chat', () => ({ addChannelToConversation }));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user }, error: null });
});

describe('POST /api/chat/[conversationId]/channels', () => {
  it('creates a channel', async () => {
    addChannelToConversation.mockResolvedValue({ id: 'ch-1', name: 'weekend', position: 1 });
    const req = new Request('http://localhost/api/chat/conv-1/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'weekend' }),
    });
    const res = await POST(req, { params: Promise.resolve({ conversationId: 'conv-1' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when name is missing', async () => {
    const req = new Request('http://localhost/api/chat/conv-1/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req, { params: Promise.resolve({ conversationId: 'conv-1' }) });
    expect(res.status).toBe(400);
  });
});
