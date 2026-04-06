import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({
    auth: { getUser },
  }));
  return { createClient, getUser };
});

const { createCheckIn, CheckInValidationError, listRecentCheckIns, normalizeCreateCheckInInput } =
  vi.hoisted(() => {
    const createCheckIn = vi.fn();
    const listRecentCheckIns = vi.fn();
    const normalizeCreateCheckInInput = vi.fn((value) => value);
    class CheckInValidationError extends Error {
      name = 'CheckInValidationError';
    }
    return {
      createCheckIn,
      CheckInValidationError,
      listRecentCheckIns,
      normalizeCreateCheckInInput,
    };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/check-ins', () => ({
  createCheckIn,
  CheckInValidationError,
  listRecentCheckIns,
  normalizeCreateCheckInInput,
}));

import { GET, POST } from './route';

function makeRequest(body?: unknown) {
  return new Request('http://localhost/api/check-ins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const fakeUser = { id: 'user-1', email: 'test@example.com' };
const fakeCheckIn = {
  id: '00000000-0000-0000-0000-000000000001',
  userId: 'user-1',
  sliderValue: 72,
  note: 'feeling good',
  tags: null,
  createdAt: '2026-03-29T10:00:00.000Z',
};

describe('POST /api/check-ins', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    createCheckIn.mockReset();
    normalizeCreateCheckInInput.mockReset();
    getUser.mockResolvedValue({ data: { user: fakeUser } });
    createCheckIn.mockResolvedValue(fakeCheckIn);
    normalizeCreateCheckInInput.mockImplementation((value) => {
      const body = value as Record<string, unknown>;
      return {
        sliderValue: body.sliderValue,
        note: typeof body.note === 'string' ? body.note : null,
        tags: Array.isArray(body.tags) ? body.tags : null,
        missionId: typeof body.missionId === 'string' ? body.missionId : null,
        emotionName: typeof body.emotionName === 'string' ? body.emotionName : null,
        emotionColor: typeof body.emotionColor === 'string' ? body.emotionColor : null,
      };
    });
  });

  it('returns 201 with the created check-in', async () => {
    const response = await POST(makeRequest({ sliderValue: 72, note: 'feeling good' }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(fakeCheckIn);
    expect(normalizeCreateCheckInInput).toHaveBeenCalledWith({
      sliderValue: 72,
      note: 'feeling good',
    });
    expect(createCheckIn).toHaveBeenCalledWith('user-1', {
      sliderValue: 72,
      note: 'feeling good',
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('returns 201 when note is omitted', async () => {
    const response = await POST(makeRequest({ sliderValue: 50 }));

    expect(response.status).toBe(201);
    expect(createCheckIn).toHaveBeenCalledWith('user-1', {
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('passes tags to service', async () => {
    const response = await POST(makeRequest({ sliderValue: 50, tags: ['Work', 'Body'] }));

    expect(response.status).toBe(201);
    expect(createCheckIn).toHaveBeenCalledWith('user-1', {
      sliderValue: 50,
      note: null,
      tags: ['Work', 'Body'],
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeRequest({ sliderValue: 50 }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(createCheckIn).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON body', async () => {
    const request = new Request('http://localhost/api/check-ins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when sliderValue is missing', async () => {
    normalizeCreateCheckInInput.mockImplementation(() => {
      throw new CheckInValidationError('sliderValue is required');
    });

    const response = await POST(makeRequest({ note: 'no slider' }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'sliderValue is required' });
  });

  it('returns 400 when sliderValue is not a number', async () => {
    normalizeCreateCheckInInput.mockImplementation(() => {
      throw new CheckInValidationError('sliderValue must be a number');
    });

    const response = await POST(makeRequest({ sliderValue: 'fifty' }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'sliderValue must be a number' });
  });

  it('returns 400 when the service throws a validation error', async () => {
    createCheckIn.mockRejectedValue(
      new CheckInValidationError('sliderValue must be an integer between 0 and 100'),
    );

    const response = await POST(makeRequest({ sliderValue: 50.5 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'sliderValue must be an integer between 0 and 100',
    });
  });

  it('re-throws unexpected errors', async () => {
    createCheckIn.mockRejectedValue(new Error('unexpected'));

    await expect(POST(makeRequest({ sliderValue: 50 }))).rejects.toThrow('unexpected');
  });

  it('coerces non-string note to null', async () => {
    normalizeCreateCheckInInput.mockReturnValue({
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });

    const response = await POST(makeRequest({ sliderValue: 50, note: 123 }));

    expect(response.status).toBe(201);
    expect(createCheckIn).toHaveBeenCalledWith('user-1', {
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });
});

describe('GET /api/check-ins', () => {
  beforeEach(() => {
    createClient.mockClear();
    getUser.mockReset();
    listRecentCheckIns.mockReset();
    getUser.mockResolvedValue({ data: { user: fakeUser } });
    listRecentCheckIns.mockResolvedValue([fakeCheckIn]);
  });

  it('returns recent check-ins for authenticated user', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([fakeCheckIn]);
    expect(listRecentCheckIns).toHaveBeenCalledWith('user-1', 50);
  });

  it('returns 401 when user is not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(listRecentCheckIns).not.toHaveBeenCalled();
  });

  it('returns empty array when no check-ins exist', async () => {
    listRecentCheckIns.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});
