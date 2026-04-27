import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const { createSpark, listCircleSparks, listMySparks, listNearbySparks, SparkValidationError } =
  vi.hoisted(() => {
    class SparkValidationError extends Error {
      name = 'SparkValidationError';
    }
    return {
      createSpark: vi.fn(),
      listCircleSparks: vi.fn(),
      listMySparks: vi.fn(),
      listNearbySparks: vi.fn(),
      SparkValidationError,
    };
  });

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/sparks', () => ({
  createSpark,
  listCircleSparks,
  listMySparks,
  listNearbySparks,
  SparkValidationError,
}));

import { GET, POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const spark = { id: 'spark-1', text: 'build something', category: 'fun' };

function makeRequest(body: unknown, url = 'http://localhost/api/sparks') {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/sparks', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    listMySparks.mockResolvedValue([spark]);
    listNearbySparks.mockResolvedValue([spark]);
    listCircleSparks.mockResolvedValue([spark]);
  });

  it("returns user's own sparks", async () => {
    const res = await GET(new Request('http://localhost/api/sparks'));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([spark]);
    expect(listMySparks).toHaveBeenCalledWith('user-1');
  });

  it('returns nearby sparks when lat/lng provided', async () => {
    const res = await GET(new Request('http://localhost/api/sparks?lat=48.85&lng=2.35'));
    expect(res.status).toBe(200);
    expect(listNearbySparks).toHaveBeenCalledWith(48.85, 2.35, expect.any(Number));
  });

  it('returns circle sparks when circleId provided', async () => {
    const res = await GET(new Request('http://localhost/api/sparks?circleId=circle-1'));
    expect(res.status).toBe(200);
    expect(listCircleSparks).toHaveBeenCalledWith('circle-1');
  });

  it('returns 400 for invalid lat/lng', async () => {
    const res = await GET(new Request('http://localhost/api/sparks?lat=abc&lng=2.35'));
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(new Request('http://localhost/api/sparks'));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/sparks', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    createSpark.mockResolvedValue(spark);
  });

  it('creates a spark', async () => {
    const res = await POST(
      makeRequest({ text: 'build something', category: 'fun', timeWindow: 'this_week' }),
    );
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual(spark);
  });

  it('returns 401 when unauthenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest({ text: 'build' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 on validation error', async () => {
    createSpark.mockRejectedValue(new SparkValidationError('text is required'));
    const res = await POST(makeRequest({ text: '' }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'text is required' });
  });
});
