import { and, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import {
  deleteSection,
  deleteTracker,
  getEntriesForDate,
  getSection,
  getSectionsWithTrackers,
  insertSection,
  insertTracker,
  upsertEntry,
} from '@/lib/db/queries/cockpit-sections';
import { cockpitSections } from '@/lib/db/schema';

export class SectionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SectionValidationError';
  }
}

export type CreateSectionInput = {
  name: string;
  trackers: { label: string; type: string }[];
};

export type SectionTrackerMutationInput =
  | { action: 'delete'; deleteTrackerId: string }
  | { action: 'create'; label: string; type: string };

export type SectionEntryInput = {
  trackerId: string;
  value: number;
};

export function normalizeCreateSectionInput(input: unknown): CreateSectionInput {
  if (typeof input !== 'object' || input === null || !('name' in input)) {
    throw new SectionValidationError('name is required');
  }

  const { name, trackers } = input as { name?: unknown; trackers?: unknown };
  if (typeof name !== 'string' || !name.trim()) {
    throw new SectionValidationError('name must be non-empty');
  }

  const normalizedTrackers = Array.isArray(trackers)
    ? trackers.flatMap((tracker) => {
        if (typeof tracker !== 'object' || tracker === null) {
          return [];
        }

        const { label, type } = tracker as { label?: unknown; type?: unknown };
        if (typeof label !== 'string' || typeof type !== 'string') {
          return [];
        }

        return [{ label, type }];
      })
    : [];

  return { name: name.trim(), trackers: normalizedTrackers };
}

export function normalizeRenameSectionInput(input: unknown): { name: string } {
  if (typeof input !== 'object' || input === null) {
    throw new SectionValidationError('name is required');
  }

  const { name } = input as { name?: unknown };
  if (typeof name !== 'string' || !name.trim()) {
    throw new SectionValidationError('name is required');
  }

  return { name: name.trim() };
}

export function normalizeSectionTrackerMutationInput(input: unknown): SectionTrackerMutationInput {
  if (typeof input !== 'object' || input === null) {
    throw new SectionValidationError('Invalid body');
  }

  const { deleteTrackerId, label, type } = input as {
    deleteTrackerId?: unknown;
    label?: unknown;
    type?: unknown;
  };

  if (typeof deleteTrackerId === 'string' && deleteTrackerId.length > 0) {
    return { action: 'delete', deleteTrackerId };
  }

  if (typeof label !== 'string' || typeof type !== 'string') {
    throw new SectionValidationError('label and type are required');
  }

  return { action: 'create', label, type };
}

export function normalizeSectionEntryInput(input: unknown): SectionEntryInput {
  if (
    typeof input !== 'object' ||
    input === null ||
    !('trackerId' in input) ||
    !('value' in input)
  ) {
    throw new SectionValidationError('trackerId and value are required');
  }

  const { trackerId, value } = input as { trackerId?: unknown; value?: unknown };
  if (typeof trackerId !== 'string' || typeof value !== 'number') {
    throw new SectionValidationError('trackerId and value are required');
  }

  return { trackerId, value };
}

export async function listSectionsForToday(userId: string, date: string) {
  const db = getDb();
  const [sections, entries] = await Promise.all([
    getSectionsWithTrackers(db, userId),
    getEntriesForDate(db, userId, date),
  ]);

  const entryMap: Record<string, number> = {};
  for (const entry of entries) {
    entryMap[entry.trackerId] = entry.value;
  }

  return { sections, entries: entryMap };
}

export async function createSectionWithTrackers(userId: string, input: CreateSectionInput) {
  const db = getDb();
  const section = await insertSection(db, { userId, name: input.name });

  for (const [position, tracker] of input.trackers.entries()) {
    await insertTracker(db, {
      sectionId: section.id,
      label: tracker.label,
      type: tracker.type,
      position,
    });
  }

  return section;
}

export async function renameSection(userId: string, sectionId: string, name: string) {
  const db = getDb();
  const [updated] = await db
    .update(cockpitSections)
    .set({ name })
    .where(and(eq(cockpitSections.id, sectionId), eq(cockpitSections.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function mutateSectionTracker(
  userId: string,
  sectionId: string,
  input: SectionTrackerMutationInput,
) {
  const db = getDb();

  if (input.action === 'delete') {
    const deleted = await deleteTracker(db, userId, input.deleteTrackerId);
    return { deleted };
  }

  const section = await getSection(db, userId, sectionId);
  if (!section) return null;

  const tracker = await insertTracker(db, {
    sectionId,
    label: input.label,
    type: input.type,
  });
  return { tracker };
}

export async function removeSection(userId: string, sectionId: string) {
  return deleteSection(getDb(), userId, sectionId);
}

export async function recordSectionEntry(userId: string, date: string, input: SectionEntryInput) {
  return upsertEntry(getDb(), {
    trackerId: input.trackerId,
    userId,
    date,
    value: input.value,
  });
}
