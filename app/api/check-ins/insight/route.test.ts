import { beforeEach, describe, expect, it, vi } from 'vitest';

const streamedResponse = new Response('insight stream');

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
const { buildCheckInInsightPrompt, normalizeCheckInInsightInput, ReflectionValidationError } =
  vi.hoisted(() => {
    const buildCheckInInsightPrompt = vi.fn();
    const normalizeCheckInInsightInput = vi.fn((value) => value as { checkInId: string });
    class ReflectionValidationError extends Error {
      name = 'ReflectionValidationError';
    }
    return { buildCheckInInsightPrompt, normalizeCheckInInsightInput, ReflectionValidationError };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@ai-sdk/anthropic', () => ({ anthropic }));
vi.mock('ai', () => ({ streamText }));
vi.mock('@/lib/services/reflections', () => ({
  buildCheckInInsightPrompt,
  normalizeCheckInInsightInput,
  ReflectionValidationError,
}));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/check-ins/insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/check-ins/insight', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    anthropic.mockClear();
    streamText.mockClear();
    buildCheckInInsightPrompt.mockReset();
    normalizeCheckInInsightInput.mockClear();
    getUser.mockResolvedValue({ data: { user } });
    buildCheckInInsightPrompt.mockResolvedValue('insight prompt');
  });

  it('streams an insight for authenticated users', async () => {
    const response = await POST(makeRequest({ checkInId: 'check-1' }));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('insight stream');
    expect(normalizeCheckInInsightInput).toHaveBeenCalledWith({ checkInId: 'check-1' });
    expect(buildCheckInInsightPrompt).toHaveBeenCalledWith('user-1', { checkInId: 'check-1' });
  });

  it('returns 401 text when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ checkInId: 'check-1' }));

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe('Unauthorized');
  });

  it('returns 400 for invalid JSON bodies', async () => {
    const response = await POST(
      new Request('http://localhost/api/check-ins/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when the service rejects the request', async () => {
    buildCheckInInsightPrompt.mockRejectedValue(new ReflectionValidationError('No check-in found'));

    const response = await POST(makeRequest({ checkInId: 'missing' }));

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('No check-in found');
  });

  it('rethrows unexpected service failures', async () => {
    buildCheckInInsightPrompt.mockRejectedValue(new Error('db down'));

    await expect(POST(makeRequest({ checkInId: 'check-1' }))).rejects.toThrow('db down');
  });
});
