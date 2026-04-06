import { getDb } from '@/lib/db/client';
import {
  getLatestScans,
  insertLifeScan,
  insertReflection,
  type LifeScan,
} from '@/lib/db/queries/life-scans';

export class LifeScanValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LifeScanValidationError';
  }
}

type LifeScanDoorInput = {
  door: string;
  sliders: Record<string, number>;
};

type ReflectionInput = {
  question: string;
  answer: string;
};

export type SubmitLifeScanInput = {
  doors: LifeScanDoorInput[];
  reflections: ReflectionInput[];
  scanGroup: string;
};

export function normalizeSubmitLifeScanInput(input: unknown): SubmitLifeScanInput {
  if (typeof input !== 'object' || input === null) {
    throw new LifeScanValidationError('Invalid body');
  }

  const { doors, reflections, scanGroup } = input as {
    doors?: unknown;
    reflections?: unknown;
    scanGroup?: unknown;
  };

  if (!Array.isArray(doors) || doors.length === 0) {
    throw new LifeScanValidationError('doors array is required');
  }

  if (typeof scanGroup !== 'string' || scanGroup.trim().length === 0) {
    throw new LifeScanValidationError('scanGroup is required');
  }

  const normalizedDoors = doors.flatMap((door) => {
    if (typeof door !== 'object' || door === null) {
      return [];
    }

    const { door: name, sliders } = door as { door?: unknown; sliders?: unknown };
    if (typeof name !== 'string' || typeof sliders !== 'object' || sliders === null) {
      return [];
    }

    return [{ door: name, sliders: sliders as Record<string, number> }];
  });

  const normalizedReflections = Array.isArray(reflections)
    ? reflections.flatMap((reflection) => {
        if (typeof reflection !== 'object' || reflection === null) {
          return [];
        }

        const { question, answer } = reflection as { question?: unknown; answer?: unknown };
        if (typeof question !== 'string' || typeof answer !== 'string') {
          return [];
        }

        const trimmedAnswer = answer.trim();
        if (!trimmedAnswer) {
          return [];
        }

        return [{ question, answer: trimmedAnswer }];
      })
    : [];

  return {
    doors: normalizedDoors,
    reflections: normalizedReflections,
    scanGroup: scanGroup.trim(),
  };
}

export async function listLatestLifeScans(userId: string) {
  return getLatestScans(getDb(), userId);
}

export async function submitLifeScan(
  userId: string,
  input: SubmitLifeScanInput,
): Promise<{ scans: LifeScan[]; scanGroup: string }> {
  const db = getDb();
  const scans: LifeScan[] = [];

  for (const door of input.doors) {
    const scan = await insertLifeScan(db, {
      userId,
      door: door.door,
      sliders: door.sliders,
    });
    scans.push(scan);
  }

  for (const reflection of input.reflections) {
    await insertReflection(db, {
      userId,
      scanGroup: input.scanGroup,
      question: reflection.question,
      answer: reflection.answer,
    });
  }

  return { scans, scanGroup: input.scanGroup };
}
