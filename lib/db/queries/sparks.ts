import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import {
  type ResonanceStatus,
  type ResonanceType,
  type SparkCategory,
  type SparkStatus,
  type SparkTimeWindow,
  sparkResonances,
  sparks,
} from '@/lib/db/schema';

export type InsertSpark = {
  userId: string;
  circleId?: string | null;
  text: string;
  category: SparkCategory;
  timeWindow: SparkTimeWindow;
  isOpen: boolean;
  lat?: number | null;
  lng?: number | null;
  zoneLabel?: string | null;
  expiresAt?: Date | null;
};

export type SparkRow = typeof sparks.$inferSelect;
export type ResonanceRow = typeof sparkResonances.$inferSelect;

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function insertSpark(data: InsertSpark): Promise<SparkRow> {
  const db = getDb();
  const [row] = await db.insert(sparks).values(data).returning();
  return row;
}

export async function updateSparkStatus(id: string, userId: string, status: SparkStatus) {
  const db = getDb();
  await db
    .update(sparks)
    .set({ status })
    .where(and(eq(sparks.id, id), eq(sparks.userId, userId)));
}

export async function setSparkOpen(
  id: string,
  userId: string,
  isOpen: boolean,
  lat: number | null,
  lng: number | null,
  zoneLabel: string | null,
) {
  const db = getDb();
  await db
    .update(sparks)
    .set({ isOpen, lat, lng, zoneLabel })
    .where(and(eq(sparks.id, id), eq(sparks.userId, userId)));
}

export async function deleteSpark(id: string, userId: string) {
  const db = getDb();
  await db.delete(sparks).where(and(eq(sparks.id, id), eq(sparks.userId, userId)));
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getSparksByUser(userId: string): Promise<SparkRow[]> {
  const db = getDb();
  return db
    .select()
    .from(sparks)
    .where(and(eq(sparks.userId, userId), eq(sparks.status, 'active')))
    .orderBy(desc(sparks.createdAt))
    .limit(100);
}

export async function getSparksByCircle(circleId: string): Promise<SparkRow[]> {
  const db = getDb();
  return db
    .select()
    .from(sparks)
    .where(and(eq(sparks.circleId, circleId), eq(sparks.status, 'active')))
    .orderBy(desc(sparks.createdAt))
    .limit(100);
}

export async function getSparkById(id: string): Promise<SparkRow | null> {
  const db = getDb();
  const [row] = await db.select().from(sparks).where(eq(sparks.id, id)).limit(1);
  return row ?? null;
}

/**
 * Geo query — finds open+active sparks within radiusKm of the given point.
 * Uses PostGIS ST_DWithin against the functional GIST index, so this stays
 * fast at any user count. Results are capped at 100 per request.
 *
 * Two-stage approach for safety:
 *   1. Bounding-box pre-filter (cheap, uses the index).
 *   2. ST_DWithin exact filter (runs on the pre-filtered set only).
 */
export async function getNearbyOpenSparks(
  lat: number,
  lng: number,
  radiusKm: number,
  limit = 100,
): Promise<(SparkRow & { distanceKm: number })[]> {
  const db = getDb();
  const radiusM = radiusKm * 1000;

  const rows = await db.execute(sql`
    SELECT
      d.*,
      ROUND(
        ST_Distance(
          ST_SetSRID(ST_MakePoint(d.lng, d.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) / 1000.0,
        2
      )::float AS "distanceKm"
    FROM sparks d
    WHERE
      d.is_open = TRUE
      AND d.status = 'active'
      AND d.lat IS NOT NULL
      AND d.lng IS NOT NULL
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(d.lng, d.lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusM}
      )
    ORDER BY "distanceKm" ASC
    LIMIT ${limit}
  `);

  return rows as unknown as (SparkRow & { distanceKm: number })[];
}

// ─── Resonances ───────────────────────────────────────────────────────────────

export async function upsertResonance(
  sparkId: string,
  userId: string,
  type: ResonanceType,
): Promise<ResonanceRow> {
  const db = getDb();
  const [row] = await db
    .insert(sparkResonances)
    .values({ sparkId, userId, type, status: 'pending' })
    .onConflictDoUpdate({
      target: [sparkResonances.sparkId, sparkResonances.userId],
      set: { type, status: 'pending' },
    })
    .returning();
  return row;
}

export async function updateResonanceStatus(
  sparkId: string,
  resonatingUserId: string,
  status: ResonanceStatus,
) {
  const db = getDb();
  await db
    .update(sparkResonances)
    .set({ status })
    .where(and(eq(sparkResonances.sparkId, sparkId), eq(sparkResonances.userId, resonatingUserId)));
}

export async function getResonancesForSpark(sparkId: string): Promise<ResonanceRow[]> {
  const db = getDb();
  return db
    .select()
    .from(sparkResonances)
    .where(eq(sparkResonances.sparkId, sparkId))
    .orderBy(desc(sparkResonances.createdAt));
}

export async function getResonancesByUser(userId: string): Promise<ResonanceRow[]> {
  const db = getDb();
  return db
    .select()
    .from(sparkResonances)
    .where(eq(sparkResonances.userId, userId))
    .orderBy(desc(sparkResonances.createdAt))
    .limit(200);
}

// Returns resonances on sparks owned by ownerId — their "inbox".
export async function getInboundResonances(ownerId: string): Promise<ResonanceRow[]> {
  const db = getDb();
  const ownedSparks = await db
    .select({ id: sparks.id })
    .from(sparks)
    .where(eq(sparks.userId, ownerId));
  if (ownedSparks.length === 0) return [];
  return db
    .select()
    .from(sparkResonances)
    .where(
      inArray(
        sparkResonances.sparkId,
        ownedSparks.map((s) => s.id),
      ),
    )
    .orderBy(desc(sparkResonances.createdAt))
    .limit(100);
}

export async function getResonanceCounts(sparkIds: string[]): Promise<Record<string, number>> {
  if (sparkIds.length === 0) return {};
  const db = getDb();
  const rows = await db
    .select({
      sparkId: sparkResonances.sparkId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(sparkResonances)
    .where(inArray(sparkResonances.sparkId, sparkIds))
    .groupBy(sparkResonances.sparkId);
  return Object.fromEntries(rows.map((r) => [r.sparkId, r.count]));
}
