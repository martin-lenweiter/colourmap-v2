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

const deleteWhere = vi.fn();
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

import {
  createNotebookEntry,
  deleteNotebookEntry,
  listNotebookEntries,
  NotebookValidationError,
  normalizeCreateNotebookEntryInput,
  normalizeUpdateNotebookEntryInput,
  updateNotebookEntry,
} from './notebook';

describe('notebook service', () => {
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
    deleteWhere.mockReset();
  });

  it('normalizes create payloads', () => {
    expect(
      normalizeCreateNotebookEntryInput({
        category: ' Ideas ',
        title: ' Draft ',
        content: '  Lines  ',
        tags: ['song', 1],
      }),
    ).toEqual({
      category: 'Ideas',
      title: 'Draft',
      content: 'Lines',
      tags: ['song'],
    });
  });

  it('rejects invalid create payloads', () => {
    expect(() => normalizeCreateNotebookEntryInput({ category: 'Ideas' })).toThrow(
      new NotebookValidationError('category and title required'),
    );
  });

  it('rejects non-object create payloads', () => {
    expect(() => normalizeCreateNotebookEntryInput(null)).toThrow(
      new NotebookValidationError('category and title required'),
    );
  });

  it('normalizes notebook updates', () => {
    expect(
      normalizeUpdateNotebookEntryInput({
        title: '  Revised ',
        content: '   ',
        tags: ['a', 1],
      }),
    ).toEqual({
      title: 'Revised',
      content: null,
      tags: ['a'],
    });
  });

  it('rejects empty notebook updates', () => {
    expect(() => normalizeUpdateNotebookEntryInput({ title: '   ' })).toThrow(
      new NotebookValidationError('No valid fields'),
    );
  });

  it('rejects non-object updates and keeps trimmed categories', () => {
    expect(() => normalizeUpdateNotebookEntryInput(null)).toThrow(
      new NotebookValidationError('Invalid body'),
    );
    expect(normalizeUpdateNotebookEntryInput({ category: ' Ideas ' })).toEqual({
      category: 'Ideas',
    });
  });

  it('lists notebook entries', async () => {
    selectOrderBy.mockResolvedValue([{ id: 'note-1' }]);

    await expect(listNotebookEntries('user-1')).resolves.toEqual([{ id: 'note-1' }]);
    expect(select).toHaveBeenCalledTimes(1);
  });

  it('creates notebook entries', async () => {
    insertReturning.mockResolvedValue([{ id: 'note-1' }]);

    await expect(
      createNotebookEntry('user-1', {
        category: 'Ideas',
        title: 'Draft',
        content: null,
        tags: ['song'],
      }),
    ).resolves.toEqual({ id: 'note-1' });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('updates notebook entries', async () => {
    updateReturning.mockResolvedValue([{ id: 'note-1', title: 'Draft' }]);

    await expect(
      updateNotebookEntry('user-1', 'note-1', { title: 'Draft', content: null }),
    ).resolves.toEqual({ id: 'note-1', title: 'Draft' });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('deletes notebook entries', async () => {
    deleteWhere.mockResolvedValue(undefined);

    await expect(deleteNotebookEntry('user-1', 'note-1')).resolves.toBeUndefined();
    expect(deleteFn).toHaveBeenCalledTimes(1);
  });
});
