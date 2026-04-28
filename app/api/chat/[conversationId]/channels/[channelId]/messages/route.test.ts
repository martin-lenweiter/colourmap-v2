import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { fetchMessages, postMessage } = vi.hoisted(() => ({
  fetchMessages: vi.fn(),
  postMessage: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/chat', () => ({ fetchMessages, postMessage }));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = { params: Promise.resolve({ conversationId: 'conv-1', channelId: 'ch-1' }) };

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user }, error: null });
});

describe('GET messages', () => {
  it('returns messages', async () => {
    fetchMessages.mockResolvedValue([{ id: 'msg-1', text: 'hi' }]);
    const res = await GET(
      new Request('http://localhost/api/chat/conv-1/channels/ch-1/messages'),
      params,
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });

  it('returns 404 when channel not found', async () => {
    fetchMessages.mockResolvedValue(null);
    const res = await GET(
      new Request('http://localhost/api/chat/conv-1/channels/bad/messages'),
      params,
    );
    expect(res.status).toBe(404);
  });
});

describe('POST message', () => {
  it('sends a message', async () => {
    postMessage.mockResolvedValue({ id: 'msg-2', text: 'hello' });
    const req = new Request('http://localhost/api/chat/conv-1/channels/ch-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello' }),
    });
    const res = await POST(req, params);
    expect(res.status).toBe(201);
  });

  it('returns 400 when text is missing', async () => {
    const req = new Request('http://localhost/api/chat/conv-1/channels/ch-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req, params);
    expect(res.status).toBe(400);
  });
});
