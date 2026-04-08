import { and, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import {
  type CheckIn,
  getCheckInsForMission,
  getRecentCheckIns,
  insertCheckIn,
} from '@/lib/db/queries/check-ins';
import type { CheckInFacing, CheckInFeelingCompass, CheckInPulses } from '@/lib/db/schema';
import { checkIns } from '@/lib/db/schema';

const MAX_NOTE_LENGTH = 500;
const MAX_SHORT_TEXT_LENGTH = 280;
const MAX_FACING_ANSWER_LENGTH = 280;
const MAX_FEELING_SUPPORT_ITEMS = 8;
const ALLOWED_TAGS = ['Work', 'Body', 'Relationships', 'Creative', 'General'] as const;
const PULSE_KEYS = ['body', 'attitude', 'structure'] as const;
const FEELING_COMPASS_KEYS = ['attitude', 'emotions', 'presence', 'body'] as const;

type JsonRecord = Record<string, unknown>;

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
  facing?: CheckInFacing | null;
  pulses?: CheckInPulses | null;
  challenge?: string | null;
  flow?: string | null;
  feelingCompass?: CheckInFeelingCompass | null;
  feelingStage?: number | null;
  feelingSupport?: string[] | null;
};

export type UpdateCheckInInput = {
  sliderValue?: number;
  note?: string | null;
  tags?: string[] | null;
  facing?: CheckInFacing | null;
  pulses?: CheckInPulses | null;
  challenge?: string | null;
  flow?: string | null;
  feelingCompass?: CheckInFeelingCompass | null;
  feelingStage?: number | null;
  feelingSupport?: string[] | null;
};

function isPlainObject(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeOptionalText(
  value: unknown,
  fieldName: string,
  maxLength = MAX_SHORT_TEXT_LENGTH,
): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') {
    throw new CheckInValidationError(`${fieldName} must be a string`);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : null;
}

