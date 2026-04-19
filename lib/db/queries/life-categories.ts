import { and, asc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@/lib/db/schema';

export async function listLifeCategories(db: PostgresJsDatabase<typeof schema>, userId: string) {
  return db
    .select()
    .from(schema.lifeCategories)
    .where(eq(schema.lifeCategories.userId, userId))
    .orderBy(asc(schema.lifeCategories.position));
}

export async function insertLifeCategory(
  db: PostgresJsDatabase<typeof schema>,
  data: { userId: string; name: string; color?: string; compass?: string; position?: number },
) {
  const [row] = await db
    .insert(schema.lifeCategories)
    .values({
      userId: data.userId,
      name: data.name,
      color: data.color || '#C4A060',
      compass: data.compass || null,
      position: data.position || 0,
    })
    .returning();
  return row;
}

export async function updateLifeCategory(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  id: string,
  updates: Partial<{
    name: string;
    color: string;
    compass: string | null;
    state: string | null;
    position: number;
  }>,
) {
  const [row] = await db
    .update(schema.lifeCategories)
    .set(updates)
    .where(and(eq(schema.lifeCategories.id, id), eq(schema.lifeCategories.userId, userId)))
    .returning();
  return row || null;
}

export async function deleteLifeCategory(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  id: string,
) {
  await db
    .delete(schema.lifeCategories)
    .where(and(eq(schema.lifeCategories.id, id), eq(schema.lifeCategories.userId, userId)));
}
