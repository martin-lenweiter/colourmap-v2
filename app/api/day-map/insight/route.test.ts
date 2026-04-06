import { beforeEach, describe, expect, it, vi } from 'vitest';

const streamedResponse = new Response('day-map stream');

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
const { buildDayMapInsightPrompt, normalizeDayMapInsightInput, ReflectionValidationError } =
  vi.hoisted(() => {
    const buildDayMapInsightPrompt = vi.fn();
    const normalizeDayMapInsightInput = vi.fn((value) => value as { dayMapEntries: [] });
    class ReflectionValidationError extends Error {
      name = 'ReflectionValidationError';
    }
    return { buildDayMapInsightPrompt, normalizeDayMapInsightInput, ReflectionValidationError };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@ai-sdk/anthropic', () => ({ anthropic }));
vi.mock('ai', () => ({ streamText }));
vi.mock('@/lib/services/reflections', () => ({
  buildDayMapInsightPrompt,
  normalizeDayMapInsightInput,
  ReflectionValidationError,
}));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/day-map/insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/day-map/insight', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    anthropic.mockClear();
    streamText.mockClear();
    buildDayMapInsightPrompt.mockReset();
    normalizeDayMapInsightInput.mockClear();
    getUser.mockResolvedValue({ data: { user } });
    buildDayMapInsightPrompt.mockResolvedValue('day-map prompt');
  });

  it('streams a day-map insight', async () => {
    const body = { dayMapEntries: [{ time: '09:00', activity: 'Code', energy: 8 }] };
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('day-map stream');
    expect(normalizeDayMapInsightInput).toHaveBeenCalledWith(body);
    expect(buildDayMapInsightPrompt).toHaveBeenCalledWith('user-1', body);
  });

  it('returns 401 text when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ dayMapEntries: [] }));

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe('Unauthorized');
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/day-map/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when there is not enough data', async () => {
    buildDayMapInsightPrompt.mockRejectedValue(new ReflectionValidationError('Not enough data'));

    const response = await POST(makeRequest({ dayMapEntries: [] }));

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Not enough data');
  });

  it('rethrows unexpected service failures', async () => {
    buildDayMapInsightPrompt.mockRejectedValue(new Error('query failed'));

    await expect(POST(makeRequest({ dayMapEntries: [] }))).rejects.toThrow('query failed');
  });
});
