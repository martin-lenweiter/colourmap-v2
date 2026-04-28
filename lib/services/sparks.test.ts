import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  deleteSpark,
  getSparkById,
  getSparksByUser,
  getSparksByCircle,
  getNearbyOpenSparks,
  getResonanceCounts,
  getResonancesForSpark,
  insertSpark,
  setSparkOpen,
  updateResonanceStatus,
  updateSparkStatus,
  upsertResonance,
} = vi.hoisted(() => ({
  deleteSpark: vi.fn(),
  getSparkById: vi.fn(),
  getSparksByUser: vi.fn(),
  getSparksByCircle: vi.fn(),
  getNearbyOpenSparks: vi.fn(),
  getResonanceCounts: vi.fn(),
  getResonancesForSpark: vi.fn(),
  insertSpark: vi.fn(),
  setSparkOpen: vi.fn(),
  updateResonanceStatus: vi.fn(),
  updateSparkStatus: vi.fn(),
  upsertResonance: vi.fn(),
}));

vi.mock('@/lib/db/queries/sparks', () => ({
  deleteSpark,
  getSparkById,
  getSparksByUser,
  getSparksByCircle,
  getNearbyOpenSparks,
  getResonanceCounts,
  getResonancesForSpark,
  insertSpark,
  setSparkOpen,
  updateResonanceStatus,
  updateSparkStatus,
  upsertResonance,
}));

import {
  closeSparkFromMap,
  createSpark,
  fulfillSpark,
  getSparkDetail,
  listCircleSparks,
  listMySparks,
  listNearbySparks,
  openSparkToMap,
  removeSpark,
  resonateWithSpark,
  respondToResonance,
  SparkValidationError,
} from './sparks';

const spark = {
  id: 'spark-1',
  userId: 'user-1',
  text: 'build something',
  category: 'fun' as const,
  timeWindow: 'this_week' as const,
  isOpen: false,
  status: 'active',
  lat: null,
  lng: null,
  zoneLabel: null,
  circleId: null,
  expiresAt: null,
  createdAt: new Date(),
};

describe('createSpark', () => {
  beforeEach(() => {
    insertSpark.mockResolvedValue(spark);
  });

  it('creates a spark with valid input', async () => {
    const result = await createSpark('user-1', {
      text: 'build something',
      category: 'fun',
      timeWindow: 'this_week',
    });
    expect(result).toEqual(spark);
    expect(insertSpark).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', text: 'build something' }),
    );
  });

  it('trims text whitespace', async () => {
    await createSpark('user-1', { text: '  build  ', category: 'fun', timeWindow: 'this_week' });
    expect(insertSpark).toHaveBeenCalledWith(expect.objectContaining({ text: 'build' }));
  });

  it('rejects empty text', async () => {
    await expect(
      createSpark('user-1', { text: '   ', category: 'fun', timeWindow: 'this_week' }),
    ).rejects.toThrow(new SparkValidationError('text is required'));
  });

  it('rejects text over 200 chars', async () => {
    await expect(
      createSpark('user-1', { text: 'a'.repeat(201), category: 'fun', timeWindow: 'this_week' }),
    ).rejects.toThrow(SparkValidationError);
  });

  it('rejects invalid category', async () => {
    await expect(
      createSpark('user-1', {
        text: 'hello',
        category: 'invalid' as never,
        timeWindow: 'this_week',
      }),
    ).rejects.toThrow(new SparkValidationError('invalid category'));
  });

  it('rejects invalid timeWindow', async () => {
    await expect(
      createSpark('user-1', {
        text: 'hello',
        category: 'fun',
        timeWindow: 'tomorrow' as never,
      }),
    ).rejects.toThrow(new SparkValidationError('invalid timeWindow'));
  });

  it('rejects isOpen without coordinates', async () => {
    await expect(
      createSpark('user-1', {
        text: 'hello',
        category: 'fun',
        timeWindow: 'this_week',
        isOpen: true,
      }),
    ).rejects.toThrow(new SparkValidationError('lat and lng are required when isOpen is true'));
  });
});

describe('listMySparks', () => {
  it('returns sparks with resonance counts', async () => {
    getSparksByUser.mockResolvedValue([spark]);
    getResonanceCounts.mockResolvedValue({ 'spark-1': 3 });
    const result = await listMySparks('user-1');
    expect(result).toEqual([{ ...spark, resonanceCount: 3 }]);
  });
});

