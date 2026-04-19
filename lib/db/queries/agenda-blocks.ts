import { and, asc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@/lib/db/schema';

export async function listAgendaBlocks(db: PostgresJsDatabase<typeof schema>, userId: string) {
  return db
    .select()
    .from(schema.agendaBlocks)
    .where(eq(schema.agendaBlocks.userId, userId))
    .orderBy(asc(schema.agendaBlocks.date), asc(schema.agendaBlocks.startHour));
}

export async function insertAgendaBlock(
  db: PostgresJsDatabase<typeof schema>,
  data: {
    userId: string;
    text: string;
    date: string;
    startHour: number;
    durationMinutes?: number;
    color?: string;
    kind?: string;
    tagName?: string;
    tagColor?: string;
    tagCategoryId?: string;
  },
) {
  const [row] = await db
    .insert(schema.agendaBlocks)
    .values({
      userId: data.userId,
      text: data.text,
      date: data.date,
      startHour: data.startHour,
      duration: data.durationMinutes || 60,
      color: data.color || '#C4A060',
      kind: data.kind || 'mission',
      tagName: data.tagName || null,
      tagColor: data.tagColor || null,
      tagCategoryId: data.tagCategoryId || null,
    })
    .returning();
  return row;
}

export async function updateAgendaBlock(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  id: string,
  updates: Partial<{
    text: string;
    date: string;
    startHour: number;
    duration: number;
    color: string;
    kind: string;
  }>,
) {
  const [row] = await db
    .update(schema.agendaBlocks)
    .set(updates)
    .where(and(eq(schema.agendaBlocks.id, id), eq(schema.agendaBlocks.userId, userId)))
    .returning();
  return row || null;
}

export async function deleteAgendaBlock(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  id: string,
) {
  await db
    .delete(schema.agendaBlocks)
    .where(and(eq(schema.agendaBlocks.id, id), eq(schema.agendaBlocks.userId, userId)));
}
