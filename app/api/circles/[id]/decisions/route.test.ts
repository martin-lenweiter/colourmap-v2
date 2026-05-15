import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { listCircleDecisions, proposeDecision, CircleValidationError } = vi.hoisted(() => {
  const listCircleDecisions = vi.fn();
  const proposeDecision = vi.fn();
  class CircleValidationError extends Error {
    name = 'CircleValidationError';
  }
  return { listCircleDecisions, proposeDecision, CircleValidationError };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/circles', () => ({
  listCircleDecisions,
  proposeDecision,
  CircleValidationError,
}));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'circle-1' });

function makePost(body: unknown) {
  return new Request('http://localhost/api/circles/circle-1/decisions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('circle decisions route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    listCircleDecisions.mockReset();
    proposeDecision.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    listCircleDecisions.mockResolvedValue([]);
    proposeDecision.mockResolvedValue({
      id: 'd-1',
      circleId: 'circle-1',
      title: 'Move to Milan',
      description: null,
      status: 'proposed',
      decision: null,
      decidedAt: null,
      createdBy: 'user-1',
      createdAt: '2026-04-26T00:00:00.000Z',
    });
  });

  it('lists decisions', async () => {
    const response = await GET(new Request('http://localhost/api/circles/circle-1/decisions'), {
      params,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(listCircleDecisions).toHaveBeenCalledWith('user-1', 'circle-1');
  });

  it('proposes a decision', async () => {
    const response = await POST(makePost({ title: 'Move to Milan' }), { params });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ id: 'd-1', votes: [] });
    expect(proposeDecision).toHaveBeenCalledWith('user-1', 'circle-1', 'Move to Milan', undefined);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makePost({ title: 'X' }), { params });
    expect(response.status).toBe(401);
  });

  it('returns 400 when title is missing', async () => {
    const response = await POST(makePost({}), { params });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'title is required' });
  });

  it('translates validation errors to 400', async () => {
    proposeDecision.mockRejectedValue(new CircleValidationError('Not a member of this circle'));
    const response = await POST(makePost({ title: 'X' }), { params });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Not a member of this circle' });
  });
});
