import {
  type DesireRow,
  deleteDesire,
  getDesireById,
  getDesiresByCircle,
  getDesiresByUser,
  getNearbyOpenDesires,
  getResonanceCounts,
  getResonancesForDesire,
  insertDesire,
  type ResonanceRow,
  setDesireOpen,
  updateDesireStatus,
  updateResonanceStatus,
  upsertResonance,
} from '@/lib/db/queries/desires';
import type { DesireCategory, DesireTimeWindow, ResonanceStatus } from '@/lib/db/schema';

export class DesireValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DesireValidationError';
  }
}

const MAX_TEXT_LENGTH = 200;
const MAX_RADIUS_KM = 50;
const DEFAULT_RADIUS_KM = 10;
const EXPIRY_DAYS: Record<DesireTimeWindow, number> = {
  this_week: 7,
  this_month: 30,
  no_rush: 90,
};

export type DesireWithMeta = DesireRow & { resonanceCount: number };

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createDesire(
  userId: string,
  input: {
    text: string;
    category: DesireCategory;
    timeWindow: DesireTimeWindow;
    circleId?: string | null;
    isOpen?: boolean;
    lat?: number | null;
    lng?: number | null;
    zoneLabel?: string | null;
  },
): Promise<DesireRow> {
  const text = input.text.trim();
  if (!text) throw new DesireValidationError('text is required');
  if (text.length > MAX_TEXT_LENGTH) {
    throw new DesireValidationError(`text must be ≤ ${MAX_TEXT_LENGTH} characters`);
  }
  const validCategories: DesireCategory[] = ['fun', 'creative', 'professional', 'growth'];
  if (!validCategories.includes(input.category)) {
    throw new DesireValidationError('invalid category');
  }
  const validWindows: DesireTimeWindow[] = ['this_week', 'this_month', 'no_rush'];
  if (!validWindows.includes(input.timeWindow)) {
    throw new DesireValidationError('invalid timeWindow');
  }
  // Require coordinates when opening to the map
  const isOpen = input.isOpen ?? false;
  if (isOpen && (input.lat == null || input.lng == null)) {
    throw new DesireValidationError('lat and lng are required when isOpen is true');
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS[input.timeWindow]);

  return insertDesire({
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

export async function openDesireToMap(
  desireId: string,
  userId: string,
  lat: number,
  lng: number,
  zoneLabel: string | null,
) {
  const desire = await getDesireById(desireId);
  if (!desire) throw new DesireValidationError('Desire not found');
  if (desire.userId !== userId) throw new DesireValidationError('Not your desire');
  await setDesireOpen(desireId, userId, true, lat, lng, zoneLabel?.trim() || null);
}

export async function closeDesireFromMap(desireId: string, userId: string) {
  const desire = await getDesireById(desireId);
  if (!desire) throw new DesireValidationError('Desire not found');
  if (desire.userId !== userId) throw new DesireValidationError('Not your desire');
  await setDesireOpen(desireId, userId, false, null, null, null);
}

// ─── Status changes ───────────────────────────────────────────────────────────

export async function fulfillDesire(desireId: string, userId: string) {
  const desire = await getDesireById(desireId);
  if (!desire) throw new DesireValidationError('Desire not found');
  if (desire.userId !== userId) throw new DesireValidationError('Not your desire');
  await updateDesireStatus(desireId, userId, 'fulfilled');
}

export async function removeDesire(desireId: string, userId: string) {
  const desire = await getDesireById(desireId);
  if (!desire) throw new DesireValidationError('Desire not found');
  if (desire.userId !== userId) throw new DesireValidationError('Not your desire');
  await deleteDesire(desireId, userId);
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function listMyDesires(userId: string): Promise<DesireWithMeta[]> {
  const rows = await getDesiresByUser(userId);
  const counts = await getResonanceCounts(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, resonanceCount: counts[r.id] ?? 0 }));
}

export async function listCircleDesires(circleId: string): Promise<DesireWithMeta[]> {
  const rows = await getDesiresByCircle(circleId);
  const counts = await getResonanceCounts(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, resonanceCount: counts[r.id] ?? 0 }));
}

export async function listNearbyDesires(
  lat: number,
  lng: number,
  radiusKm?: number,
): Promise<(DesireRow & { distanceKm: number; resonanceCount: number })[]> {
  const radius = Math.min(radiusKm ?? DEFAULT_RADIUS_KM, MAX_RADIUS_KM);
  const rows = await getNearbyOpenDesires(lat, lng, radius);
  const counts = await getResonanceCounts(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, resonanceCount: counts[r.id] ?? 0 }));
}

// ─── Resonances ───────────────────────────────────────────────────────────────

export async function resonateWithDesire(
  desireId: string,
  userId: string,
  type: 'resonate' | 'join_request' = 'resonate',
): Promise<ResonanceRow> {
  const desire = await getDesireById(desireId);
  if (!desire) throw new DesireValidationError('Desire not found');
  if (desire.userId === userId)
    throw new DesireValidationError('Cannot resonate with your own desire');
  if (desire.status !== 'active') throw new DesireValidationError('Desire is no longer active');
  return upsertResonance(desireId, userId, type);
}

export async function respondToResonance(
  desireId: string,
  ownerId: string,
  resonatingUserId: string,
  status: ResonanceStatus,
) {
  const desire = await getDesireById(desireId);
  if (!desire) throw new DesireValidationError('Desire not found');
  if (desire.userId !== ownerId) throw new DesireValidationError('Not your desire');
  await updateResonanceStatus(desireId, resonatingUserId, status);
}

export async function getDesireDetail(
  desireId: string,
): Promise<(DesireRow & { resonances: ResonanceRow[] }) | null> {
  const desire = await getDesireById(desireId);
  if (!desire) return null;
  const resonances = await getResonancesForDesire(desireId);
  return { ...desire, resonances };
}
