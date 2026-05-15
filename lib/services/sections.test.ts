import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  deleteSection,
  deleteTracker,
  getEntriesForDate,
  getSection,
  getSectionsWithTrackers,
  insertSection,
  insertTracker,
  upsertEntry,
} = vi.hoisted(() => ({
  deleteSection: vi.fn(),
  deleteTracker: vi.fn(),
  getEntriesForDate: vi.fn(),
  getSection: vi.fn(),
  getSectionsWithTrackers: vi.fn(),
  insertSection: vi.fn(),
  insertTracker: vi.fn(),
  upsertEntry: vi.fn(),
}));

const updateReturning = vi.fn();
const updateWhere = vi.fn(() => ({ returning: updateReturning }));
const updateSet = vi.fn(() => ({ where: updateWhere }));
const update = vi.fn(() => ({ set: updateSet }));

const { getDb } = vi.hoisted(() => ({
  getDb: vi.fn(() => ({ update })),
}));

vi.mock('@/lib/db/client', () => ({ getDb }));
vi.mock('@/lib/db/queries/cockpit-sections', () => ({
  deleteSection,
  deleteTracker,
  getEntriesForDate,
  getSection,
  getSectionsWithTrackers,
  insertSection,
  insertTracker,
  upsertEntry,
}));

import {
  createSectionWithTrackers,
  listSectionsForToday,
  mutateSectionTracker,
  normalizeCreateSectionInput,
  normalizeRenameSectionInput,
  normalizeSectionEntryInput,
  normalizeSectionTrackerMutationInput,
  recordSectionEntry,
  removeSection,
  renameSection,
  SectionValidationError,
} from './sections';

describe('sections service', () => {
  beforeEach(() => {
    getDb.mockClear();
    getSectionsWithTrackers.mockReset();
    getEntriesForDate.mockReset();
    getSection.mockReset();
    insertSection.mockReset();
    insertTracker.mockReset();
    deleteTracker.mockReset();
    deleteSection.mockReset();
    upsertEntry.mockReset();
    update.mockClear();
    updateSet.mockClear();
    updateWhere.mockClear();
    updateReturning.mockReset();
  });

  it('normalizes section creation payloads', () => {
    expect(
      normalizeCreateSectionInput({
        name: ' Focus ',
        trackers: [{ label: 'Energy', type: 'scale' }, { broken: true }],
      }),
    ).toEqual({
      name: 'Focus',
      trackers: [{ label: 'Energy', type: 'scale' }],
    });
  });

  it('rejects invalid section name', () => {
    expect(() => normalizeCreateSectionInput({ name: '   ' })).toThrow(
      new SectionValidationError('name must be non-empty'),
    );
    expect(() => normalizeCreateSectionInput({})).toThrow(
      new SectionValidationError('name is required'),
    );
  });

  it('normalizes rename, entry, and tracker mutation inputs', () => {
    expect(normalizeRenameSectionInput({ name: ' Calm ' })).toEqual({ name: 'Calm' });
    expect(normalizeSectionEntryInput({ trackerId: 'tracker-1', value: 4 })).toEqual({
      trackerId: 'tracker-1',
      value: 4,
    });
    expect(normalizeSectionTrackerMutationInput({ deleteTrackerId: 'tracker-1' })).toEqual({
      action: 'delete',
      deleteTrackerId: 'tracker-1',
    });
    expect(normalizeSectionTrackerMutationInput({ label: 'Energy', type: 'scale' })).toEqual({
      action: 'create',
      label: 'Energy',
      type: 'scale',
    });
  });

  it('rejects invalid tracker mutation payloads', () => {
    expect(() => normalizeSectionTrackerMutationInput(null)).toThrow(
      new SectionValidationError('Invalid body'),
    );
    expect(() => normalizeSectionTrackerMutationInput({ label: 'Energy' })).toThrow(
      new SectionValidationError('label and type are required'),
    );
    expect(() => normalizeSectionEntryInput({ trackerId: 1, value: 'bad' })).toThrow(
      new SectionValidationError('trackerId and value are required'),
    );
  });

  it('lists today sections with an entry map', async () => {
    getSectionsWithTrackers.mockResolvedValue([{ id: 'section-1', trackers: [] }]);
    getEntriesForDate.mockResolvedValue([{ trackerId: 'tracker-1', value: 3 }]);

    await expect(listSectionsForToday('user-1', '2026-04-06')).resolves.toEqual({
      sections: [{ id: 'section-1', trackers: [] }],
      entries: { 'tracker-1': 3 },
    });
  });

  it('creates a section and its trackers', async () => {
    insertSection.mockResolvedValue({ id: 'section-1', name: 'Focus' });
    insertTracker.mockResolvedValue({ id: 'tracker-1' });

    const section = await createSectionWithTrackers('user-1', {
      name: 'Focus',
      trackers: [{ label: 'Energy', type: 'scale' }],
    });

    expect(insertSection).toHaveBeenCalledWith({ update }, { userId: 'user-1', name: 'Focus' });
    expect(insertTracker).toHaveBeenCalledWith(
      { update },
      {
        sectionId: 'section-1',
        label: 'Energy',
        type: 'scale',
        position: 0,
      },
    );
    expect(section).toEqual({ id: 'section-1', name: 'Focus' });
  });

  it('renames a section through the db client', async () => {
    updateReturning.mockResolvedValue([{ id: 'section-1', name: 'Renamed' }]);

    await expect(renameSection('user-1', 'section-1', 'Renamed')).resolves.toEqual({
      id: 'section-1',
      name: 'Renamed',
    });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('creates and deletes trackers', async () => {
    getSection.mockResolvedValue({ id: 'section-1', userId: 'user-1', name: 'Focus' });
    insertTracker.mockResolvedValue({ id: 'tracker-1' });
    deleteTracker.mockResolvedValue(true);

    await expect(
      mutateSectionTracker('user-1', 'section-1', {
        action: 'create',
        label: 'Energy',
        type: 'scale',
      }),
    ).resolves.toEqual({ tracker: { id: 'tracker-1' } });
    await expect(
      mutateSectionTracker('user-1', 'section-1', {
        action: 'delete',
        deleteTrackerId: 'tracker-1',
      }),
    ).resolves.toEqual({ deleted: true });
    expect(deleteTracker).toHaveBeenCalledWith({ update }, 'user-1', 'tracker-1');
  });

  it('returns null when creating a tracker for a missing section', async () => {
    getSection.mockResolvedValue(null);

    await expect(
      mutateSectionTracker('user-1', 'section-1', {
        action: 'create',
        label: 'Energy',
        type: 'scale',
      }),
    ).resolves.toBeNull();
    expect(insertTracker).not.toHaveBeenCalled();
  });

  it('removes sections and records entries', async () => {
    deleteSection.mockResolvedValue(true);
    upsertEntry.mockResolvedValue({ id: 'entry-1' });

    await expect(removeSection('user-1', 'section-1')).resolves.toBe(true);
    await expect(
      recordSectionEntry('user-1', '2026-04-06', { trackerId: 'tracker-1', value: 5 }),
    ).resolves.toEqual({ id: 'entry-1' });
  });
});
