import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

const {
  closeSparkFromMap,
  fulfillSpark,
  getSparkDetail,
  openSparkToMap,
  removeSpark,
  SparkValidationError,
} = vi.hoisted(() => {
  class SparkValidationError extends Error {
    name = 'SparkValidationError';
  }
  return {
    closeSparkFromMap: vi.fn(),
    fulfillSpark: vi.fn(),
    getSparkDetail: vi.fn(),
    openSparkToMap: vi.fn(),
    removeSpark: vi.fn(),
    SparkValidationError,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/services/sparks', () => ({
  closeSparkFromMap,
  fulfillSpark,
  getSparkDetail,
  openSparkToMap,
  removeSpark,
  SparkValidationError,
}));

import { DELETE, GET, PATCH } from './route';

const user = { id: 'user-1', email: 'test@example.com' };
const spark = { id: 'spark-1', text: 'build something', resonances: [] };
const params = Promise.resolve({ id: 'spark-1' });

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/sparks/spark-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/sparks/[id]', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    getSparkDetail.mockResolvedValue(spark);
  });

  it('returns spark detail', async () => {
    const res = await GET(new Request('http://localhost/api/sparks/spark-1'), { params });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(spark);
  });

  it('returns 404 for unknown spark', async () => {
    getSparkDetail.mockResolvedValue(null);
    const res = await GET(new Request('http://localhost/api/sparks/spark-1'), { params });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/sparks/[id]', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    fulfillSpark.mockResolvedValue(undefined);
    openSparkToMap.mockResolvedValue(undefined);
    closeSparkFromMap.mockResolvedValue(undefined);
  });

  it('fulfills a spark', async () => {
    const res = await PATCH(makeRequest({ action: 'fulfill' }), { params });
    expect(res.status).toBe(200);
    expect(fulfillSpark).toHaveBeenCalledWith('spark-1', 'user-1');
  });

  it('opens a spark to the map', async () => {
    const res = await PATCH(makeRequest({ action: 'open', lat: 48.85, lng: 2.35 }), { params });
    expect(res.status).toBe(200);
    expect(openSparkToMap).toHaveBeenCalledWith('spark-1', 'user-1', 48.85, 2.35, null);
  });

  it('returns 400 when opening without coordinates', async () => {
    const res = await PATCH(makeRequest({ action: 'open' }), { params });
    expect(res.status).toBe(400);
  });

  it('closes a spark', async () => {
    const res = await PATCH(makeRequest({ action: 'close' }), { params });
    expect(res.status).toBe(200);
    expect(closeSparkFromMap).toHaveBeenCalledWith('spark-1', 'user-1');
  });

  it('returns 400 for unknown action', async () => {
    const res = await PATCH(makeRequest({ action: 'zap' }), { params });
    expect(res.status).toBe(400);
  });

  it('returns 400 on validation error', async () => {
    fulfillSpark.mockRejectedValue(new SparkValidationError('Not your spark'));
    const res = await PATCH(makeRequest({ action: 'fulfill' }), { params });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/sparks/[id]', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user } });
    removeSpark.mockResolvedValue(undefined);
  });

  it('deletes the spark', async () => {
    const res = await DELETE(new Request('http://localhost/api/sparks/spark-1'), { params });
    expect(res.status).toBe(200);
    expect(removeSpark).toHaveBeenCalledWith('spark-1', 'user-1');
  });

  it('returns 400 if not your spark', async () => {
    removeSpark.mockRejectedValue(new SparkValidationError('Not your spark'));
    const res = await DELETE(new Request('http://localhost/api/sparks/spark-1'), { params });
    expect(res.status).toBe(400);
  });
});
