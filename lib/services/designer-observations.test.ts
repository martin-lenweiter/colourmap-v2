import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── DB mock ─────────────────────────────────────────────────────────────────
const selectLimit = vi.fn();
const selectOrderBy = vi.fn(() => ({ limit: selectLimit }));
const selectWhere = vi.fn(() => ({ orderBy: selectOrderBy }));
const selectFrom = vi.fn(() => ({ where: selectWhere }));
const select = vi.fn(() => ({ from: selectFrom }));

const updateReturning = vi.fn();
const updateWhere = vi.fn(() => ({ returning: updateReturning }));
const updateSet = vi.fn(() => ({ where: updateWhere }));
const update = vi.fn(() => ({ set: updateSet }));

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => ({ select, update })),
}));

vi.mock('@/lib/db/client', () => ({ getDb }));

import {
  DesignerObservationValidationError,
  markDesignerObservationDone,
} from './designer-observations';

const obsRow = {
  id: 'obs-1',
  userId: 'user-1',
  text: 'foo',
  area: null,
  done: false,
  createdAt: new Date(),
};

describe('designer observations service', () => {
  beforeEach(() => {
    getDb.mockClear();
    select.mockClear();
    selectFrom.mockClear();
    selectWhere.mockClear();
    selectOrderBy.mockClear();
    selectLimit.mockReset();
    update.mockClear();
    updateSet.mockClear();
    updateWhere.mockClear();
    updateReturning.mockReset();
  });

  it('exports DesignerObservationValidationError', () => {
    const err = new DesignerObservationValidationError('test');
    expect(err.name).toBe('DesignerObservationValidationError');
    expect(err.message).toBe('test');
  });

  describe('markDesignerObservationDone', () => {
    it('marks an observation done when the user owns it', async () => {
      selectLimit.mockResolvedValue([obsRow]);
      const updated = { ...obsRow, done: true };
      updateReturning.mockResolvedValue([updated]);

      const result = await markDesignerObservationDone('user-1', 'obs-1', true);
      expect(result).toEqual(updated);
      expect(updateReturning).toHaveBeenCalled();
    });

    it('returns null when the observation does not belong to the user', async () => {
      selectLimit.mockResolvedValue([]);

      const result = await markDesignerObservationDone('user-2', 'obs-1', true);
      expect(result).toBeNull();
      expect(update).not.toHaveBeenCalled();
    });
  });
});
