import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { archiveDecision, finalizeDecision, removeDecision, CircleValidationError } = vi.hoisted(
  () => {
    const archiveDecision = vi.fn();
    const finalizeDecision = vi.fn();
    const removeDecision = vi.fn();
    class CircleValidationError extends Error {
      name = 'CircleValidationError';
    }
    return { archiveDecision, finalizeDecision, removeDecision, CircleValidationError };
  },
);

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/circles', () => ({
  archiveDecision,
  finalizeDecision,
  removeDecision,
  CircleValidationError,
}));

import { DELETE, PATCH } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'circle-1', decisionId: 'd-1' });

function makePatch(body: unknown) {
  return new Request('http://localhost/api/circles/circle-1/decisions/d-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('circle decision detail route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    archiveDecision.mockReset();
    finalizeDecision.mockReset();
    removeDecision.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    archiveDecision.mockResolvedValue({ id: 'd-1', status: 'archived' });
    finalizeDecision.mockResolvedValue({ id: 'd-1', status: 'decided', decision: 'yes' });
    removeDecision.mockResolvedValue(true);
  });

  it('decides yes', async () => {
    const response = await PATCH(makePatch({ action: 'decide', decision: 'yes' }), { params });
    expect(response.status).toBe(200);
    expect(finalizeDecision).toHaveBeenCalledWith('user-1', 'circle-1', 'd-1', 'yes');
  });

  it('archives a decision', async () => {
    const response = await PATCH(makePatch({ action: 'archive' }), { params });
    expect(response.status).toBe(200);
    expect(archiveDecision).toHaveBeenCalledWith('user-1', 'circle-1', 'd-1');
  });

  it('returns 400 for invalid decide value', async () => {
    const response = await PATCH(makePatch({ action: 'decide', decision: 'maybe' }), { params });
    expect(response.status).toBe(400);
  });

  it('returns 400 for unknown action', async () => {
    const response = await PATCH(makePatch({ action: 'something' }), { params });
    expect(response.status).toBe(400);
  });

  it('deletes a decision', async () => {
    const response = await DELETE(
      new Request('http://localhost/api/circles/circle-1/decisions/d-1'),
      { params },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(removeDecision).toHaveBeenCalledWith('user-1', 'circle-1', 'd-1');
  });

  it('returns 404 when delete misses', async () => {
    removeDecision.mockResolvedValue(false);
    const response = await DELETE(
      new Request('http://localhost/api/circles/circle-1/decisions/d-1'),
      { params },
    );
    expect(response.status).toBe(404);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await PATCH(makePatch({ action: 'archive' }), { params });
    expect(response.status).toBe(401);
  });
});
