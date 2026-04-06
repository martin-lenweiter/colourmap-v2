import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getCheckInsForMission, getRecentCheckIns, insertCheckIn } = vi.hoisted(() => ({
  getCheckInsForMission: vi.fn(),
  getRecentCheckIns: vi.fn(),
  insertCheckIn: vi.fn(),
}));

const updateReturning = vi.fn();
const updateWhere = vi.fn(() => ({ returning: updateReturning }));
const updateSet = vi.fn(() => ({ where: updateWhere }));
const update = vi.fn(() => ({ set: updateSet }));
const deleteWhere = vi.fn();
const deleteFn = vi.fn(() => ({ where: deleteWhere }));

const dbInstance = {
  update,
  delete: deleteFn,
};

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => dbInstance),
}));

vi.mock('@/lib/db/queries/check-ins', () => ({
  getCheckInsForMission,
  getRecentCheckIns,
  insertCheckIn,
}));
vi.mock('@/lib/db/client', () => ({ getDb }));

import {
  CheckInValidationError,
  createCheckIn,
  deleteCheckIn,
  listMissionCheckIns,
  listRecentCheckIns,
  normalizeCheckInUpdateInput,
  normalizeCreateCheckInInput,
  updateCheckIn,
} from './check-ins';

describe('normalizeCreateCheckInInput', () => {
  it('normalizes optional fields from a valid body', () => {
    expect(
      normalizeCreateCheckInInput({
        sliderValue: 72,
        note: 'steady',
        tags: ['Work'],
        missionId: 'mission-1',
        emotionName: 'Open',
        emotionColor: '#fff',
      }),
    ).toEqual({
      sliderValue: 72,
      note: 'steady',
      tags: ['Work'],
      missionId: 'mission-1',
      emotionName: 'Open',
      emotionColor: '#fff',
    });
  });

  it('throws when sliderValue is missing', () => {
    expect(() => normalizeCreateCheckInInput({ note: 'x' })).toThrow(
      new CheckInValidationError('sliderValue is required'),
    );
  });

  it('throws when sliderValue is not numeric', () => {
    expect(() => normalizeCreateCheckInInput({ sliderValue: '72' })).toThrow(
      new CheckInValidationError('sliderValue must be a number'),
    );
  });

  it('coerces unsupported optionals to null', () => {
    expect(
      normalizeCreateCheckInInput({
        sliderValue: 72,
        note: 1,
        tags: 'bad',
        missionId: 2,
      }),
    ).toEqual({
      sliderValue: 72,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });
});

describe('createCheckIn', () => {
  const fakeRow = {
    id: '00000000-0000-0000-0000-000000000001',
    userId: 'user-1',
    sliderValue: 72,
    note: 'feeling good',
    tags: null,
    missionId: null,
    createdAt: new Date('2026-03-29T10:00:00Z'),
  };

  beforeEach(() => {
    insertCheckIn.mockReset();
    getDb.mockClear();
    insertCheckIn.mockResolvedValue(fakeRow);
  });

  it('creates a check-in with a valid slider value and note', async () => {
    const result = await createCheckIn('user-1', { sliderValue: 72, note: 'feeling good' });

    expect(getDb).toHaveBeenCalledTimes(1);
    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 72,
      note: 'feeling good',
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
    expect(result).toEqual(fakeRow);
  });

  it('converts undefined note to null', async () => {
    await createCheckIn('user-1', { sliderValue: 50 });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('converts null note to null', async () => {
    await createCheckIn('user-1', { sliderValue: 50, note: null });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('converts empty string note to null', async () => {
    await createCheckIn('user-1', { sliderValue: 50, note: '' });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('converts whitespace-only note to null', async () => {
    await createCheckIn('user-1', { sliderValue: 50, note: '   ' });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('trims whitespace from note', async () => {
    await createCheckIn('user-1', { sliderValue: 50, note: '  hello  ' });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: 'hello',
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('truncates note to 500 characters', async () => {
    const longNote = 'a'.repeat(600);

    await createCheckIn('user-1', { sliderValue: 50, note: longNote });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: 'a'.repeat(500),
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('throws CheckInValidationError for sliderValue below 0', async () => {
    await expect(createCheckIn('user-1', { sliderValue: -1 })).rejects.toThrow(
      CheckInValidationError,
    );
  });

  it('throws CheckInValidationError for sliderValue above 100', async () => {
    await expect(createCheckIn('user-1', { sliderValue: 101 })).rejects.toThrow(
      CheckInValidationError,
    );
  });

  it('throws CheckInValidationError for non-integer sliderValue', async () => {
    await expect(createCheckIn('user-1', { sliderValue: 50.5 })).rejects.toThrow(
      CheckInValidationError,
    );
  });

  it('throws CheckInValidationError for NaN sliderValue', async () => {
    await expect(createCheckIn('user-1', { sliderValue: Number.NaN })).rejects.toThrow(
      CheckInValidationError,
    );
  });

  it('accepts boundary value 0', async () => {
    await createCheckIn('user-1', { sliderValue: 0 });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 0,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('accepts boundary value 100', async () => {
    await createCheckIn('user-1', { sliderValue: 100 });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 100,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('propagates database errors from insertCheckIn', async () => {
    insertCheckIn.mockRejectedValue(new Error('db error'));

    await expect(createCheckIn('user-1', { sliderValue: 50 })).rejects.toThrow('db error');
  });

  // Tags tests
  it('passes valid tags through', async () => {
    await createCheckIn('user-1', { sliderValue: 50, tags: ['Work', 'Body'] });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: ['Work', 'Body'],
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('filters out invalid tags', async () => {
    await createCheckIn('user-1', { sliderValue: 50, tags: ['Work', 'InvalidTag'] });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: ['Work'],
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('converts empty tags array to null', async () => {
    await createCheckIn('user-1', { sliderValue: 50, tags: [] });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('converts all-invalid tags to null', async () => {
    await createCheckIn('user-1', { sliderValue: 50, tags: ['Nope', 'Bad'] });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });

  it('converts null tags to null', async () => {
    await createCheckIn('user-1', { sliderValue: 50, tags: null });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 50,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
    });
  });
});

describe('listRecentCheckIns', () => {
  beforeEach(() => {
    getRecentCheckIns.mockReset();
    getDb.mockClear();
    getRecentCheckIns.mockResolvedValue([]);
  });

  it('delegates to the query layer with the default limit', async () => {
    await listRecentCheckIns('user-1');

    expect(getRecentCheckIns).toHaveBeenCalledWith(dbInstance, 'user-1', 50);
  });
});

describe('listMissionCheckIns', () => {
  beforeEach(() => {
    getCheckInsForMission.mockReset();
    getDb.mockClear();
    getCheckInsForMission.mockResolvedValue([]);
  });

  it('delegates to the query layer', async () => {
    await listMissionCheckIns('user-1', 'mission-1');

    expect(getCheckInsForMission).toHaveBeenCalledWith(dbInstance, 'user-1', 'mission-1');
  });
});

describe('normalizeCheckInUpdateInput', () => {
  it('accepts note, tags, and slider updates', () => {
    expect(
      normalizeCheckInUpdateInput({
        sliderValue: 42,
        note: 'steady',
        tags: ['Work'],
      }),
    ).toEqual({
      sliderValue: 42,
      note: 'steady',
      tags: ['Work'],
    });
  });

  it('throws when there are no valid fields', () => {
    expect(() => normalizeCheckInUpdateInput({ nope: true })).toThrow(
      new CheckInValidationError('No valid fields'),
    );
  });

  it('throws when the body is not an object', () => {
    expect(() => normalizeCheckInUpdateInput(null)).toThrow(
      new CheckInValidationError('Invalid body'),
    );
  });
});

describe('updateCheckIn', () => {
  beforeEach(() => {
    getDb.mockClear();
    update.mockClear();
    updateSet.mockClear();
    updateWhere.mockClear();
    updateReturning.mockReset();
    updateReturning.mockResolvedValue([{ id: 'check-1', note: 'steady' }]);
  });

  it('returns the updated row', async () => {
    await expect(updateCheckIn('user-1', 'check-1', { note: 'steady' })).resolves.toEqual({
      id: 'check-1',
      note: 'steady',
    });
  });

  it('returns null when no row is updated', async () => {
    updateReturning.mockResolvedValue([]);

    await expect(updateCheckIn('user-1', 'check-1', { note: 'steady' })).resolves.toBeNull();
  });
});

describe('deleteCheckIn', () => {
  beforeEach(() => {
    getDb.mockClear();
    deleteFn.mockClear();
    deleteWhere.mockReset();
    deleteWhere.mockResolvedValue(undefined);
  });

  it('deletes the row for the user', async () => {
    await expect(deleteCheckIn('user-1', 'check-1')).resolves.toBeUndefined();
    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });
});