describe('listCircleSparks', () => {
  it('returns sparks with resonance counts', async () => {
    getSparksByCircle.mockResolvedValue([spark]);
    getResonanceCounts.mockResolvedValue({ 'spark-1': 1 });
    const result = await listCircleSparks('circle-1');
    expect(result).toEqual([{ ...spark, resonanceCount: 1 }]);
  });
});

describe('listNearbySparks', () => {
  it('caps radius at 50km', async () => {
    getNearbyOpenSparks.mockResolvedValue([]);
    getResonanceCounts.mockResolvedValue({});
    await listNearbySparks(48.85, 2.35, 999);
    expect(getNearbyOpenSparks).toHaveBeenCalledWith(48.85, 2.35, 50);
  });
});

describe('fulfillSpark', () => {
  it('marks spark as fulfilled', async () => {
    getSparkById.mockResolvedValue(spark);
    updateSparkStatus.mockResolvedValue(undefined);
    await fulfillSpark('spark-1', 'user-1');
    expect(updateSparkStatus).toHaveBeenCalledWith('spark-1', 'user-1', 'fulfilled');
  });

  it('rejects if not your spark', async () => {
    getSparkById.mockResolvedValue({ ...spark, userId: 'other' });
    await expect(fulfillSpark('spark-1', 'user-1')).rejects.toThrow(
      new SparkValidationError('Not your spark'),
    );
  });

  it('rejects if spark not found', async () => {
    getSparkById.mockResolvedValue(null);
    await expect(fulfillSpark('spark-1', 'user-1')).rejects.toThrow(
      new SparkValidationError('Spark not found'),
    );
  });
});

describe('openSparkToMap', () => {
  it('sets spark open with coordinates', async () => {
    getSparkById.mockResolvedValue(spark);
    setSparkOpen.mockResolvedValue(undefined);
    await openSparkToMap('spark-1', 'user-1', 48.85, 2.35, 'Paris');
    expect(setSparkOpen).toHaveBeenCalledWith('spark-1', 'user-1', true, 48.85, 2.35, 'Paris');
  });
});

describe('closeSparkFromMap', () => {
  it('closes the spark', async () => {
    getSparkById.mockResolvedValue(spark);
    setSparkOpen.mockResolvedValue(undefined);
    await closeSparkFromMap('spark-1', 'user-1');
    expect(setSparkOpen).toHaveBeenCalledWith('spark-1', 'user-1', false, null, null, null);
  });
});

describe('removeSpark', () => {
  it('deletes the spark', async () => {
    getSparkById.mockResolvedValue(spark);
    deleteSpark.mockResolvedValue(undefined);
    await removeSpark('spark-1', 'user-1');
    expect(deleteSpark).toHaveBeenCalledWith('spark-1', 'user-1');
  });
});

describe('resonateWithSpark', () => {
  it('creates a resonance', async () => {
    getSparkById.mockResolvedValue(spark);
    upsertResonance.mockResolvedValue({ id: 'r-1' });
    const result = await resonateWithSpark('spark-1', 'user-2', 'resonate');
    expect(result).toEqual({ id: 'r-1' });
  });

  it('rejects self-resonance', async () => {
    getSparkById.mockResolvedValue(spark);
    await expect(resonateWithSpark('spark-1', 'user-1', 'resonate')).rejects.toThrow(
      new SparkValidationError('Cannot resonate with your own spark'),
    );
  });

  it('rejects inactive spark', async () => {
    getSparkById.mockResolvedValue({ ...spark, status: 'fulfilled' });
    await expect(resonateWithSpark('spark-1', 'user-2', 'resonate')).rejects.toThrow(
      new SparkValidationError('Spark is no longer active'),
    );
  });
});

describe('respondToResonance', () => {
  it('updates resonance status', async () => {
    getSparkById.mockResolvedValue(spark);
    updateResonanceStatus.mockResolvedValue(undefined);
    await respondToResonance('spark-1', 'user-1', 'user-2', 'accepted');
    expect(updateResonanceStatus).toHaveBeenCalledWith('spark-1', 'user-2', 'accepted');
  });
});

describe('getSparkDetail', () => {
  it('returns null for missing spark', async () => {
    getSparkById.mockResolvedValue(null);
    expect(await getSparkDetail('spark-1')).toBeNull();
  });

  it('returns spark with resonances', async () => {
    getSparkById.mockResolvedValue(spark);
    getResonancesForSpark.mockResolvedValue([{ id: 'r-1' }]);
    const result = await getSparkDetail('spark-1');
    expect(result).toEqual({ ...spark, resonances: [{ id: 'r-1' }] });
  });
});
