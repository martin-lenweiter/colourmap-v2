import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectOrderBy = vi.fn();
const selectWhere = vi.fn(() => ({ orderBy: selectOrderBy }));
const selectFrom = vi.fn(() => ({ where: selectWhere }));
const select = vi.fn(() => ({ from: selectFrom }));

const insertReturning = vi.fn();
const insertValues = vi.fn(() => ({ returning: insertReturning }));
const insert = vi.fn(() => ({ values: insertValues }));

const updateReturning = vi.fn();
const updateWhere = vi.fn(() => ({ returning: updateReturning }));
const updateSet = vi.fn(() => ({ where: updateWhere }));
const update = vi.fn(() => ({ set: updateSet }));

const deleteReturning = vi.fn();
const deleteWhere = vi.fn(() => ({ returning: deleteReturning }));
const deleteFn = vi.fn(() => ({ where: deleteWhere }));

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => ({
    select,
    insert,
    update,
    delete: deleteFn,
  })),
}));

vi.mock('@/lib/db/client', () => ({ getDb }));

import { createRecording, deleteRecording, listRecordings, updateRecording } from './recordings';

const REC = {
  id: 'rec-1',
  userId: 'user-1',
  title: 'Jam session',
  storagePath: '1234-jam.webm',
  publicUrl: 'https://example.com/1234-jam.webm',
  durationSecs: 120,
  songId: null,
  category: 'solo',
  notes: null,
  createdAt: new Date().toISOString(),
};

describe('recordings service', () => {
  beforeEach(() => {
    getDb.mockClear();
    select.mockClear();
    selectFrom.mockClear();
    selectWhere.mockClear();
    selectOrderBy.mockReset();
    insert.mockClear();
    insertValues.mockClear();
    insertReturning.mockReset();
    update.mockClear();
    updateSet.mockClear();
    updateWhere.mockClear();
    updateReturning.mockReset();
    deleteFn.mockClear();
    deleteWhere.mockClear();
    deleteReturning.mockReset();
  });

  it('lists recordings', async () => {
    selectOrderBy.mockResolvedValue([REC]);
    await expect(listRecordings('user-1')).resolves.toEqual([REC]);
    expect(select).toHaveBeenCalledTimes(1);
  });

  it('creates a recording', async () => {
    insertReturning.mockResolvedValue([REC]);
    const input = {
      title: 'Jam session',
      storagePath: '1234-jam.webm',
      publicUrl: 'https://example.com/1234-jam.webm',
      durationSecs: 120,
      songId: null,
      category: 'solo',
      notes: null,
    };
    await expect(createRecording('user-1', input)).resolves.toEqual(REC);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('updates a recording', async () => {
    updateReturning.mockResolvedValue([{ ...REC, title: 'Updated' }]);
    await expect(updateRecording('user-1', 'rec-1', { title: 'Updated' })).resolves.toEqual({
      ...REC,
      title: 'Updated',
    });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('returns null when update finds nothing', async () => {
    updateReturning.mockResolvedValue([]);
    await expect(updateRecording('user-1', 'rec-1', { title: 'Updated' })).resolves.toBeNull();
  });

  it('deletes a recording', async () => {
    deleteReturning.mockResolvedValue([REC]);
    await expect(deleteRecording('user-1', 'rec-1')).resolves.toEqual(REC);
    expect(deleteFn).toHaveBeenCalledTimes(1);
  });

  it('returns null when delete finds nothing', async () => {
    deleteReturning.mockResolvedValue([]);
    await expect(deleteRecording('user-1', 'rec-1')).resolves.toBeNull();
  });
});
