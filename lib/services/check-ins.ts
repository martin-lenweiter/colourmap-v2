import { and, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import {
  type CheckIn,
  getCheckInsForMission,
  getRecentCheckIns,
  insertCheckIn,
} from '@/lib/db/queries/check-ins';
import { checkIns } from '@/lib/db/schema';

const MAX_NOTE_LENGTH = 500;
const ALLOWED_TAGS = ['Work', 'Body', 'Relationships', 'Creative', 'General'] as const;

export class CheckInValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckInValidationError';
  }
}

export type CreateCheckInInput = {
  sliderValue: number;
  note?: string | null;
  tags?: string[] | null;
  missionId?: string | null;
  emotionName?: string | null;
  emotionColor?: string | null;
};

export type UpdateCheckInInput = {
  sliderValue?: number;
  note?: string | null;
  tags?: string[] | null;
};

export function normalizeCreateCheckInInput(input: unknown): CreateCheckInInput {
  if (typeof input !== 'object' || input === null || !('sliderValue' in input)) {
    throw new CheckInValidationError('sliderValue is required');
  }

  const { sliderValue, note, tags, missionId, emotionName, emotionColor } = input as {
    sliderValue: unknown;
    note?: unknown;
    tags?: unknown;
    missionId?: unknown;
    emotionName?: unknown;
    emotionColor?: unknown;
  };

  if (typeof sliderValue !== 'number') {
    throw new CheckInValidationError('sliderValue must be a number');
  }

  return {
    sliderValue,
    note: typeof note === 'string' ? note : null,
    tags: Array.isArray(tags) ? tags : null,
    missionId: typeof missionId === 'string' ? missionId : null,
    emotionName: typeof emotionName === 'string' ? emotionName : null,
    emotionColor: typeof emotionColor === 'string' ? emotionColor : null,
  };
}

export async function createCheckIn(userId: string, input: CreateCheckInInput): Promise<CheckIn> {
  const { sliderValue } = input;

  if (!Number.isInteger(sliderValue) || sliderValue < 0 || sliderValue > 100) {
    throw new CheckInValidationError('sliderValue must be an integer between 0 and 100');
  }

  let note: string | null = null;
  if (input.note != null) {
    const trimmed = input.note.trim();
    if (trimmed.length > 0) {
      note = trimmed.slice(0, MAX_NOTE_LENGTH);
    }
  }

  let tags: string[] | null = null;
  if (Array.isArray(input.tags) && input.tags.length > 0) {
    const valid = input.tags.filter(
      (t): t is string =>
        typeof t === 'string' && ALLOWED_TAGS.includes(t as (typeof ALLOWED_TAGS)[number]),
    );
    tags = valid.length > 0 ? valid : null;
  }

  const missionId = typeof input.missionId === 'string' ? input.missionId : null;

  const emotionName = typeof input.emotionName === 'string' ? input.emotionName : null;
  const emotionColor = typeof input.emotionColor === 'string' ? input.emotionColor : null;

  return insertCheckIn(getDb(), {
    userId,
    sliderValue,
    note,
    tags,
    missionId,
    emotionName,
    emotionColor,
  });
}

export async function listRecentCheckIns(userId: string, limit = 50): Promise<CheckIn[]> {
  return getRecentCheckIns(getDb(), userId, limit);
}

export async function listMissionCheckIns(userId: string, missionId: string): Promise<CheckIn[]> {
  return getCheckInsForMission(getDb(), userId, missionId);
}

export function normalizeCheckInUpdateInput(input: unknown): UpdateCheckInInput {
  if (typeof input !== 'object' || input === null) {
    throw new CheckInValidationError('Invalid body');
  }

  const { sliderValue, note, tags } = input as {
    sliderValue?: unknown;
    note?: unknown;
    tags?: unknown;
  };

  const updates: UpdateCheckInInput = {};

  if (typeof sliderValue === 'number') updates.sliderValue = sliderValue;
  if (typeof note === 'string' || note === null) updates.note = note;
  if (Array.isArray(tags) || tags === null) updates.tags = tags;

  if (Object.keys(updates).length === 0) {
    throw new CheckInValidationError('No valid fields');
  }

  return updates;
}

export async function updateCheckIn(
  userId: string,
  checkInId: string,
  updates: UpdateCheckInInput,
): Promise<CheckIn | null> {
  const [updated] = await getDb()
    .update(checkIns)
    .set(updates)
    .where(and(eq(checkIns.id, checkInId), eq(checkIns.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function deleteCheckIn(userId: string, checkInId: string): Promise<void> {
  await getDb()
    .delete(checkIns)
    .where(and(eq(checkIns.id, checkInId), eq(checkIns.userId, userId)));
}
