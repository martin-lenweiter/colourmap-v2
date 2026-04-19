import { and, desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@/lib/db/schema';

export async function listOutings(db: PostgresJsDatabase<typeof schema>, userId: string) {
  return db
    .select()
    .from(schema.outings)
    .where(eq(schema.outings.userId, userId))
    .orderBy(desc(schema.outings.date));
}

export async function insertOuting(
  db: PostgresJsDatabase<typeof schema>,
  data: { userId: string; text: string; date: string; color?: string },
) {
  const [row] = await db
    .insert(schema.outings)
    .values({
      userId: data.userId,
      text: data.text,
      date: data.date,
      color: data.color || '#6B7F4E',
    })
    .returning();
  return row;
}

export async function deleteOuting(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  id: string,
) {
  await db
    .delete(schema.outings)
    .where(and(eq(schema.outings.id, id), eq(schema.outings.userId, userId)));
}