function normalizeOptionalNumberRecord<T extends readonly string[]>(
  value: unknown,
  fieldName: string,
  keys: T,
): Partial<Record<T[number], number>> | null {
  if (value == null) return null;
  if (!isPlainObject(value)) {
    throw new CheckInValidationError(`${fieldName} must be an object`);
  }

  const normalized: Partial<Record<T[number], number>> = {};
  for (const key of keys) {
    const raw = value[key];
    if (raw == null) continue;
    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
      throw new CheckInValidationError(`${fieldName}.${key} must be a number`);
    }
    normalized[key as T[number]] = raw;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

function normalizeFacing(value: unknown): CheckInFacing | null {
  if (value == null) return null;
  if (!isPlainObject(value)) {
    throw new CheckInValidationError('facing must be an object');
  }

  const normalized: CheckInFacing = {};
  for (const [key, rawEntry] of Object.entries(value)) {
    if (!isPlainObject(rawEntry)) {
      throw new CheckInValidationError(`facing.${key} must be an object`);
    }

    const rawLabel = rawEntry.label;
    if (typeof rawLabel !== 'string' || rawLabel.trim().length === 0) {
      throw new CheckInValidationError(`facing.${key}.label must be a string`);
    }

    const rawAnswers = rawEntry.answers;
    if (!Array.isArray(rawAnswers)) {
      throw new CheckInValidationError(`facing.${key}.answers must be an array`);
    }

    const answers = rawAnswers
      .filter((answer): answer is string => typeof answer === 'string')
      .map((answer) => answer.trim())
      .filter(Boolean)
      .map((answer) => answer.slice(0, MAX_FACING_ANSWER_LENGTH));

    normalized[key] = {
      label: rawLabel.trim().slice(0, 60),
      answers,
    };
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

function normalizeFeelingSupport(value: unknown): string[] | null {
  if (value == null) return null;
  if (!Array.isArray(value)) {
    throw new CheckInValidationError('feelingSupport must be an array');
  }

  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_FEELING_SUPPORT_ITEMS);

  return items.length > 0 ? items : null;
}

function normalizeFeelingStage(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 10) {
    throw new CheckInValidationError('feelingStage must be an integer between 0 and 10');
  }
  return value;
}

export function normalizeCreateCheckInInput(input: unknown): CreateCheckInInput {
  if (typeof input !== 'object' || input === null || !('sliderValue' in input)) {
    throw new CheckInValidationError('sliderValue is required');
  }

  const {
    sliderValue,
    note,
    tags,
    missionId,
    emotionName,
    emotionColor,
    facing,
    pulses,
    challenge,
    flow,
    feelingCompass,
    feelingStage,
    feelingSupport,
  } = input as {
    sliderValue: unknown;
    note?: unknown;
    tags?: unknown;
    missionId?: unknown;
    emotionName?: unknown;
    emotionColor?: unknown;
    facing?: unknown;
    pulses?: unknown;
    challenge?: unknown;
    flow?: unknown;
    feelingCompass?: unknown;
    feelingStage?: unknown;
    feelingSupport?: unknown;
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
    facing: normalizeFacing(facing),
    pulses: normalizeOptionalNumberRecord(pulses, 'pulses', PULSE_KEYS),
    challenge: normalizeOptionalText(challenge, 'challenge'),
    flow: normalizeOptionalText(flow, 'flow'),
    feelingCompass: normalizeOptionalNumberRecord(
      feelingCompass,
      'feelingCompass',
      FEELING_COMPASS_KEYS,
    ),
    feelingStage: normalizeFeelingStage(feelingStage),
    feelingSupport: normalizeFeelingSupport(feelingSupport),
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
  const challenge = normalizeOptionalText(input.challenge, 'challenge');
  const flow = normalizeOptionalText(input.flow, 'flow');
  const feelingStage = normalizeFeelingStage(input.feelingStage);
  const feelingSupport = normalizeFeelingSupport(input.feelingSupport);
  const facing = normalizeFacing(input.facing);
  const pulses = normalizeOptionalNumberRecord(input.pulses, 'pulses', PULSE_KEYS);
  const feelingCompass = normalizeOptionalNumberRecord(
    input.feelingCompass,
    'feelingCompass',
    FEELING_COMPASS_KEYS,
  );

  return insertCheckIn(getDb(), {
    userId,
    sliderValue,
    note,
    tags,
    missionId,
    emotionName,
    emotionColor,
    facing,
    pulses,
    challenge,
    flow,
    feelingCompass,
    feelingStage,
    feelingSupport,
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
    facing?: unknown;
    pulses?: unknown;
    challenge?: unknown;
    flow?: unknown;
    feelingCompass?: unknown;
    feelingStage?: unknown;
    feelingSupport?: unknown;
  };

  const updates: UpdateCheckInInput = {};

  if (typeof sliderValue === 'number') updates.sliderValue = sliderValue;
  if (typeof note === 'string' || note === null) updates.note = note;
  if (Array.isArray(tags) || tags === null) updates.tags = tags;
  if ('facing' in input) updates.facing = normalizeFacing((input as JsonRecord).facing);
  if ('pulses' in input) {
    updates.pulses = normalizeOptionalNumberRecord(
      (input as JsonRecord).pulses,
      'pulses',
      PULSE_KEYS,
    );
  }
  if ('challenge' in input) {
    updates.challenge = normalizeOptionalText((input as JsonRecord).challenge, 'challenge');
  }
  if ('flow' in input) {
    updates.flow = normalizeOptionalText((input as JsonRecord).flow, 'flow');
  }
  if ('feelingCompass' in input) {
    updates.feelingCompass = normalizeOptionalNumberRecord(
      (input as JsonRecord).feelingCompass,
      'feelingCompass',
      FEELING_COMPASS_KEYS,
    );
  }
  if ('feelingStage' in input) {
    updates.feelingStage = normalizeFeelingStage((input as JsonRecord).feelingStage);
  }
  if ('feelingSupport' in input) {
    updates.feelingSupport = normalizeFeelingSupport((input as JsonRecord).feelingSupport);
  }

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
