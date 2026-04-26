import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { castDecisionVote, CircleValidationError } = vi.hoisted(() => {
  const castDecisionVote = vi.fn();
  class CircleValidationError extends Error {
    name = 'CircleValidationError';
  }
  return { castDecisionVote, CircleValidationError };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/circles', () => ({ castDecisionVote, CircleValidationError }));

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'circle-1', decisionId: 'd-1' });

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/circles/circle-1/decisions/d-1/votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('circle decision votes route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    castDecisionVote.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    castDecisionVote.mockResolvedValue({
      id: 'v-1',
      decisionId: 'd-1',
      memberId: 'user-1',
      memberName: 'Martin',
      value: 'yes',
      createdAt: '2026-04-26T00:00:00.000Z',
    });
  });

  it('casts a vote', async () => {
    const response = await POST(makeRequest({ value: 'yes', memberName: 'Martin' }), { params });
    expect(response.status).toBe(201);
    expect(castDecisionVote).toHaveBeenCalledWith('user-1', 'circle-1', 'd-1', 'yes', 'Martin');
  });

  it('returns 400 for invalid vote value', async () => {
    const response = await POST(makeRequest({ value: 'maybe', memberName: 'Martin' }), { params });
    expect(response.status).toBe(400);
  });

  it('returns 400 when memberName is missing', async () => {
    const response = await POST(makeRequest({ value: 'yes' }), { params });
    expect(response.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makeRequest({ value: 'yes', memberName: 'Martin' }), { params });
    expect(response.status).toBe(401);
  });

  it('translates validation errors to 400', async () => {
    castDecisionVote.mockRejectedValue(new CircleValidationError('Not a member of this circle'));
    const response = await POST(makeRequest({ value: 'yes', memberName: 'Martin' }), { params });
    expect(response.status).toBe(400);
  });
});
