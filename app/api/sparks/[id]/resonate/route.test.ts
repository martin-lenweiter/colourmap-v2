import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { resonateWithSpark, respondToResonance, SparkValidationError } = vi.hoisted(() => {
  class SparkValidationError extends Error {
    name = 'SparkValidationError';
  }
  return {
    resonateWithSpark: vi.fn(),
    respondToResonance: vi.fn(),
    SparkValidationError,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/sparks', () => ({
  resonateWithSpark,
  respondToResonance,
  SparkValidationError,
}));

import { PATCH, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'spark-1' });

function makeRequest(method: string, body: unknown) {
  return new Request('http://localhost/api/sparks/spark-1/resonate', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/sparks/[id]/resonate', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    resonateWithSpark.mockResolvedValue({ id: 'r-1', type: 'resonate' });
  });

  it('creates a resonance', async () => {
    const res = await POST(makeRequest('POST', { type: 'resonate' }), { params });
    expect(res.status).toBe(201);
    expect(resonateWithSpark).toHaveBeenCalledWith('spark-1', 'user-1', 'resonate');
  });

  it('creates a join_request', async () => {
    await POST(makeRequest('POST', { type: 'join_request' }), { params });
    expect(resonateWithSpark).toHaveBeenCalledWith('spark-1', 'user-1', 'join_request');
  });

  it('defaults to resonate type', async () => {
    await POST(makeRequest('POST', {}), { params });
    expect(resonateWithSpark).toHaveBeenCalledWith('spark-1', 'user-1', 'resonate');
  });

  it('returns 400 on validation error', async () => {
    resonateWithSpark.mockRejectedValue(
      new SparkValidationError('Cannot resonate with your own spark'),
    );
    const res = await POST(makeRequest('POST', { type: 'resonate' }), { params });
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest('POST', {}), { params });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/sparks/[id]/resonate', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    respondToResonance.mockResolvedValue(undefined);
  });

  it('accepts a resonance', async () => {
    const res = await PATCH(makeRequest('PATCH', { userId: 'user-2', status: 'accepted' }), {
      params,
    });
    expect(res.status).toBe(200);
    expect(respondToResonance).toHaveBeenCalledWith('spark-1', 'user-1', 'user-2', 'accepted');
  });

  it('returns 400 without userId', async () => {
    const res = await PATCH(makeRequest('PATCH', { status: 'accepted' }), { params });
    expect(res.status).toBe(400);
  });

  it('returns 400 with invalid status', async () => {
    const res = await PATCH(makeRequest('PATCH', { userId: 'user-2', status: 'maybe' }), {
      params,
    });
    expect(res.status).toBe(400);
  });
});
