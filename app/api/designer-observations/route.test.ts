import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { createDesignerObservation, listDesignerObservations, DesignerObservationValidationError } =
  vi.hoisted(() => {
    const createDesignerObservation = vi.fn();
    const listDesignerObservations = vi.fn();
    class DesignerObservationValidationError extends Error {
      name = 'DesignerObservationValidationError';
    }
    return {
      createDesignerObservation,
      listDesignerObservations,
      DesignerObservationValidationError,
    };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/designer-observations', () => ({
  createDesignerObservation,
  listDesignerObservations,
  DesignerObservationValidationError,
}));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

function makePost(body: unknown) {
  return new Request('http://localhost/api/designer-observations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('designer observations route', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    createDesignerObservation.mockReset();
    listDesignerObservations.mockReset();
    getUser.mockResolvedValue({ data: { user } });
    listDesignerObservations.mockResolvedValue([]);
    createDesignerObservation.mockResolvedValue({
      id: 'obs-1',
      userId: 'user-1',
      area: 'Music',
      text: 'Sand maraca a touch quiet',
      createdAt: '2026-04-26T00:00:00.000Z',
    });
  });

  it('lists observations for the user', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(listDesignerObservations).toHaveBeenCalledWith('user-1');
  });

  it('creates an observation', async () => {
    const response = await POST(makePost({ text: 'Sand maraca a touch quiet', area: 'Music' }));
    expect(response.status).toBe(201);
    expect(createDesignerObservation).toHaveBeenCalledWith(
      'user-1',
      'Sand maraca a touch quiet',
      'Music',
    );
  });

  it('accepts a null area', async () => {
    const response = await POST(makePost({ text: 'No area' }));
    expect(response.status).toBe(201);
    expect(createDesignerObservation).toHaveBeenCalledWith('user-1', 'No area', null);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(makePost({ text: 'X' }));
    expect(response.status).toBe(401);
  });

  it('returns 400 when text is missing', async () => {
    const response = await POST(makePost({}));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'text is required' });
  });

  it('translates validation errors to 400', async () => {
    createDesignerObservation.mockRejectedValue(
      new DesignerObservationValidationError('Observation text is required'),
    );
    const response = await POST(makePost({ text: '   ' }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Observation text is required' });
  });
});
