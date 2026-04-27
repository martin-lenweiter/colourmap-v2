import {
  deleteSpark,
  getNearbyOpenSparks,
  getResonanceCounts,
  getResonancesForSpark,
  getSparkById,
  getSparksByCircle,
  getSparksByUser,
  insertSpark,
  type ResonanceRow,
  type SparkRow,
  setSparkOpen,
  updateResonanceStatus,
  updateSparkStatus,
  upsertResonance,
} from '@/lib/db/queries/sparks';
import type { ResonanceStatus, SparkCategory, SparkTimeWindow } from '@/lib/db/schema';

export class SparkValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SparkValidationError';
  }
}

const MAX_TEXT_LENGTH = 200;
const MAX_RADIUS_KM = 50;
const DEFAULT_RADIUS_KM = 10;
const EXPIRY_DAYS: Record<SparkTimeWindow, number> = {
  this_week: 7,
  this_month: 30,
  no_rush: 90,
};

export type SparkWithMeta = SparkRow & { resonanceCount: number };

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSpark(
  userId: string,
  input: {
    text: string;
    category: SparkCategory;
    timeWindow: SparkTimeWindow;
    circleId?: string | null;
    isOpen?: boolean;
    lat?: number | null;
    lng?: number | null;
    zoneLabel?: string | null;
  },
): Promise<SparkRow> {
  const text = input.text.trim();
  if (!text) throw new SparkValidationError('text is required');
  if (text.length > MAX_TEXT_LENGTH) {
    throw new SparkValidationError(`text must be ≤ ${MAX_TEXT_LENGTH} characters`);
  }
  const validCategories: SparkCategory[] = ['fun', 'creative', 'professional', 'growth'];
  if (!validCategories.includes(input.category)) {
    throw new SparkValidationError('invalid category');
  }
  const validWindows: SparkTimeWindow[] = ['this_week', 'this_month', 'no_rush'];
  if (!validWindows.includes(input.timeWindow)) {
    throw new SparkValidationError('invalid timeWindow');
  }
  // Require coordinates when opening to the map
  const isOpen = input.isOpen ?? false;
  if (isOpen && (input.lat == null || input.lng == null)) {
    throw new SparkValidationError('lat and lng are required when isOpen is true');
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS[input.timeWindow]);

  return insertSpark({
    userId,
    circleId: input.circleId ?? null,
    text,
    category: input.category,
    timeWindow: input.timeWindow,
    isOpen,
    lat: isOpen ? input.lat : null,
    lng: isOpen ? input.lng : null,
    zoneLabel: isOpen ? input.zoneLabel?.trim() || null : null,
    expiresAt,
  });
}

// ─── Open to map ──────────────────────────────────────────────────────────────

export async function openSparkToMap(
  sparkId: string,
  userId: string,
  lat: number,
  lng: number,
  zoneLabel: string | null,
) {
  const spark = await getSparkById(sparkId);
  if (!spark) throw new SparkValidationError('Spark not found');
  if (spark.userId !== userId) throw new SparkValidationError('Not your spark');
  await setSparkOpen(sparkId, userId, true, lat, lng, zoneLabel?.trim() || null);
}

export async function closeSparkFromMap(sparkId: string, userId: string) {
  const spark = await getSparkById(sparkId);
  if (!spark) throw new SparkValidationError('Spark not found');
  if (spark.userId !== userId) throw new SparkValidationError('Not your spark');
  await setSparkOpen(sparkId, userId, false, null, null, null);
}

// ─── Status changes ───────────────────────────────────────────────────────────

export async function fulfillSpark(sparkId: string, userId: string) {
  const spark = await getSparkById(sparkId);
  if (!spark) throw new SparkValidationError('Spark not found');
  if (spark.userId !== userId) throw new SparkValidationError('Not your spark');
  await updateSparkStatus(sparkId, userId, 'fulfilled');
}

export async function removeSpark(sparkId: string, userId: string) {
  const spark = await getSparkById(sparkId);
  if (!spark) throw new SparkValidationError('Spark not found');
  if (spark.userId !== userId) throw new SparkValidationError('Not your spark');
  await deleteSpark(sparkId, userId);
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function listMySparks(userId: string): Promise<SparkWithMeta[]> {
  const rows = await getSparksByUser(userId);
  const counts = await getResonanceCounts(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, resonanceCount: counts[r.id] ?? 0 }));
}

export async function listCircleSparks(circleId: string): Promise<SparkWithMeta[]> {
  const rows = await getSparksByCircle(circleId);
  const counts = await getResonanceCounts(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, resonanceCount: counts[r.id] ?? 0 }));
}

export async function listNearbySparks(
  lat: number,
  lng: number,
  radiusKm?: number,
): Promise<(SparkRow & { distanceKm: number; resonanceCount: number })[]> {
  const radius = Math.min(radiusKm ?? DEFAULT_RADIUS_KM, MAX_RADIUS_KM);
  const rows = await getNearbyOpenSparks(lat, lng, radius);
  const counts = await getResonanceCounts(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, resonanceCount: counts[r.id] ?? 0 }));
}

// ─── Resonances ───────────────────────────────────────────────────────────────

export async function resonateWithSpark(
  sparkId: string,
  userId: string,
  type: 'resonate' | 'join_request' = 'resonate',
): Promise<ResonanceRow> {
  const spark = await getSparkById(sparkId);
  if (!spark) throw new SparkValidationError('Spark not found');
  if (spark.userId === userId)
    throw new SparkValidationError('Cannot resonate with your own spark');
  if (spark.status !== 'active') throw new SparkValidationError('Spark is no longer active');
  return upsertResonance(sparkId, userId, type);
}

export async function respondToResonance(
  sparkId: string,
  ownerId: string,
  resonatingUserId: string,
  status: ResonanceStatus,
) {
  const spark = await getSparkById(sparkId);
  if (!spark) throw new SparkValidationError('Spark not found');
  if (spark.userId !== ownerId) throw new SparkValidationError('Not your spark');
  await updateResonanceStatus(sparkId, resonatingUserId, status);
}

export async function getSparkDetail(
  sparkId: string,
): Promise<(SparkRow & { resonances: ResonanceRow[] }) | null> {
  const spark = await getSparkById(sparkId);
  if (!spark) return null;
  const resonances = await getResonancesForSpark(sparkId);
  return { ...spark, resonances };
}
