import { beforeEach, describe, expect, it, vi } from 'vitest';

const streamedResponse = new Response('journey stream');

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
const { buildJourneyReflectionPrompt, normalizeJourneyReflectionInput, ReflectionValidationError } =
  vi.hoisted(() => {
    const buildJourneyReflectionPrompt = vi.fn();
    const normalizeJourneyReflectionInput = vi.fn(
      (value) => value as { prompt: string; tone: string },
    );
    class ReflectionValidationError extends Error {
      name = 'ReflectionValidationError';
    }
    return {
      buildJourneyReflectionPrompt,
      normalizeJourneyReflectionInput,
      ReflectionValidationError,
    };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@ai-sdk/anthropic', () => ({ anthropic }));
vi.mock('ai', () => ({ streamText }));
vi.mock('@/lib/services/reflections', () => ({
  buildJourneyReflectionPrompt,
  normalizeJourneyReflectionInput,
  ReflectionValidationError,
}));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/journey/reflect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/journey/reflect', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    anthropic.mockClear();
    streamText.mockClear();
    buildJourneyReflectionPrompt.mockReset();
    normalizeJourneyReflectionInput.mockClear();
    getUser.mockResolvedValue({ data: { user } });
    buildJourneyReflectionPrompt.mockResolvedValue({
      prompt: 'journey prompt',
      tonePrompt: 'warrior tone',
    });
  });

  it('streams a journey reflection', async () => {
    const body = { prompt: 'Who am I becoming?', tone: 'warrior' };
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('journey stream');
    expect(normalizeJourneyReflectionInput).toHaveBeenCalledWith(body);
    expect(buildJourneyReflectionPrompt).toHaveBeenCalledWith('user-1', body);
    expect(streamText).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'journey prompt' }));
  });

  it('returns 401 text when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ prompt: 'x', tone: 'warrior' }));

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe('Unauthorized');
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/journey/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when the service rejects the payload', async () => {
    buildJourneyReflectionPrompt.mockRejectedValue(new ReflectionValidationError('Invalid body'));

    const response = await POST(makeRequest({ prompt: 'x', tone: 'warrior' }));

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Invalid body');
  });

  it('rethrows unexpected service failures', async () => {
    buildJourneyReflectionPrompt.mockRejectedValue(new Error('query failed'));

    await expect(POST(makeRequest({ prompt: 'x', tone: 'warrior' }))).rejects.toThrow(
      'query failed',
    );
  });
});
