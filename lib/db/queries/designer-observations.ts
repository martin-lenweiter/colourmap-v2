import { desc, eq, type InferSelectModel } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import type * as schema from '@/lib/db/schema';
import { designerObservations } from '@/lib/db/schema';

export type DesignerObservation = InferSelectModel<typeof designerObservations>;

type Db = PostgresJsDatabase<typeof schema>;

export async function insertDesignerObservation(
  db: Db,
  data: { userId: string; area: string | null; text: string },
): Promise<DesignerObservation> {
  const [row] = await db.insert(designerObservations).values(data).returning();
  return row;
}

export async function listDesignerObservationsByUser(
  db: Db,
  userId: string,
  limit = 200,
): Promise<DesignerObservation[]> {
  return db
    .select()
    .from(designerObservations)
    .where(eq(designerObservations.userId, userId))
    .orderBy(desc(designerObservations.createdAt))
    .limit(limit);
}

export async function deleteDesignerObservation(db: Db, id: string): Promise<boolean> {
  const result = await db
    .delete(designerObservations)
    .where(eq(designerObservations.id, id))
    .returning();
  return result.length > 0;
}
