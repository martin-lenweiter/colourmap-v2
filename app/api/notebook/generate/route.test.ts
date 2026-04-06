import { beforeEach, describe, expect, it, vi } from 'vitest';

const streamedResponse = new Response('generate stream');

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});
const { anthropic } = vi.hoisted(() => ({ anthropic: vi.fn(() => 'model') }));
const { streamText } = vi.hoisted(() => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: () => streamedResponse,
  })),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@ai-sdk/anthropic', () => ({ anthropic }));
vi.mock('ai', () => ({ streamText }));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/notebook/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('notebook generate route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    anthropic.mockClear();
    streamText.mockClear();
    getUser.mockResolvedValue({ data: { user } });
  });

  it('streams generation for valid prompt types', async () => {
    const response = await POST(makeRequest({ type: 'chorus', context: 'city lights' }));
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('generate stream');
  });

  it('returns 401 text when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest({ type: 'chorus', context: 'city lights' }));
    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe('Unauthorized');
  });

  it('returns 400 for invalid type', async () => {
    const response = await POST(makeRequest({ type: 'bad', context: 'city lights' }));
    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Invalid type');
  });

  it('rethrows unexpected ai failures', async () => {
    streamText.mockImplementation(() => {
      throw new Error('model failed');
    });
    await expect(POST(makeRequest({ type: 'chorus', context: 'city lights' }))).rejects.toThrow(
      'model failed',
    );
  });
});
