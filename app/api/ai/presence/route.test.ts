import { beforeEach, describe, expect, it, vi } from 'vitest';

const streamedResponse = new Response('presence stream');

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
const { readFile } = vi.hoisted(() => ({ readFile: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@ai-sdk/anthropic', () => ({ anthropic }));
vi.mock('ai', () => ({ streamText }));
vi.mock('node:fs/promises', () => ({ default: { readFile }, readFile }));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/ai/presence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/ai/presence', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    anthropic.mockClear();
    streamText.mockClear();
    readFile.mockReset();
    readFile.mockResolvedValue('# Spec file\nColourmap spec context');
    getUser.mockResolvedValue({ data: { user } });
  });

  it('streams a backend AI reflection for authenticated users', async () => {
    const response = await POST(makeRequest({ message: 'I feel scattered.', surface: 'phone' }));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('presence stream');
    expect(anthropic).toHaveBeenCalledWith('claude-haiku-4-5-20251001');
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        prompt: 'I feel scattered.',
        system: expect.stringContaining('phone'),
      }),
    );
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('Colourmap spec context'),
      }),
    );
  });

  it('returns 401 text when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ message: 'hello' }));

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe('Unauthorized');
  });

  it('rejects empty messages', async () => {
    const response = await POST(makeRequest({ message: '   ' }));

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Message is required');
  });

  it('rejects invalid JSON bodies', async () => {
    const response = await POST(
      new Request('http://localhost/api/ai/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });
});
