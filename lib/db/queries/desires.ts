import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import {
  type DesireCategory,
  type DesireStatus,
  type DesireTimeWindow,
  desireResonances,
  desires,
  type ResonanceStatus,
  type ResonanceType,
} from '@/lib/db/schema';

export type InsertDesire = {
  userId: string;
  circleId?: string | null;
  text: string;
  category: DesireCategory;
  timeWindow: DesireTimeWindow;
  isOpen: boolean;
  lat?: number | null;
  lng?: number | null;
  zoneLabel?: string | null;
  expiresAt?: Date | null;
};

export type DesireRow = typeof desires.$inferSelect;
export type ResonanceRow = typeof desireResonances.$inferSelect;

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function insertDesire(data: InsertDesire): Promise<DesireRow> {
  const db = getDb();
  const [row] = await db.insert(desires).values(data).returning();
  return row;
}

export async function updateDesireStatus(id: string, userId: string, status: DesireStatus) {
  const db = getDb();
  await db
    .update(desires)
    .set({ status })
    .where(and(eq(desires.id, id), eq(desires.userId, userId)));
}

export async function setDesireOpen(
  id: string,
  userId: string,
  isOpen: boolean,
  lat: number | null,
  lng: number | null,
  zoneLabel: string | null,
) {
  const db = getDb();
  await db
    .update(desires)
    .set({ isOpen, lat, lng, zoneLabel })
    .where(and(eq(desires.id, id), eq(desires.userId, userId)));
}

export async function deleteDesire(id: string, userId: string) {
  const db = getDb();
  await db.delete(desires).where(and(eq(desires.id, id), eq(desires.userId, userId)));
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getDesiresByUser(userId: string): Promise<DesireRow[]> {
  const db = getDb();
  return db
    .select()
    .from(desires)
    .where(and(eq(desires.userId, userId), eq(desires.status, 'active')))
    .orderBy(desc(desires.createdAt))
    .limit(100);
}

export async function getDesiresByCircle(circleId: string): Promise<DesireRow[]> {
  const db = getDb();
  return db
    .select()
    .from(desires)
    .where(and(eq(desires.circleId, circleId), eq(desires.status, 'active')))
    .orderBy(desc(desires.createdAt))
    .limit(100);
}

export async function getDesireById(id: string): Promise<DesireRow | null> {
  const db = getDb();
  const [row] = await db.select().from(desires).where(eq(desires.id, id)).limit(1);
  return row ?? null;
}

/**
 * Geo query — finds open+active desires within radiusKm of the given point.
 * Uses PostGIS ST_DWithin against the functional GIST index, so this stays
 * fast at any user count. Results are capped at 100 per request.
 *
 * Two-stage approach for safety:
 *   1. Bounding-box pre-filter (cheap, uses the index).
 *   2. ST_DWithin exact filter (runs on the pre-filtered set only).
 */
export async function getNearbyOpenDesires(
  lat: number,
  lng: number,
  radiusKm: number,
  limit = 100,
): Promise<(DesireRow & { distanceKm: number })[]> {
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
    FROM desires d
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

  return rows as unknown as (DesireRow & { distanceKm: number })[];
}

// ─── Resonances ───────────────────────────────────────────────────────────────

export async function upsertResonance(
  desireId: string,
  userId: string,
  type: ResonanceType,
): Promise<ResonanceRow> {
  const db = getDb();
  const [row] = await db
    .insert(desireResonances)
    .values({ desireId, userId, type, status: 'pending' })
    .onConflictDoUpdate({
      target: [desireResonances.desireId, desireResonances.userId],
      set: { type, status: 'pending' },
    })
    .returning();
  return row;
}

export async function updateResonanceStatus(
  desireId: string,
  resonatingUserId: string,
  status: ResonanceStatus,
) {
  const db = getDb();
  await db
    .update(desireResonances)
    .set({ status })
    .where(
      and(eq(desireResonances.desireId, desireId), eq(desireResonances.userId, resonatingUserId)),
    );
}

export async function getResonancesForDesire(desireId: string): Promise<ResonanceRow[]> {
  const db = getDb();
  return db
    .select()
    .from(desireResonances)
    .where(eq(desireResonances.desireId, desireId))
    .orderBy(desc(desireResonances.createdAt));
}

export async function getResonancesByUser(userId: string): Promise<ResonanceRow[]> {
  const db = getDb();
  return db
    .select()
    .from(desireResonances)
    .where(eq(desireResonances.userId, userId))
    .orderBy(desc(desireResonances.createdAt))
    .limit(200);
}

export async function getResonanceCounts(desireIds: string[]): Promise<Record<string, number>> {
  if (desireIds.length === 0) return {};
  const db = getDb();
  const rows = await db
    .select({
      desireId: desireResonances.desireId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(desireResonances)
    .where(inArray(desireResonances.desireId, desireIds))
    .groupBy(desireResonances.desireId);
  return Object.fromEntries(rows.map((r) => [r.desireId, r.count]));
}
