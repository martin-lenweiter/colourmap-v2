import { and, desc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import { recordings } from '@/lib/db/schema';

export type RecordingRow = typeof recordings.$inferSelect;

export type CreateRecordingInput = {
  title: string;
  storagePath: string;
  publicUrl: string;
  durationSecs: number | null;
  songId: string | null;
  category: string;
  notes: string | null;
};

export type UpdateRecordingInput = Partial<
  Pick<CreateRecordingInput, 'title' | 'songId' | 'category' | 'notes' | 'durationSecs'>
>;

export async function listRecordings(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(recordings)
    .where(eq(recordings.userId, userId))
    .orderBy(desc(recordings.createdAt));
}

export async function createRecording(userId: string, input: CreateRecordingInput) {
  const db = getDb();
  const [row] = await db
    .insert(recordings)
    .values({ userId, ...input })
    .returning();
  return row;
}

export async function updateRecording(
  userId: string,
  recordingId: string,
  input: UpdateRecordingInput,
) {
  const db = getDb();
  const [row] = await db
    .update(recordings)
    .set(input)
    .where(and(eq(recordings.id, recordingId), eq(recordings.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteRecording(userId: string, recordingId: string) {
  const db = getDb();
  const [row] = await db
    .delete(recordings)
    .where(and(eq(recordings.id, recordingId), eq(recordings.userId, userId)))
    .returning();
  return row ?? null;
}
