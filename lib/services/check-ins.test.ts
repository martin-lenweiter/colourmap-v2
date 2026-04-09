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
        facing: {
          fear: { label: 'Fear', answers: ['What are you afraid of today?'] },
        },
        challenge: 'a hard thing',
        flow: 'one thing is moving',
        feelingCompass: { attitude: 60, emotions: 45 },
        feelingStage: 4,
        feelingSupport: ['Confidence', 'Openness'],
      }),
    ).toEqual({
      sliderValue: 72,
      note: 'steady',
      tags: ['Work'],
      missionId: 'mission-1',
      emotionName: 'Open',
      emotionColor: '#fff',
      facing: {
        fear: { label: 'Fear', answers: ['What are you afraid of today?'] },
      },
      pulses: null,
      challenge: 'a hard thing',
      flow: 'one thing is moving',
      feelingCompass: { attitude: 60, emotions: 45 },
      feelingStage: 4,
      feelingSupport: ['Confidence', 'Openness'],
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
    });
  });

  it('throws for invalid facing payload', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        facing: { fear: 'bad' },
      }),
    ).toThrow(new CheckInValidationError('facing.fear must be an object'));
  });

  it('throws when facing is not an object', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        facing: 'bad',
      }),
    ).toThrow(new CheckInValidationError('facing must be an object'));
  });

  it('throws when facing entry has no label', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        facing: { fear: { label: '', answers: ['yes'] } },
      }),
    ).toThrow(new CheckInValidationError('facing.fear.label must be a string'));
  });

  it('throws when facing entry has no answers array', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        facing: { fear: { label: 'Fear', answers: 'bad' } },
      }),
    ).toThrow(new CheckInValidationError('facing.fear.answers must be an array'));
  });

  it('throws when challenge is not a string', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        challenge: 123,
      }),
    ).toThrow(new CheckInValidationError('challenge must be a string'));
  });

  it('throws when pulses is not an object', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        pulses: 'bad',
      }),
    ).toThrow(new CheckInValidationError('pulses must be an object'));
  });

  it('throws when pulse value is not a number', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        pulses: { body: 'bad' },
      }),
    ).toThrow(new CheckInValidationError('pulses.body must be a number'));
  });

  it('throws when feelingSupport is not an array', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        feelingSupport: 'bad',
      }),
    ).toThrow(new CheckInValidationError('feelingSupport must be an array'));
  });

  it('throws for invalid feeling stage', () => {
    expect(() =>
      normalizeCreateCheckInInput({
        sliderValue: 72,
        feelingStage: 11,
      }),
    ).toThrow(new CheckInValidationError('feelingStage must be an integer between 0 and 10'));
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
    facing: null,
    pulses: null,
    challenge: null,
    flow: null,
    feelingCompass: null,
    feelingStage: null,
    feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
    });
  });

  it('passes structured CPC fields through', async () => {
    await createCheckIn('user-1', {
      sliderValue: 64,
      facing: {
        fear: {
          label: 'Fear',
          answers: ['A hard conversation', 'It could go badly', 'Send the message'],
        },
      },
      pulses: { body: 42, attitude: 58 },
      challenge: 'Avoiding the hard conversation',
      flow: 'Writing is moving',
      feelingCompass: { attitude: 70, emotions: 55, presence: 48, body: 62 },
      feelingStage: 4,
      feelingSupport: ['Confidence', 'Openness'],
    });

    expect(insertCheckIn).toHaveBeenCalledWith(dbInstance, {
      userId: 'user-1',
      sliderValue: 64,
      note: null,
      tags: null,
      missionId: null,
      emotionName: null,
      emotionColor: null,
      facing: {
        fear: {
          label: 'Fear',
          answers: ['A hard conversation', 'It could go badly', 'Send the message'],
        },
      },
      pulses: { body: 42, attitude: 58 },
      challenge: 'Avoiding the hard conversation',
      flow: 'Writing is moving',
      feelingCompass: { attitude: 70, emotions: 55, presence: 48, body: 62 },
      feelingStage: 4,
      feelingSupport: ['Confidence', 'Openness'],
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
      facing: null,
      pulses: null,
      challenge: null,
      flow: null,
      feelingCompass: null,
      feelingStage: null,
      feelingSupport: null,
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
        challenge: 'something hard',
        feelingStage: 3,
      }),
    ).toEqual({
      sliderValue: 42,
      note: 'steady',
      tags: ['Work'],
      challenge: 'something hard',
      feelingStage: 3,
    });
  });

  it('accepts structured CPC update fields', () => {
    expect(
      normalizeCheckInUpdateInput({
        facing: {
          fear: { label: 'Fear', answers: ['A', 'B'] },
        },
        pulses: { body: 50 },
        flow: 'A good thing',
        feelingCompass: { presence: 65 },
        feelingSupport: ['Gratitude'],
      }),
    ).toEqual({
      facing: {
        fear: { label: 'Fear', answers: ['A', 'B'] },
      },
      pulses: { body: 50 },
      flow: 'A good thing',
      feelingCompass: { presence: 65 },
      feelingSupport: ['Gratitude'],
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
