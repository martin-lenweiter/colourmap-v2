import { getDb } from '@/lib/db/client';
import {
  type DesignerObservation,
  deleteDesignerObservation,
  insertDesignerObservation,
  listDesignerObservationsByUser,
  setDesignerObservationDone,
} from '@/lib/db/queries/designer-observations';

const MAX_TEXT_LENGTH = 4000;
const MAX_AREA_LENGTH = 40;

export class DesignerObservationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DesignerObservationValidationError';
  }
}

export async function createDesignerObservation(
  userId: string,
  text: string,
  area: string | null,
): Promise<DesignerObservation> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new DesignerObservationValidationError('Observation text is required');
  }
  const trimmedArea = area?.trim() ? area.trim().slice(0, MAX_AREA_LENGTH) : null;
  return insertDesignerObservation(getDb(), {
    userId,
    area: trimmedArea,
    text: trimmed.slice(0, MAX_TEXT_LENGTH),
  });
}

export async function listDesignerObservations(userId: string): Promise<DesignerObservation[]> {
  return listDesignerObservationsByUser(getDb(), userId);
}

export async function removeDesignerObservation(userId: string, id: string): Promise<boolean> {
  const db = getDb();
  // Scope delete to caller — we re-list and only delete if the row's
  // userId matches. This protects against id-guessing across users.
  const all = await listDesignerObservationsByUser(db, userId, 1000);
  if (!all.some((row) => row.id === id)) {
    return false;
  }
  return deleteDesignerObservation(db, id);
}

export async function markDesignerObservationDone(
  userId: string,
  id: string,
  done: boolean,
): Promise<DesignerObservation | null> {
  const db = getDb();
  const all = await listDesignerObservationsByUser(db, userId, 1000);
  if (!all.some((row) => row.id === id)) return null;
  return setDesignerObservationDone(db, id, done);
}
