import { and, asc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@/lib/db/schema';

export async function listDailyObjectives(db: PostgresJsDatabase<typeof schema>, userId: string) {
  return db
    .select()
    .from(schema.dailyObjectives)
    .where(eq(schema.dailyObjectives.userId, userId))
    .orderBy(asc(schema.dailyObjectives.position));
}

export async function insertDailyObjective(
  db: PostgresJsDatabase<typeof schema>,
  data: { userId: string; text: string; list?: string; position?: number },
) {
  const [row] = await db
    .insert(schema.dailyObjectives)
    .values({
      userId: data.userId,
      text: data.text,
      list: data.list || 'today',
      position: data.position || 0,
    })
    .returning();
  return row;
}

export async function updateDailyObjective(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  id: string,
  updates: Partial<{ text: string; done: boolean; list: string; notes: string; position: number }>,
) {
  const [row] = await db
    .update(schema.dailyObjectives)
    .set(updates)
    .where(and(eq(schema.dailyObjectives.id, id), eq(schema.dailyObjectives.userId, userId)))
    .returning();
  return row || null;
}

export async function deleteDailyObjective(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  id: string,
) {
  await db
    .delete(schema.dailyObjectives)
    .where(and(eq(schema.dailyObjectives.id, id), eq(schema.dailyObjectives.userId, userId)));
}
