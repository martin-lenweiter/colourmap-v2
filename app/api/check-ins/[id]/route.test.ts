import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { CheckInValidationError, deleteCheckIn, normalizeCheckInUpdateInput, updateCheckIn } =
  vi.hoisted(() => {
    const deleteCheckIn = vi.fn();
    const normalizeCheckInUpdateInput = vi.fn((value) => value);
    const updateCheckIn = vi.fn();
    class CheckInValidationError extends Error {
      name = 'CheckInValidationError';
    }
    return { CheckInValidationError, deleteCheckIn, normalizeCheckInUpdateInput, updateCheckIn };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/check-ins', () => ({
  CheckInValidationError,
  deleteCheckIn,
  normalizeCheckInUpdateInput,
  updateCheckIn,
}));

import { DELETE, PATCH } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const params = Promise.resolve({ id: 'check-1' });

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/check-ins/check-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('check-in detail route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    normalizeCheckInUpdateInput.mockReset();
    updateCheckIn.mockReset();
    deleteCheckIn.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    normalizeCheckInUpdateInput.mockImplementation((value) => value);
    updateCheckIn.mockResolvedValue({ id: 'check-1', note: 'steady' });
  });

  it('updates a check-in', async () => {
    const response = await PATCH(makeRequest({ note: 'steady' }), { params });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: 'check-1', note: 'steady' });
  });

  it('deletes a check-in', async () => {
    const response = await DELETE(new Request('http://localhost/api/check-ins/check-1'), {
      params,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await PATCH(makeRequest({ note: 'steady' }), { params });
    expect(response.status).toBe(401);
  });

  it('returns 400 when no valid fields are provided', async () => {
    normalizeCheckInUpdateInput.mockImplementation(() => {
      throw new CheckInValidationError('No valid fields');
    });

    const response = await PATCH(makeRequest({ nope: true }), { params });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'No valid fields' });
  });

  it('returns null when the record is missing', async () => {
    updateCheckIn.mockResolvedValue(null);
    const response = await PATCH(makeRequest({ note: 'steady' }), { params });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not found' });
  });
});
