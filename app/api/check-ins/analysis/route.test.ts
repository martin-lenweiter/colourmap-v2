import { beforeEach, describe, expect, it, vi } from 'vitest';

const streamedResponse = new Response('analysis stream');

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
const { buildCheckInAnalysisPrompt, ReflectionValidationError } = vi.hoisted(() => {
  const buildCheckInAnalysisPrompt = vi.fn();
  class ReflectionValidationError extends Error {
    name = 'ReflectionValidationError';
  }
  return { buildCheckInAnalysisPrompt, ReflectionValidationError };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@ai-sdk/anthropic', () => ({ anthropic }));
vi.mock('ai', () => ({ streamText }));
vi.mock('@/lib/services/reflections', () => ({
  buildCheckInAnalysisPrompt,
  ReflectionValidationError,
}));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

describe('POST /api/check-ins/analysis', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    anthropic.mockClear();
    streamText.mockClear();
    buildCheckInAnalysisPrompt.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    buildCheckInAnalysisPrompt.mockResolvedValue('analysis prompt');
  });

  it('streams an analysis for authenticated users', async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('analysis stream');
    expect(buildCheckInAnalysisPrompt).toHaveBeenCalledWith('user-1');
    expect(streamText).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'analysis prompt' }));
  });

  it('returns 401 text when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST();

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe('Unauthorized');
    expect(buildCheckInAnalysisPrompt).not.toHaveBeenCalled();
  });

  it('returns 400 when the prompt service reports missing analysis data', async () => {
    buildCheckInAnalysisPrompt.mockRejectedValue(
      new ReflectionValidationError('No check-ins to analyze'),
    );

    const response = await POST();

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('No check-ins to analyze');
  });

  it('rethrows unexpected service failures', async () => {
    buildCheckInAnalysisPrompt.mockRejectedValue(new Error('db down'));

    await expect(POST()).rejects.toThrow('db down');
  });
});
